/* -----------------------------------------
   Central place for all Shopify GraphQL queries
   Import from here:  import { GET_PRODUCTS } from "@/lib/shopifyQueries"
-------------------------------------------- */

export const GET_PRODUCTS = /* GraphQL */ `
  query getProducts($first: Int!) {
    products(first: $first) {
      edges {
        node {
          id
          title
          description
          handle
          images(first: 1) { edges { node { src altText } } }
          priceRange { minVariantPrice { amount currencyCode } }
        }
      }
    }
  }
`;

export const GET_PRODUCT_BY_HANDLE = `
  query getProductByHandle($handle: String!) {
    product(handle: $handle) {
      id
      title
      handle
      descriptionHtml
      options(first: 10) { id name values }
      images(first: 20) { edges { node { url altText } } }
      variants(first: 50) {
        edges {
          node {
            id
            title
            availableForSale
            sku
            image { url altText }
            price { amount currencyCode }
            compareAtPrice { amount currencyCode }
            selectedOptions { name value }
          }
        }
      }
      metafields(identifiers: [
        { namespace: "air_reviews_product", key: "data" },
        { namespace: "air_reviews_product", key: "review_avg" },
        { namespace: "air_reviews_product", key: "review_count" },
        { namespace: "promo", key: "banner" },
        { namespace: "promo", key: "banner_text" },
        { namespace: "promo", key: "banner_bg" },
        { namespace: "promo", key: "banner_fg" },
        { namespace: "promo", key: "banner_code" },
        { namespace: "promo", key: "banner_valid_till" },
        { namespace: "promo", key: "banner_min_amount" }
      ]) {
        key
        namespace
        type
        value
      }
    }
    shop {
      metafield(namespace: "promo", key: "global_banner") {
        type
        value
      }
    }
  }
`;

export const GET_COLLECTIONS = /* GraphQL */ `
  query getCollections($first: Int!) {
    collections(first: $first) {
      edges {
        node {
          id
          handle
          title
          description
          image { src altText }
        }
      }
    }
  }
`;

export const GET_PRODUCTS_BY_COLLECTION = /* GraphQL */ `
  query getProductsByCollection($handle: String!, $first: Int!) {
    collectionByHandle(handle: $handle) {
      id
      title
      products(first: $first) {
        edges {
          node {
            id
            title
            handle
            images(first: 1) { edges { node { src altText } } }
            priceRange { minVariantPrice { amount currencyCode } }
          }
        }
      }
    }
  }
`;

export const CREATE_CART = /* GraphQL */ `
  mutation createCart {
    cartCreate {
      cart {
        id
        checkoutUrl
        lines(first: 10) { edges { node { id quantity } } }
        cost { subtotalAmount { amount currencyCode } }
      }
      userErrors { field message }
    }
  }
`;

export const ADD_LINES_TO_CART = /* GraphQL */ `
  mutation addLinesToCart($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        id
        checkoutUrl
        lines(first: 50) { edges { node { id quantity } } }
        cost { subtotalAmount { amount currencyCode } }
      }
      userErrors { field message }
    }
  }
`;

export const UPDATE_CART_LINE = /* GraphQL */ `
  mutation updateCartLine($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart { id checkoutUrl lines(first: 50) { edges { node { id quantity } } } }
      userErrors { field message }
    }
  }
`;

export const REMOVE_CART_LINE = /* GraphQL */ `
  mutation removeCartLine($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart { id checkoutUrl lines(first: 50) { edges { node { id quantity } } } }
      userErrors { field message }
    }
  }
`;

export const GET_MENU = /* GraphQL */ `
  query getMenu($handle: String!) {
    menu(handle: $handle) {
      id
      items {
        title
        url
        items { title url items { title url } }
      }
    }
  }
`;

export const SEARCH_PRODUCTS = /* GraphQL */ `
  query searchProducts($query: String!, $first: Int!) {
    products(first: $first, query: $query) {
      edges {
        node {
          id
          title
          handle
          images(first: 1) { edges { node { src altText } } }
          priceRange { minVariantPrice { amount currencyCode } }
        }
      }
    }
  }
`;

// Co-ords products by collection handle
export const GET_COLLECTION_PRODUCTS = /* GraphQL */ `
  query getCollectionProducts($handle: String!, $first: Int!) {
    collection(handle: $handle) {
      products(first: $first) {
        edges {
          node {
            id
            title
            handle
            images(first: 1) {
              edges {
                node {
                  url
                  altText
                }
              }
            }
          }
        }
      }
    }
  }
`;

// ✅ use plain string, not gql
export const GET_TOP_PRODUCTS = /* GraphQL */ `
  query getTopProducts($handle: String!) {
    collection(handle: $handle) {
      title
      products(first: 8) {
        edges {
          node {
            id
            title
            handle
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            images(first: 1) {
              edges {
                node {
                  url
                  altText
                }
              }
            }
            rating: metafield(namespace: "reviews", key: "rating") {
              value
            }
            variants(first: 1) {
              edges {
                node {
                  id
                  availableForSale
                }
              }
            }
          }
        }
      }
    }
  }
`;

// ✅ use plain string, not gql
export const CART_CREATE = /* GraphQL */ `
  mutation cartCreate($lines: [CartLineInput!]!) {
    cartCreate(input: { lines: $lines }) {
      cart { id checkoutUrl totalQuantity }
      userErrors { field message }
    }
  }
`;

// ✅ use plain string, not gql
export const CART_LINES_ADD = /* GraphQL */ `
  mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart { id totalQuantity }
      userErrors { field message }
    }
  }
`;

// GET_CURATED_THREE with product-image fallback + url/src compatibility
export const GET_CURATED_THREE = /* GraphQL */ `
  query CuratedCollections($h1: String!, $h2: String!, $h3: String!) {
    c1: collection(handle: $h1) {
      id
      handle
      title
      image { url altText src }
      products(first: 1) {
        edges {
          node {
            images(first: 1) {
              edges { node { url altText src } }
            }
          }
        }
      }
    }
    c2: collection(handle: $h2) {
      id
      handle
      title
      image { url altText src }
      products(first: 1) {
        edges {
          node {
            images(first: 1) {
              edges { node { url altText src } }
            }
          }
        }
      }
    }
    c3: collection(handle: $h3) {
      id
      handle
      title
      image { url altText src }
      products(first: 1) {
        edges {
          node {
            images(first: 1) {
              edges { node { url altText src } }
            }
          }
        }
      }
    }
  }
`;


// Products with pricing for offer detection (no gql tag)
export const GET_OFFER_PRODUCTS = /* GraphQL */ `
  query getOfferProducts($first: Int!) {
    products(first: $first, sortKey: BEST_SELLING) {
      edges {
        node {
          id
          title
          handle

          # fetch 2 if you might crossfade on hover (optional here)
          images(first: 2) {
            edges {
              node {
                url
                altText
              }
            }
          }

          # keep variants so we can compute discounts client-side
          variants(first: 10) {
            edges {
              node {
                id
                availableForSale
                price { amount currencyCode }
                compareAtPrice { amount currencyCode }
              }
            }
          }

          # ⭐ add rating metafield (adjust namespace/key to your setup)
          rating: metafield(namespace: "reviews", key: "rating") {
            value
          }
        }
      }
    }
  }
`;

// OPTIONAL: If you have a "sale" collection handle in your store
export const GET_SALE_COLLECTION_PRODUCTS = /* GraphQL */ `
  query getSaleCollectionProducts($handle: String!, $first: Int!) {
    collection(handle: $handle) {
      id
      title
      products(first: $first) {
        edges {
          node {
            id
            title
            handle
            images(first: 1) { edges { node { url altText } } }
            variants(first: 10) {
              edges {
                node {
                  id
                  availableForSale
                  price { amount currencyCode }
                  compareAtPrice { amount currencyCode }
                }
              }
            }
          }
        }
      }
    }
  }
`;

// Fetch testimonials (metaobjects) — no gql tag
export const GET_TESTIMONIALS = /* GraphQL */ `
  query getTestimonials($type: String!, $first: Int!) {
    metaobjects(type: $type, first: $first) {
      edges {
        node {
          id
          handle
          name:  field(key: "name")  { value }
          role:  field(key: "role")  { value }
          quote: field(key: "quote") { value }
          rating: field(key: "rating") { value }
          avatar: field(key: "avatar") {
            reference {
              __typename
              ... on MediaImage {
                image {
                  url
                  altText
                }
              }
            }
          }
        }
      }
    }
  }
`;
// Approved Air Reviews from product metafield (namespace: "air_reviews_product", key: "data")
export const GET_PRODUCTS_WITH_REVIEWS = /* GraphQL */ `
  query getProductsWithReviews($first: Int!) {
    products(first: $first, sortKey: UPDATED_AT, reverse: true) {
      edges {
        node {
          id
          title
          handle
          images(first: 1) {
            edges { node { url altText } }
          }
          metafields(
            identifiers: [{ namespace: "air_reviews_product", key: "data" }]
          ) {
            key
            namespace
            value
          }
        }
      }
    }
  }
`;

// Product-to-product recommendations by Shopify
export const GET_PRODUCT_RECOMMENDATIONS = /* GraphQL */ `
  query getProductRecommendations($productId: ID!) {
    productRecommendations(productId: $productId) {
      id
      title
      handle
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
      }
      images(first: 1) {
        edges {
          node {
            url
            altText
          }
        }
      }
    }
  }
`;

// Fetch a compact product card by handle (works with url/src for compatibility)
export const GET_PRODUCT_CARD_BY_HANDLE = /* GraphQL */ `
  query getProductCardByHandle($handle: String!) {
    product(handle: $handle) {
      id
      title
      handle
      images(first: 1) {
        edges {
          node {
            url
            src
            altText
          }
        }
      }
      priceRange {
        minVariantPrice { amount currencyCode }
      }
    }
  }
`;
export const GET_PRODUCT_REVIEWS = /* GraphQL */ `
  query getProductReviews($handle: String!) {
    product(handle: $handle) {
      id
      title
      metafields(
        identifiers: [{ namespace: "air_reviews_product", key: "data" }]
      ) {
        key
        namespace
        value
      }
    }
  }
`;

export const NEWSLETTER_SIGNUP = /* GraphQL */ `
  mutation NewsletterSignup(
    $email: String!
    $password: String!
    $acceptsMarketing: Boolean!
    $phone: String
  ) {
    customerCreate(input: {
      email: $email
      password: $password
      acceptsMarketing: $acceptsMarketing
      phone: $phone
    }) {
      customer {
        id
        email
        phone
        acceptsMarketing
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;