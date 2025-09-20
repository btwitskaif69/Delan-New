// App.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from '@/components/pages/Home'
import Footer from "./components/Footer";
import Collection from "./components/pages/collection";
import Marquee from "./components/Marquee";
// import Product from "./components/pages/Product";

// --- simple placeholders (swap with your real pages)
const Account = () => <div className="p-6">Account</div>;
const Cart = () => <div className="p-6">Cart</div>;
const TrackOrder = () => <div className="p-6">Track Order</div>;
const Search = () => <div className="p-6">Search</div>;
const NotFound = () => <div className="p-6">404 – Not found</div>;

export default function App() {
  return (
    <main className="min-h-screen">
      <Marquee/>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/account" element={<Account />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/track-order" element={<TrackOrder />} />

        {/* Shopify-style routes you’ll likely need */}
        <Route path="/collections/:handle" element={<Collection />} />
        {/* <Route path="/products/:handle" element={<Product />} /> */}
        <Route path="/search" element={<Search />} />

        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
      <Footer/>
    </main>
  );
}
