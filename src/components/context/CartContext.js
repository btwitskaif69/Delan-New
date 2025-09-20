import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';

// --- All the GraphQL operations our cart needs ---
const GET_CART = gql`
  query getCart($cartId: ID!) {
    cart(id: $cartId) {
      id
      checkoutUrl
      lines(first: 20) { edges { node { id quantity merchandise { ... on ProductVariant { id title image { url } price { amount currencyCode } } } } } }
      cost { subtotalAmount { amount currencyCode } }
    }
  }
`;

const CREATE_CART = gql`
  mutation cartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart { id checkoutUrl lines(first: 20) { edges { node { id quantity merchandise { ... on ProductVariant { id title image { url } price { amount currencyCode } } } } } } cost { subtotalAmount { amount currencyCode } } }
    }
  }
`;

const ADD_TO_CART = gql`
  mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart { id checkoutUrl lines(first: 20) { edges { node { id quantity merchandise { ... on ProductVariant { id title image { url } price { amount currencyCode } } } } } } cost { subtotalAmount { amount currencyCode } } }
    }
  }
`;

const UPDATE_CART_QUANTITY = gql`
  mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart { id checkoutUrl lines(first: 20) { edges { node { id quantity merchandise { ... on ProductVariant { id title image { url } price { amount currencyCode } } } } } } cost { subtotalAmount { amount currencyCode } } }
    }
  }
`;

const REMOVE_FROM_CART = gql`
  mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart { id checkoutUrl lines(first: 20) { edges { node { id quantity merchandise { ... on ProductVariant { id title image { url } price { amount currencyCode } } } } } } cost { subtotalAmount { amount currencyCode } } }
    }
  }
`;

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  
  const { data: initialCartData } = useQuery(GET_CART, {
    variables: { cartId: localStorage.getItem('shopify_cart_id') },
    skip: !localStorage.getItem('shopify_cart_id'),
  });

  useEffect(() => {
    if (initialCartData && initialCartData.cart) {
      setCart(initialCartData.cart);
    }
  }, [initialCartData]);

  const [createCartMutation] = useMutation(CREATE_CART);
  const [addToCartMutation] = useMutation(ADD_TO_CART);
  const [updateCartQuantityMutation] = useMutation(UPDATE_CART_QUANTITY);
  const [removeFromCartMutation] = useMutation(REMOVE_FROM_CART);

  const addToCart = async (variantId, quantity) => {
    let currentCartId = cart?.id || localStorage.getItem('shopify_cart_id');
    
    try {
      if (!currentCartId) {
        const { data } = await createCartMutation({
          variables: { input: { lines: [{ quantity, merchandiseId: variantId }] } }
        });
        currentCartId = data.cartCreate.cart.id;
        localStorage.setItem('shopify_cart_id', currentCartId);
        setCart(data.cartCreate.cart);
      } else {
        const existingLine = cart.lines.edges.find(edge => edge.node.merchandise.id === variantId);

        if (existingLine) {
          const { data } = await updateCartQuantityMutation({
            variables: {
              cartId: currentCartId,
              lines: [{
                id: existingLine.node.id,
                quantity: existingLine.node.quantity + quantity
              }]
            }
          });
          setCart(data.cartLinesUpdate.cart);
        } else {
          const { data } = await addToCartMutation({
            variables: { cartId: currentCartId, lines: [{ quantity, merchandiseId: variantId }] }
          });
          setCart(data.cartLinesAdd.cart);
        }
      }
    } catch (error) {
      console.error("Error modifying cart:", error);
    }
  };
  
  const removeFromCart = async (lineId) => {
    const currentCartId = cart?.id;
    if (!currentCartId) return;

    try {
      const { data } = await removeFromCartMutation({
        variables: {
          cartId: currentCartId,
          lineIds: [lineId]
        }
      });
      setCart(data.cartLinesRemove.cart);
    } catch (error) {
        console.error("Error removing item from cart:", error);
    }
  };

  const value = { cart, addToCart, removeFromCart };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
