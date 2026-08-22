import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getProducts } from "../api/products";
import Layout from "../components/Layout";
import ProductCard from "../components/ProductCard";
import Marquee from "../components/Marquee";
import ReviewsSection from "../components/ReviewsSection";

function Home() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    getProducts().then((res) => setProducts(res.data.slice(0, 8))).catch(() => {});
  }, []);

  return (
    <Layout>
      {/* Hero */}
      <section className="bg-gradient-to-br from-nudepink-300 via-blush-200 to-rose-500 px-6 py-20 md:py-28 text-center">
        <span className="inline-block bg-white/80 text-rose-600 text-xs font-medium px-4 py-1.5 rounded-full mb-6">
          ✦ Handmade with Love
        </span>
        <h1 className="font-display text-4xl md:text-6xl text-espresso mb-4">
          Welcome to <span className="text-rose-600">Nara</span>
        </h1>
        <p className="text-muted max-w-xl mx-auto mb-8">
          Discover unique handmade accessories that tell your story. Each piece crafted with love and attention to detail.
        </p>
        <div className="flex justify-center gap-3 flex-wrap">
          <Link to="/products" className="px-6 py-3 rounded-full bg-rose-500 text-white text-sm font-medium hover:opacity-90 transition">
            Shop Now
          </Link>
          <Link to="/about" className="px-6 py-3 rounded-full bg-white text-espresso text-sm font-medium hover:bg-blush-100 transition">
            Our Story
          </Link>
        </div>
      </section>

      <Marquee />

      {/* Popular items */}
      <section className="py-16 max-w-6xl mx-auto text-center">
        <span className="inline-block bg-nudepink-100 text-rose-600 text-xs font-medium px-4 py-1.5 rounded-full mb-4">
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