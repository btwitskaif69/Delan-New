import React from 'react'
import TopProductsMarquee from '../Product/TopProductsMarquee'
import ProductHeader from '../Product/ProductHeader'
import WhyLoveAndDetails from '../Product/WhyLoveAndDetails'
import SuggestionSection from '../Product/SuggestionSection'
import RecentlyViewed from '../Product/RecentlyViewed'
import ProductUSP from '../Product/ProductUSP'
import ProducrReview from '../Product/ProductReview'
import DelanShiny from '../home/DelanShiny'

const Product = () => {
  return (
    <main>
        <TopProductsMarquee/>
        <ProductHeader/>
        <WhyLoveAndDetails/>
        <SuggestionSection/>
        <RecentlyViewed/>
        <ProductUSP/>
        <ProducrReview/>
        <DelanShiny/>
    </main>
  )
}

export default Product