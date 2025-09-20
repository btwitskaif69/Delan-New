import React from 'react';
import { Link } from 'react-router-dom';
import { FaInstagram, FaFacebook, FaPinterest, FaYoutube } from 'react-icons/fa';
import logo from "@/assets/images/Delan-logo.svg"

const Footer = () => {
  return (
    <footer className="bg-accent text-primary">
      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Logo & Tagline */}
        <div className="flex flex-col space-y-4 md:col-span-1">
          <Link to="/" className="inline-block">
            <img
              src={logo}
              alt="DELAN brand logo"
              className="w-40 h-auto"
            />
          </Link>
          <p className="text-base font-medium">
            Timeless Elegance, Modern Sophistication.
          </p>
          <span className="text-sm leading-relaxed">
            Office Address: Shop No. 3, Sco-17, HUDA Staff Colony, Sector 16,
            Faridabad, Haryana 121002
          </span>
        </div>

        {/* Customer Service */}
        <div>
          <h4 className="text-lg font-semibold mb-4">Customer Service</h4>
          <ul className="space-y-2">
            <li><Link to="/contact" className="hover:text-primary/90">Contact</Link></li>
            <li><Link to="/returns-exchange" className="hover:text-primary/90">Return/Exchange</Link></li>
            <li><Link to="/privacy-policy" className="hover:text-primary/90">Privacy Policy</Link></li>
            <li><Link to="/terms-conditions" className="hover:text-primary/90">Terms & Conditions</Link></li>
          </ul>
        </div>

        {/* Company */}
        <div>
          <h4 className="text-lg font-semibold mb-4">Company</h4>
          <ul className="space-y-2">
            <li><Link to="/about-us" className="hover:text-primary/90">About Us</Link></li>
            <li><Link to="/affiliate-program" className="hover:text-primary/90">Affiliate Marketing</Link></li>
            <li><Link to="/blogs/news" className="hover:text-primary/90">Blog</Link></li>
          </ul>
        </div>

        {/* Social Icons */}
        <div>
          <h4 className="text-lg font-semibold mb-4">Follow Us</h4>
          <div className="flex space-x-4 text-2xl">
            <a
              href="https://www.instagram.com/delan.in/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="hover:text-pink-500"
            >
              <FaInstagram />
            </a>
            <a
              href="https://www.facebook.com/delanonlinestore"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="hover:text-blue-600"
            >
              <FaFacebook />
            </a>
            <a
              href="https://www.pinterest.com/delan"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Pinterest"
              className="hover:text-red-600"
            >
              <FaPinterest />
            </a>
            <a
              href="https://www.youtube.com/@delan"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
              className="hover:text-red-500"
            >
              <FaYoutube />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-accent text-center py-4 text-sm">
        &copy; {new Date().getFullYear()} Delan. All Rights Reserved.
      </div>
    </footer>
  );
};

export default Footer;