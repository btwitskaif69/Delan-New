import React from "react";
import { Link } from "react-router-dom";
import Maxi from '@/assets/images/categories1.png'
import ShortDress from '@/assets/images/categories2.png'
import Coords from '@/assets/images/categories3.png'
import Trousers from '@/assets/images/categories4.png'


import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const baseCategories = [
  { title: "Maxi & Midi Dress", handle: "maxi-midi-dress", image: Maxi },
  { title: "Short Dress",       handle: "short-dress",     image: ShortDress },
  { title: "Co-ords",           handle: "co-ords",         image: Coords },
  { title: "Trousers",          handle: "trousers",        image: Trousers },
];

const categories = [...baseCategories, ...baseCategories];

export default function CategoriesSection() {
  return (
    <section className="w-full px-4 md:px-8 lg:px-12 py-12">
      <h2 className="text-center cormorant-garamond-700 uppercase text-primary text-3xl md:text-4xl lg:text-4xl font-semibold">
        Discover Your Signature Look
      </h2>

      <div className="relative mt-8">
        <Carousel
          opts={{ align: "center", loop: true }}
          className="w-full"
        >
          {/* spacing between slides via negative margin on the track + padding on items */}
          <CarouselContent className="-ml-4">
            {categories.map((cat, idx) => (
              <CarouselItem
                key={`${cat.handle}-${idx}`}
                className="pl-4 basis-full sm:basis-1/2 lg:basis-1/3"
              >
                <Link
                  to={`/collections/${cat.handle}`}
                  aria-label={cat.title}
                  className="block group"
                >
                  <Card className="overflow-hidden rounded-2xl shadow-sm hover:shadow-md transition-shadow py-0!">
                    <CardContent className="p-0">
                      <div className="relative aspect-[4/3] w-full overflow-hidden">
                        <img
                          src={cat.image}
                          alt={cat.title}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                          loading="lazy"
                          decoding="async"
                        />
                        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/35 to-transparent" />
                      </div>

                    </CardContent>
                  </Card>
                </Link>
              </CarouselItem>
            ))}
          </CarouselContent>

          {/* nav arrows (show from md and up) */}
          <CarouselPrevious className="hidden md:flex left-0 -translate-x-2 bg-white/90 hover:bg-white text-primary shadow" />
          <CarouselNext className="hidden md:flex right-0 translate-x-2 bg-white/90 hover:bg-white text-primary shadow" />
        </Carousel>
      </div>

      {/* CTA */}
      <div className="mt-8 flex justify-center">
<Button
  asChild
  variant='outline'
  size="lg"
  className="bg-primary!  text-white transition-transform duration-100 hover:bg-white! hover:text-primary! hover:font-semibold hover:border-primary! hover:border-2!"
>
  <Link to="/collections/dresses" aria-label="View all dresses">
    VIEW ALL
  </Link>
</Button>
      </div>
    </section>
  );
}
