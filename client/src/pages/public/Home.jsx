import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../../services/api';
import { useCart } from '../../context/CartContext';
import Badge from '../../components/Badge';
import {
  Sprout,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Truck,
  CheckCircle,
  MapPin,
  Star,
  ShoppingBag,
  Wheat,
  Layers,
  Award
} from 'lucide-react';

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addToCart } = useCart();
  const [addedId, setAddedId] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [catRes, prodRes] = await Promise.all([
          apiRequest('/products/categories'),
          apiRequest('/products?limit=8&sort=newest')
        ]);
        setCategories(catRes.categories || []);
        setFeaturedProducts(prodRes.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleAddToCart = (product, e) => {
    e.preventDefault();
    addToCart(product, 1);
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1500);
  };

  return (
    <div className="space-y-20">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-900 via-emerald-800 to-emerald-950 text-white pt-16 pb-24 rounded-3xl mx-4 sm:mx-6 lg:mx-8 shadow-2xl mt-4">
        {/* Background Subtle Accent */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        <div className="relative max-w-6xl mx-auto px-6 lg:px-8 text-center space-y-8">
          <div className="inline-flex items-center space-x-2 bg-emerald-700/60 border border-emerald-500/40 px-4 py-1.5 rounded-full text-xs font-bold text-emerald-200 tracking-wide uppercase shadow-sm">
            <Sprout className="w-4 h-4 text-emerald-300" />
            <span>IAI Cameroon Software Engineering Level 2 Project</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight max-w-4xl mx-auto">
            Design & Implementation of an <span className="text-emerald-300 underline decoration-emerald-500 decoration-wavy decoration-2">Agricultural Product</span> Marketing Platform
          </h1>

          <p className="text-base sm:text-lg text-emerald-100 max-w-2xl mx-auto font-normal leading-relaxed">
            Connecting Cameroonian farmers and agricultural cooperatives directly with wholesale & retail buyers. Backed by real-time inventory, integrated logistics dispatch, and strict UML use-case architecture.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              to="/products"
              className="inline-flex items-center space-x-2 bg-white text-emerald-900 hover:bg-emerald-50 px-7 py-3.5 rounded-2xl font-extrabold text-sm shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-0.5"
            >
              <span>Explore Marketplace</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center space-x-2 bg-emerald-700 hover:bg-emerald-600 text-white border border-emerald-500/50 px-7 py-3.5 rounded-2xl font-extrabold text-sm shadow-lg transition-all"
            >
              <Wheat className="w-4 h-4 text-emerald-300" />
              <span>Register as Farmer</span>
            </Link>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-12 max-w-4xl mx-auto border-t border-emerald-700/50">
            <div className="text-center">
              <p className="text-2xl sm:text-3xl font-extrabold text-white">100%</p>
              <p className="text-xs font-medium text-emerald-200 mt-1">Direct Farm Produce</p>
            </div>
            <div className="text-center">
              <p className="text-2xl sm:text-3xl font-extrabold text-white">5 Actors</p>
              <p className="text-xs font-medium text-emerald-200 mt-1">Full UML Roles</p>
            </div>
            <div className="text-center">
              <p className="text-2xl sm:text-3xl font-extrabold text-white">15 Cases</p>
              <p className="text-xs font-medium text-emerald-200 mt-1">UML Core Functions</p>
            </div>
            <div className="text-center">
              <p className="text-2xl sm:text-3xl font-extrabold text-white">Cameroon</p>
              <p className="text-xs font-medium text-emerald-200 mt-1">Nationwide Logistics</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CATEGORIES BROWSER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="flex items-center space-x-2 text-emerald-700 font-bold text-xs uppercase tracking-wider">
              <Layers className="w-4 h-4" />
              <span>Browse by Category</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              Fresh Harvest Categories
            </h2>
          </div>
          <Link
            to="/products"
            className="text-sm font-bold text-emerald-700 hover:text-emerald-800 flex items-center space-x-1"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/products?category=${cat.slug}`}
              className="group relative rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 bg-white"
            >
              <div className="h-36 sm:h-44 w-full overflow-hidden bg-slate-100">
                <img
                  src={cat.image_url}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-4">
                <h3 className="font-bold text-slate-900 text-sm sm:text-base group-hover:text-emerald-700 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                  {cat.description}
                </p>
                <div className="mt-3 flex items-center justify-between text-[11px] font-semibold text-emerald-700">
                  <span>{cat.product_count} products listed</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. FEATURED PRODUCTS CATALOGUE PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="flex items-center space-x-2 text-emerald-700 font-bold text-xs uppercase tracking-wider">
              <Sprout className="w-4 h-4" />
              <span>Direct From Certified Farms</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              Featured Agricultural Products
            </h2>
          </div>
          <Link
            to="/products"
            className="text-sm font-bold text-emerald-700 hover:text-emerald-800 flex items-center space-x-1"
          >
            <span>Browse Catalogue</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-80 bg-slate-100 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden group"
              >
                {/* Image & Badges */}
                <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                  <img
                    src={p.image_url}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="bg-white/90 backdrop-blur-sm text-slate-800 text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm">
                      {p.category_name}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    {p.stock_quantity <= p.low_stock_threshold ? (
                      <span className="bg-amber-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-sm">
                        Low Stock ({p.stock_quantity})
                      </span>
                    ) : (
                      <span className="bg-emerald-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-sm">
                        In Stock ({p.stock_quantity})
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center space-x-1 text-slate-400 text-xs mb-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="truncate">{p.location}</span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-base leading-snug group-hover:text-emerald-700 transition-colors line-clamp-2">
                      {p.name}
                    </h4>

                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {p.description}
                    </p>

                    <div className="mt-3 pt-3 border-t border-slate-50 flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Farmer:</span>
                      <span className="font-bold text-slate-800 truncate max-w-[140px]">
                        {p.farm_name || p.farmer_name}
                      </span>
                    </div>
                  </div>

                  {/* Price & Action */}
                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Price / {p.unit}</p>
                      <p className="text-lg font-extrabold text-emerald-800">
                        {p.price.toLocaleString()} <span className="text-xs font-bold text-slate-500">FCFA</span>
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/products/${p.id}`}
                        className="p-2 text-slate-600 hover:text-emerald-700 hover:bg-slate-50 rounded-xl transition-colors text-xs font-semibold"
                        title="View Details"
                      >
                        Details
                      </Link>
                      <button
                        onClick={(e) => handleAddToCart(p, e)}
                        disabled={p.stock_quantity <= 0}
                        className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                          addedId === p.id
                            ? 'bg-emerald-600 text-white'
                            : 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm'
                        } disabled:opacity-40 disabled:cursor-not-allowed`}
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>{addedId === p.id ? 'Added!' : 'Add'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4. ACADEMIC SYSTEM ARCHITECTURE & 5 ACTORS SECTION */}
      <section className="bg-slate-900 text-white py-16 rounded-3xl mx-4 sm:mx-6 lg:mx-8 px-6 lg:px-12">
        <div className="max-w-5xl mx-auto text-center space-y-4 mb-14">
          <div className="inline-flex items-center space-x-2 bg-emerald-950 border border-emerald-800 text-emerald-400 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
            <Award className="w-4 h-4" />
            <span>Academic Alignment • UML Specification</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold">
            Platform Actors & System Responsibilities
          </h2>
          <p className="text-sm text-slate-400 max-w-2xl mx-auto">
            Strictly engineered according to the 5 actors and 15 core use cases validated for the Level 2 Software Engineering curriculum at IAI Cameroon.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 text-center space-y-3">
            <div className="w-10 h-10 bg-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center mx-auto">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-white">USER</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Authenticated user with profile management, notification feed, and browsing access.
            </p>
          </div>

          <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 text-center space-y-3">
            <div className="w-10 h-10 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center mx-auto">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-white">SELLER / BUYER</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Places orders, selects payment methods, tracks purchases, and reviews completed orders.
            </p>
          </div>

          <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 text-center space-y-3">
            <div className="w-10 h-10 bg-amber-500/20 text-amber-400 rounded-xl flex items-center justify-center mx-auto">
              <Wheat className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-white">FARMER</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Publishes produce, manages stock, receives low-stock warnings, accepts incoming orders.
            </p>
          </div>

          <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 text-center space-y-3">
            <div className="w-10 h-10 bg-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center mx-auto">
              <Truck className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-white">DELIVERY</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Accepts delivery requests, manages transit status, records receipt, and logs delivery history.
            </p>
          </div>

          <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 text-center space-y-3">
            <div className="w-10 h-10 bg-purple-500/20 text-purple-400 rounded-xl flex items-center justify-center mx-auto">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-white">ADMINISTRATOR</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Validates farmers, manages users, moderates products, audits payments, and views analytics.
            </p>
          </div>
        </div>
      </section>

      {/* 5. HOW IT WORKS WORKFLOW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Seamless Flow</span>
          <h2 className="text-3xl font-extrabold text-slate-900 mt-1">
            How The AGRISHOP Ecosystem Works
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm relative">
            <span className="text-4xl font-extrabold text-emerald-200 absolute top-6 right-6">01</span>
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-6">
              <Wheat className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Farmers Register & Publish</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Farmers submit farm details and certifications. Upon administrator validation, they list fresh produce with transparent stock and pricing.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm relative">
            <span className="text-4xl font-extrabold text-emerald-200 absolute top-6 right-6">02</span>
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-6">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Buyers Order & Pay</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Buyers search products, add items to cart, select delivery destinations, and complete payments via MTN MoMo, Orange Money, or Card.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm relative">
            <span className="text-4xl font-extrabold text-emerald-200 absolute top-6 right-6">03</span>
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-6">
              <Truck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Logistics Dispatch & Delivery</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Delivery services accept the dispatch request, pick up goods from the farm gate, and deliver to the buyer with tracking code verification.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
