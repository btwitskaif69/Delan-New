// App.jsx
import React from "react";
// 1. Import useLocation from react-router-dom
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from '@/components/pages/Home'
import Footer from "./components/Footer";
import Collection from "./components/pages/Collection";
import Marquee from "./components/Marquee";
import Product from "./components/pages/Product";

// --- simple placeholders (swap with your real pages)
const Account = () => <div className="p-6">Account</div>;
const Cart = () => <div className="p-6">Cart</div>;
const TrackOrder = () => <div className="p-6">Track Order</div>;
const NotFound = () => <div className="p-6">404 – Not found</div>;

export default function App() {
  // 2. Get the current location object
  const location = useLocation();

  // 3. Determine if the current path is a product page
  // The path for a product is /products/:handle, so we check if it starts with '/products/'
  const isProductPage = location.pathname.startsWith('/products/');

  return (
    <main className="min-h-screen">
      {/* 4. Conditionally render the Marquee. It will only show if it's NOT a product page. */}
      {!isProductPage && <Marquee />}

      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/account" element={<Account />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/track-order" element={<TrackOrder />} />

        {/* Shopify-style routes you’ll likely need */}
        <Route path="/collections/:handle" element={<Collection />} />
        <Route path="/products/:handle" element={<Product />} />

        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
      <Footer />
    </main>
  );
}