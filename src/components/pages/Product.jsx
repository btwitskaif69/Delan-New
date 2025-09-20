// // src/pages/ProductPage.jsx
// import React, { useState, useEffect, useMemo, useCallback } from "react";
// import { useParams } from "react-router-dom";
// // import InnerImageZoom from "react-inner-image-zoom";
// // import "react-inner-image-zoom/lib/styles.min.css";

// import { shopify } from "@/lib/shopify";
// import { GET_PRODUCT_BY_HANDLE } from "@/lib/queries";

// import { useCart } from "@/components/context/CartContext";

// import { Card, CardContent } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Separator } from "@/components/ui/separator";
// import {
//   Accordion,
//   AccordionItem,
//   AccordionTrigger,
//   AccordionContent,
// } from "@/components/ui/accordion";
// import { Badge } from "@/components/ui/badge";
// import { Minus, Plus, Heart, Star } from "lucide-react";

// // Extras you already use
// // import AddReviewForm from "@/components/AddReviewForm";
// // import RelatedProducts from "@/components/RelatedProducts";
// // import RecentlyViewed from "@/components/RecentlyViewed";
// // import ShineSection from "@/components/ShineSection";
// // import ReviewList from "@/components/ReviewList";
// // import ProductUSP from "@/components/ProductUSP";
// import InstagramCircles from "@/components/InstagramCircles";
// import TopProductsMarquee from "@/components/TopProductsMarquee";

// /* ------------------------------- helpers -------------------------------- */

// const BRAND = "#642c44";

// function StarRow({ value = 0 }) {
//   const v = Math.max(0, Math.min(5, Math.round(Number(value) || 0)));
//   return (
//     <div className="flex items-center gap-0.5 text-yellow-500">
//       {Array.from({ length: 5 }).map((_, i) => (
//         <Star
//           key={i}
//           className="h-4 w-4"
//           fill={i < v ? "currentColor" : "none"}
//           strokeWidth={1.5}
//         />
//       ))}
//     </div>
//   );
// }

// function Price({ amount, code, compareAt }) {
//   const n = Number(amount ?? 0);
//   const c = compareAt ? Number(compareAt) : null;
//   return (
//     <div className="flex items-baseline gap-2">
//       <span className="text-2xl font-semibold text-[color:var(--brand-642,#642c44)]">
//         ₹{Number.isFinite(n) ? n.toFixed(0) : "0"} {code}
//       </span>
//       {Number.isFinite(c) && c > n ? (
//         <span className="text-sm text-neutral-500 line-through">
//           ₹{c.toFixed(0)} {code}
//         </span>
//       ) : null}
//     </div>
//   );
// }

// function normalizeImage(node) {
//   // Support both Shopify image shapes: {url} and legacy {src}
//   return { url: node?.url || node?.src || "", altText: node?.altText || "" };
// }

// function parseReviewsMetafield(product) {
//   let reviews = [];
//   const mf = product?.metafields?.find(
//     (m) => m?.namespace === "air_reviews_product" && m?.key === "data"
//   );
//   if (mf?.value) {
//     try {
//       const parsed = JSON.parse(mf.value);
//       reviews = parsed?.reviews || [];
//     } catch (e) {
//       console.warn("Failed to parse reviews metafield:", e);
//     }
//   }
//   const approved = reviews.filter((r) => r.status === "approved");
//   const avg =
//     approved.length > 0
//       ? (approved.reduce((s, r) => s + (r.rate || 0), 0) / approved.length).toFixed(1)
//       : null;
//   return { approved, avg };
// }

// /* --------------------------------- page ---------------------------------- */

// export default function ProductPage() {
//   const { handle } = useParams();
//   const { addToCart } = useCart();

//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   const [product, setProduct] = useState(null);

//   const [selectedOptions, setSelectedOptions] = useState({});
//   const [quantity, setQuantity] = useState(1);
//   const [mainImage, setMainImage] = useState(null);

//   const [showToast, setShowToast] = useState(false);
//   const [accordionValue, setAccordionValue] = useState([]);

//   // Recently viewed
//   useEffect(() => {
//     if (!handle) return;
//     const history = JSON.parse(localStorage.getItem("recentlyViewed") || "[]");
//     const updated = [handle, ...history.filter((h) => h !== handle)].slice(0, 5);
//     localStorage.setItem("recentlyViewed", JSON.stringify(updated));
//   }, [handle]);

//   // Fetch product via your shopify() helper
//   useEffect(() => {
//     let cancelled = false;
//     (async () => {
//       setLoading(true);
//       setError("");
//       try {
//         const data = await shopify(GET_PRODUCT_BY_HANDLE, { handle });
//         if (cancelled) return;

//         const prod = data?.product || null;
//         setProduct(prod);

//         // Set defaults (first option value + first image)
//         if (prod) {
//           const initial = {};
//           (prod.options || []).forEach((opt) => {
//             initial[opt.name] = opt.values?.[0];
//           });
//           setSelectedOptions(initial);

//           const firstImgNode = normalizeImage(prod.images?.edges?.[0]?.node);
//           setMainImage(firstImgNode.url ? firstImgNode : null);
//         }
//       } catch (e) {
//         if (!cancelled) setError(e?.message || "Failed to load product.");
//       } finally {
//         if (!cancelled) setLoading(false);
//       }
//     })();
//     return () => {
//       cancelled = true;
//     };
//   }, [handle]);

//   // Variant selection
//   const selectedVariant = useMemo(() => {
//     if (!product) return null;
//     return (
//       product.variants?.edges?.find(({ node }) =>
//         node.selectedOptions.every((opt) => selectedOptions[opt.name] === opt.value)
//       )?.node || null
//     );
//   }, [product, selectedOptions]);

//   // Reviews
//   const { approved: approvedReviews, avg: avgRating } = useMemo(
//     () => parseReviewsMetafield(product),
//     [product]
//   );

//   // Option click
//   const onOptionClick = (optionName, value) => {
//     const next = { ...selectedOptions, [optionName]: value };
//     setSelectedOptions(next);

//     // Update main image to variant image if present
//     const newVariant = product?.variants?.edges?.find(({ node }) =>
//       node.selectedOptions.every((opt) => next[opt.name] === opt.value)
//     )?.node;

//     if (newVariant?.image) {
//       const im = normalizeImage(newVariant.image);
//       setMainImage(im.url ? im : null);
//     } else {
//       const firstImgNode = normalizeImage(product?.images?.edges?.[0]?.node);
//       setMainImage(firstImgNode.url ? firstImgNode : null);
//     }
//   };

//   // Add to cart
//   const handleAdd = useCallback(() => {
//     if (!selectedVariant || !selectedVariant.availableForSale) {
//       alert("Please select available options.");
//       return;
//     }
//     addToCart(selectedVariant.id, quantity);
//     setShowToast(true);
//     setTimeout(() => setShowToast(false), 2200);
//     // If your Navbar listens for cart updates via window events, you can emit here.
//     // window.dispatchEvent(new CustomEvent("cart:updated", { detail: { totalQuantity: ??? } }));
//   }, [addToCart, selectedVariant, quantity]);

//   /* ------------------------------ UI states ------------------------------ */

//   if (loading) {
//     return (
//       <div className="mx-auto max-w-7xl px-4 md:px-8 py-24 text-center">
//         <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-500" />
//         <p className="mt-3 text-sm text-neutral-500">Loading product…</p>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="mx-auto max-w-3xl px-4 md:px-8 py-24 text-center">
//         <p className="text-red-600">Error: {error}</p>
//       </div>
//     );
//   }

//   if (!product) {
//     return (
//       <div className="mx-auto max-w-3xl px-4 md:px-8 py-24 text-center">
//         <p className="text-neutral-700">Product not found.</p>
//       </div>
//     );
//   }

//   /* ------------------------------- render -------------------------------- */

//   const firstPrice =
//     selectedVariant?.price ?? product.variants?.edges?.[0]?.node?.price;
//   const firstCompare = selectedVariant?.compareAtPrice;

//   const images = (product.images?.edges || []).map(({ node }) => normalizeImage(node));

//   return (
//     <>
//       {/* Top marquee / promo */}
//       <div className="border-b bg-white">
//         <TopProductsMarquee />
//       </div>

//       <div className="mx-auto max-w-7xl px-4 md:px-8 py-8 lg:py-12">
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
//           {/* LEFT: gallery + “Why you'll love this” */}
//           <div className="flex flex-col gap-6">
//             <div className="grid grid-cols-[80px,1fr] gap-4 items-start">
//               {/* Thumbs (vertical on desktop, horizontal on small) */}
//               <div className="hidden sm:flex flex-col gap-2 max-h-[560px] overflow-auto pr-1">
//                 {images.map((img, i) => (
//                   <button
//                     key={i}
//                     onClick={() => setMainImage(img)}
//                     className={`relative block overflow-hidden rounded-lg border ${
//                       mainImage?.url === img.url
//                         ? "border-[color:var(--brand-642,#642c44)]"
//                         : "border-neutral-200"
//                     }`}
//                     aria-label={`Thumbnail ${i + 1}`}
//                   >
//                     <img
//                       src={img.url}
//                       alt={img.altText || product.title}
//                       className="h-20 w-20 object-cover"
//                       loading="lazy"
//                       decoding="async"
//                     />
//                   </button>
//                 ))}
//               </div>

//               {/* Main image with zoom */}
//               <Card className="overflow-hidden">
//                 <CardContent className="p-0">
//                   {mainImage && (
//                     <InnerImageZoom
//                       src={mainImage.url}
//                       zoomSrc={mainImage.url}
//                       alt={mainImage.altText || product.title}
//                       zoomType="hover"
//                       zoomPreload
//                       fullscreenOnMobile
//                     />
//                   )}
//                 </CardContent>
//               </Card>

//               {/* Mobile thumbs */}
//               <div className="sm:hidden col-span-2 -mt-2 flex gap-2 overflow-x-auto">
//                 {images.map((img, i) => (
//                   <button
//                     key={i}
//                     onClick={() => setMainImage(img)}
//                     className={`overflow-hidden rounded-md border ${
//                       mainImage?.url === img.url
//                         ? "border-[color:var(--brand-642,#642c44)]"
//                         : "border-neutral-200"
//                     }`}
//                   >
//                     <img
//                       src={img.url}
//                       alt={img.altText || product.title}
//                       className="h-16 w-16 object-cover"
//                     />
//                   </button>
//                 ))}
//               </div>
//             </div>

//             {/* Why you'll love this */}
//             <Card>
//               <CardContent className="p-5">
//                 <h2 className="text-lg font-semibold text-neutral-900 mb-3">
//                   Why You’ll Love This
//                 </h2>
//                 <div
//                   className="prose prose-sm max-w-none text-neutral-700"
//                   dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
//                 />
//               </CardContent>
//             </Card>
//           </div>

//           {/* RIGHT: details / actions */}
//           <div className="flex flex-col">
//             <div className="mb-3">
//               <h1 className="font-primary text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-900">
//                 {product.title}
//               </h1>
//               <p className="mt-1 text-sm text-neutral-500">Designed for Timeless Elegance</p>
//             </div>

//             <div className="flex items-center justify-between flex-wrap gap-3">
//               <Price
//                 amount={firstPrice?.amount}
//                 code={firstPrice?.currencyCode}
//                 compareAt={firstCompare?.amount}
//               />
//               {avgRating ? (
//                 <div className="flex items-center gap-2">
//                   <StarRow value={Number(avgRating)} />
//                   <span className="text-sm text-neutral-600">
//                     {avgRating}/5 ({approvedReviews.length})
//                   </span>
//                 </div>
//               ) : (
//                 <span className="text-sm text-neutral-500">No reviews yet</span>
//               )}
//             </div>

//             <Separator className="my-5" />

//             {/* Variants */}
//             {product.options?.map((opt) => (
//               <div key={opt.id} className="mb-5">
//                 <div className="mb-2 text-sm font-medium text-neutral-900">
//                   {opt.name}:{" "}
//                   <span className="font-normal text-neutral-600">
//                     {selectedOptions[opt.name]}
//                   </span>
//                 </div>
//                 <div className="flex flex-wrap gap-2">
//                   {opt.values?.map((val) => {
//                     const active = selectedOptions[opt.name] === val;
//                     return (
//                       <Button
//                         key={val}
//                         type="button"
//                         variant={active ? "default" : "outline"}
//                         className={`h-9 rounded-full px-4 ${
//                           active
//                             ? "bg-[color:var(--brand-642,#642c44)] hover:bg-[#4f2a3d] text-white"
//                             : "border-neutral-300"
//                         }`}
//                         onClick={() => onOptionClick(opt.name, val)}
//                       >
//                         {val}
//                       </Button>
//                     );
//                   })}
//                 </div>
//               </div>
//             ))}

//             {/* Actions */}
//             <div className="flex items-center gap-3 mb-5">
//               {/* Qty stepper */}
//               <div className="inline-flex items-center rounded-full border border-neutral-300">
//                 <button
//                   type="button"
//                   className="h-10 w-10 grid place-items-center rounded-l-full hover:bg-neutral-50"
//                   onClick={() => setQuantity((q) => Math.max(1, q - 1))}
//                   aria-label="Decrease quantity"
//                 >
//                   <Minus className="h-4 w-4" />
//                 </button>
//                 <span className="px-4 tabular-nums text-sm">{quantity}</span>
//                 <button
//                   type="button"
//                   className="h-10 w-10 grid place-items-center rounded-r-full hover:bg-neutral-50"
//                   onClick={() => setQuantity((q) => q + 1)}
//                   aria-label="Increase quantity"
//                 >
//                   <Plus className="h-4 w-4" />
//                 </button>
//               </div>

//               {/* Add to Cart */}
//               <Button
//                 className="flex-1 h-10 rounded-full bg-[color:var(--brand-642,#642c44)] hover:bg-[#4f2a3d]"
//                 onClick={handleAdd}
//                 disabled={!selectedVariant || !selectedVariant.availableForSale}
//               >
//                 {selectedVariant?.availableForSale ? "Add to Cart" : "Sold Out"}
//               </Button>

//               {/* Wishlist */}
//               <Button
//                 type="button"
//                 variant="outline"
//                 className="h-10 w-10 rounded-full border-neutral-300"
//                 aria-label="Add to wishlist"
//               >
//                 <Heart className="h-4 w-4" />
//               </Button>
//             </div>

//             {/* Offer */}
//             <div className="mb-6">
//               <Badge
//                 variant="secondary"
//                 className="rounded-full bg-rose-50 text-[color:var(--brand-642,#642c44)] border border-rose-100 px-3 py-1"
//               >
//                 Flat 10% off on first purchase, up to ₹500
//               </Badge>
//             </div>

//             <InstagramCircles />

//             {/* Details / care accordion */}
//             <Accordion
//               type="multiple"
//               value={accordionValue}
//               onValueChange={setAccordionValue}
//               className="mt-6"
//             >
//               <AccordionItem value="highlights" className="border-b">
//                 <AccordionTrigger className="text-base font-medium">
//                   Highlights
//                 </AccordionTrigger>
//                 <AccordionContent>
//                   <ul className="list-disc pl-5 text-sm text-neutral-700 space-y-1">
//                     <li>Built in cups that stay in place</li>
//                     <li>No see-through</li>
//                     <li>Anti-camel toe</li>
//                     <li>Chlorine resistant</li>
//                   </ul>
//                 </AccordionContent>
//               </AccordionItem>
//               <AccordionItem value="fabric" className="border-b">
//                 <AccordionTrigger className="text-base font-medium">
//                   Fabric Details
//                 </AccordionTrigger>
//                 <AccordionContent>
//                   <ul className="list-disc pl-5 text-sm text-neutral-700 space-y-1">
//                     <li>80% Nylon – Comfort &amp; freedom in/out of water</li>
//                     <li>20% Spandex – Durability and stretch</li>
//                   </ul>
//                 </AccordionContent>
//               </AccordionItem>
//               <AccordionItem value="wash">
//                 <AccordionTrigger className="text-base font-medium">
//                   Wash-Care Details
//                 </AccordionTrigger>
//                 <AccordionContent>
//                   <ul className="list-disc pl-5 text-sm text-neutral-700 space-y-1">
//                     <li>Line dry in shade</li>
//                   </ul>
//                 </AccordionContent>
//               </AccordionItem>
//             </Accordion>

//             {/* Review form */}
//             <div className="mt-8">
//               <AddReviewForm
//                 productId={product.id}
//                 productHandle={product.handle}
//                 productTitle={product.title}
//                 productImage={mainImage?.url}
//                 productSku={selectedVariant?.sku}
//               />
//             </div>
//           </div>
//         </div>

//         {/* Toast */}
//         <div
//           className={`fixed bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-neutral-900 text-white px-4 py-2 text-sm shadow-lg transition-all duration-300 ${
//             showToast ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3 pointer-events-none"
//           }`}
//         >
//           ✅ {quantity} × {product.title} added to cart
//         </div>

//         {/* Below the fold */}
//         <div className="mt-12">
//           <RelatedProducts productId={product.id} />
//         </div>

//         <div className="mt-12">
//           <RecentlyViewed currentProductHandle={product.handle} />
//         </div>

//         <div className="mt-12">
//           <ProductUSP />
//         </div>

//         <div className="mt-12">
//           <ReviewList reviews={approvedReviews} />
//         </div>

//         <div className="mt-16">
//           <ShineSection text="Own It #TrustYourStyle" />
//         </div>
//       </div>
//     </>
//   );
// }
