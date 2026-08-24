import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getProducts } from "../api/products";
import Layout from "../components/Layout";
import ProductCard from "../components/ProductCard";
import Marquee from "../components/Marquee";
import ReviewsSection from "../components/ReviewsSection";
import bgImage from "../assets/bg.png";

function Home() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    getProducts().then((res) => setProducts(res.data.slice(0, 8))).catch(() => {});
  }, []);

  return (
    <Layout>
      {/* Hero */}
      <section className="relative px-6 py-20 md:py-28 text-center overflow-hidden">
        {/* Blurred background image */}
        <div
          className="absolute inset-0 bg-cover bg-[center_33%] bg-no-repeat scale-105 blur-[2px]"
          style={{
            backgroundImage: `url(${bgImage})`,
          }}
        />

        {/* Soft overlay */}
        <div className="absolute inset-0 bg-white/20" />

        {/* Content */}
        <div className="relative z-10">
          <span className="inline-block bg-white/80 text-rose-600 text-xs font-medium px-4 py-1.5 rounded-full mb-6">
            ✦ Handmade with Love
          </span>

          <h1 className="font-display text-4xl md:text-6xl text-espresso mb-4">
            Welcome to{" "}
          <span className="relative inline-block text-espresso font-bold px-3 py-1">
            <span
              className="
                absolute
                left-0
                top-[20%]
                h-[70%]
                w-full
                -z-10
                bg-[#F1D1CB]
                opacity-80
                rounded-[70%_55%_55%_45%]
                origin-left
                animate-paint
              "
            ></span>
              Nara
            </span>
          </h1>

          <p className="text-muted max-w-xl mx-auto mb-8">
            Discover unique handmade accessories that tell your story. Each piece
            crafted with love and attention to detail.
          </p>

          <div className="flex justify-center gap-3 flex-wrap">
            <Link
              to="/products"
              className="px-6 py-3 rounded-full bg-rose-500 text-white text-sm font-medium hover:opacity-90 transition"
            >
              Shop Now
            </Link>

            <Link to="/contact" className="px-6 py-3 rounded-full bg-white text-espresso text-sm font-medium hover:bg-blush-100 transition">
            Get in Touch
          </Link>
          </div>
        </div>
      </section>
      <Marquee />

      {/* Popular items */}
      <section className="py-16 max-w-6xl mx-auto text-center">
        <span className="inline-block bg-nudepink-100 text-rose-600 text-xs font-medium px-4 py-1.5 rounded-2xl mb-4">
          ✦ Featured Collection
        </span>
        <h2 className="font-display text-3xl text-espresso mb-2">Our Popular Items</h2>
        <p className="text-muted mb-10">Handpicked selections loved by our customers</p>

        <div className="flex gap-5 overflow-x-auto px-6 pb-4 no-scrollbar snap-x snap-mandatory">
          {products.map((p) => (
            <div key={p.id} className="shrink-0 w-48 sm:w-56 snap-start text-left">
              <ProductCard product={p} />
            </div>
          ))}
        </div>

        <Link
          to="/products"
          className="inline-block mt-10 px-6 py-3 rounded-full bg-rose-500 text-white text-sm font-medium hover:opacity-90 transition"
        >
          View All Products
        </Link>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 text-center bg-white">
        <h2 className="font-display text-3xl text-espresso mb-3">Start Your Journey</h2>
        <p className="text-muted mb-8">Join our happy customers who've found their perfect accessory.</p>
        <div className="flex justify-center gap-3 flex-wrap">
          <Link to="/products" className="px-6 py-3 rounded-full bg-rose-500 text-white text-sm font-medium hover:opacity-90 transition">
            Browse Products
          </Link>
          <Link to="/contact" className="px-6 py-3 rounded-full bg-nudepink-100 text-espresso text-sm font-medium hover:bg-blush-100 transition">
            Get in Touch
          </Link>
        </div>
      </section>

      <ReviewsSection />
    </Layout>
  );
}

export default Home;