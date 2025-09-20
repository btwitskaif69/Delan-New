import React from 'react'
import HeroSection from '../home/HeroSection'
import CategoriesSection from '../home/CategoriesSection'
import InteractiveModelSection from '../home/InteractiveModelSection'
import StatsCounter from '../home/StatsCounter'
import CoOrdsSection from '../home/CoOrdsSection'
import TopProducts from '../home/TopProducts'
import StickyNav from '../StickyNav'
import TrousersSection from '../home/TrousersSection'
import CuratedCollections from '../home/CuratedCollections'
import Categories from '../home/Categories'
import ShortDressSection from '../home/ShortDressSection'
import MaxiMidi from '../home/MaxiMidi'
import UspShowcase from '../home/UspShowcase'
import WatchAndBuy from '../home/WatchAndBuy'
import OfferSection from '../home/OfferSection'
import Testimonial from '../home/Testimonial'
import FlippingCard from '../home/FlippingCard'

const Home = () => {
  return (
    <main>
        <HeroSection/>
        <CategoriesSection/>
        <InteractiveModelSection/>
        <StatsCounter/>
        <CoOrdsSection/>
        <TopProducts/>
        <StickyNav/>
        <TrousersSection/>
        <CuratedCollections/>
        <Categories/>
        <ShortDressSection/>
        <MaxiMidi/>
        <UspShowcase/>
        <WatchAndBuy/>
        <OfferSection/>
        <Testimonial/>
        <FlippingCard/>
    </main>
  )
}

export default Home