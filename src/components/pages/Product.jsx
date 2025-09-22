import React from 'react'
import TopProductsMarquee from '../Product/TopProductsMarquee'
import ProductHeader from '../Product/ProductHeader'
import WhyLoveAndDetails from '../Product/WhyLoveAndDetails'
import SuggestionSection from '../Product/SuggestionSection'

const Product = () => {
  return (
    <main>
        <TopProductsMarquee/>
        <ProductHeader/>
        <WhyLoveAndDetails/>
        <SuggestionSection/>
    </main>
  )
}

export default Product