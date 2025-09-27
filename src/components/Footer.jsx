import React from 'react';
import { Link } from 'react-router-dom';
import { FaInstagram, FaFacebook, FaPinterest, FaYoutube } from 'react-icons/fa';
import logo from "@/assets/images/Delan-logo.svg"
import american from "@/assets/logos/american.svg";
import paytm from "@/assets/logos/paytm.svg";
import mastercard from "@/assets/logos/mastercard.svg";
import visa from "@/assets/logos/visa.svg";

const Footer = () => {
  return (
    <footer className="bg-accent text-primary">
      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Logo & Tagline */}
        <div className="flex flex-col space-y-4 md:col-span-1">

          <p className="text-base leading-relaxed montserrat-500">
            Delan delivers everyday luxury through timeless essentials crafted for modern comfort, lasting quality, and effortless versatility.
          </p>
        </div>

        {/* Customer Service */}
        <div>
          <h4 className="text-lg montserrat-600 mb-4 hover:underline">Customer Service</h4>
          <ul className="space-y-2 montserrat-500">
            <li><Link to="/contact" className="hover:text-primary/90">Contact</Link></li>
            <li><Link to="/returns-exchange" className="hover:text-primary/90">Return/Exchange</Link></li>
            <li><Link to="/privacy-policy" className="hover:text-primary/90">Privacy Policy</Link></li>
            <li><Link to="/terms-conditions" className="hover:text-primary/90">Terms & Conditions</Link></li>
            <li><Link to="/terms-conditions" className="hover:text-primary/90">FAQ</Link></li>

          </ul>
        </div>

        {/* Company */}
        <div>
          <h4 className="text-lg montserrat-600 mb-4 hover:underline">Company</h4>
          <ul className="space-y-2 montserrat-500">
            <li><Link to="/about-us" className="hover:text-primary/90">About Us</Link></li>
            <li><Link to="/affiliate-program" className="hover:text-primary/90">Affiliate Marketing</Link></li>
            <li><Link to="/blogs/news" className="hover:text-primary/90">Blog</Link></li>
          </ul>

          {/* Secure Payment (below Company section) */}
          <div className="mt-5" aria-label="Secure Payment Methods">
            <h5 className="text-lg montserrat-600 mb-3 hover:underline">Secure Payment</h5>
            <div className="flex items-center gap-4 flex-wrap">
              <img src={visa} alt="Visa" className="h-6 w-auto object-contain" loading="lazy" />
              <img src={paytm} alt="Paytm" className="h-3.5 w-auto object-contain" loading="lazy" />
              <img src={mastercard} alt="Mastercard" className="h-6 w-auto object-contain" loading="lazy" />
              <img src={american} alt="American Express" className="h-6 w-auto object-contain" loading="lazy" />
            </div>
          </div>
        </div>

        {/* Social + Address */}
        <div>
          <h4 className="text-lg montserrat-600 mb-4 hover:underline">Follow Us</h4>
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

          {/* Address */}
          <address className="not-italic text-sm leading-relaxed mt-5 montserrat-500">
            <span className="block text-lg montserrat-600 mb-3 hover:underline">Office Address</span>
            Shop No. 3, Sco-17, HUDA Staff Colony, Sector 16,<br />
            Faridabad, Haryana 121002
          </address>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-accent montserrat-500 text-center py-4 text-sm border-t border-primary/20">
        &copy; {new Date().getFullYear()} Delan. All Rights Reserved.
      </div>
    </footer>
  );
};

export default Footer;
