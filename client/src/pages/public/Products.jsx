import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { apiRequest } from '../../services/api';
import { useCart } from '../../context/CartContext';
import {
  Search,
  Filter,
  SlidersHorizontal,
  MapPin,
  ShoppingBag,
  ArrowUpDown,
  CheckCircle2,
  AlertCircle,
  X
} from 'lucide-react';

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [addedId, setAddedId] = useState(null);
  const { addToCart } = useCart();

  // Filters state initialized from search params
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedLocation, setSelectedLocation] = useState(searchParams.get('location') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page'), 10) || 1);

  // Load categories
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await apiRequest('/products/categories');
        setCategories(res.categories || []);
      } catch (err) {
        console.error(err);
      }
    }
    loadCategories();
  }, []);

  // Fetch products based on filters
  useEffect(() => {
    async function loadProducts() {
      setIsLoading(true);
      try {
        const query = new URLSearchParams();
        if (searchTerm) query.set('search', searchTerm);
        if (selectedCategory) query.set('category', selectedCategory);
        if (selectedLocation) query.set('location', selectedLocation);
        if (minPrice) query.set('minPrice', minPrice);
        if (maxPrice) query.set('maxPrice', maxPrice);
        if (sortBy) query.set('sort', sortBy);
        query.set('page', currentPage);
        query.set('limit', 12);

        // Update URL
        setSearchParams(query, { replace: true });

        const res = await apiRequest(`/products?${query.toString()}`);
        setProducts(res.data || []);
        setPagination(res.pagination || { total: 0, page: 1, totalPages: 1 });
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    loadProducts();
  }, [searchTerm, selectedCategory, selectedLocation, minPrice, maxPrice, sortBy, currentPage]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedLocation('');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('newest');
    setCurrentPage(1);
  };

  const handleAddToCart = (product, e) => {
    e.preventDefault();
    addToCart(product, 1);
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header & Search Bar */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Agricultural Marketplace
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Browse authentic agricultural products directly harvested by verified Cameroonian farmers.
            </p>
          </div>

          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products, crops..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          </form>
        </div>

        {/* Category Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => { setSelectedCategory(''); setCurrentPage(1); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === ''
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Produce
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => { setSelectedCategory(cat.slug); setCurrentPage(1); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat.slug
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Filter Controls Bar */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Location Selector */}
            <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedLocation}
                onChange={(e) => { setSelectedLocation(e.target.value); setCurrentPage(1); }}
                className="bg-transparent text-slate-700 font-medium focus:outline-none"
              >
                <option value="">All Regions / Hubs</option>
                <option value="Buea">Buea & South West</option>
                <option value="Foumbot">Foumbot & West</option>
                <option value="Ndop">Ndop & North West</option>
                <option value="Douala">Douala & Littoral</option>
                <option value="Yaounde">Yaounde & Centre</option>
                <option value="Penja">Penja Corridor</option>
              </select>
            </div>

            {/* Price Range */}
            <div className="flex items-center space-x-1.5 text-xs">
              <input
                type="number"
                placeholder="Min FCFA"
                value={minPrice}
                onChange={(e) => { setMinPrice(e.target.value); setCurrentPage(1); }}
                className="w-24 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <span className="text-slate-400">-</span>
              <input
                type="number"
                placeholder="Max FCFA"
                value={maxPrice}
                onChange={(e) => { setMaxPrice(e.target.value); setCurrentPage(1); }}
                className="w-24 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {(searchTerm || selectedCategory || selectedLocation || minPrice || maxPrice) && (
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center space-x-1 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 px-3 py-1.5 rounded-xl transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-400 font-medium">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
              className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl font-semibold text-slate-700 focus:outline-none"
            >
              <option value="newest">Newest Produce</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="popular">Top Rated</option>
              <option value="name">Product Name (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-80 bg-white border border-slate-100 rounded-3xl animate-pulse"></div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-100 p-16 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <ShoppingBag className="w-8 h-8 opacity-40" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No agricultural products match your criteria</h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            Try adjusting your search query, clearing filters, or checking back soon as farmers restock daily.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-5 py-2.5 bg-emerald-700 text-white rounded-xl text-xs font-bold hover:bg-emerald-800 transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden group"
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

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between text-xs">
          <p className="text-slate-500">
            Showing Page <span className="font-bold text-slate-800">{pagination.page}</span> of{' '}
            <span className="font-bold text-slate-800">{pagination.totalPages}</span> ({pagination.total} total items)
          </p>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={pagination.page <= 1}
              className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))}
              disabled={pagination.page >= pagination.totalPages}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-700 text-white font-semibold hover:bg-emerald-800 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
