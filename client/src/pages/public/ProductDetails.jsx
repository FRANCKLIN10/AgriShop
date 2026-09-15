import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiRequest } from '../../services/api';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import Badge from '../../components/Badge';
import {
  MapPin,
  ShieldCheck,
  Wheat,
  Plus,
  Minus,
  ShoppingCart,
  Star,
  CheckCircle,
  Truck,
  ArrowLeft,
  MessageSquare
} from 'lucide-react';

export default function ProductDetails() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [related, setRelated] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  // New review form
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState('');
  const [reviewError, setReviewError] = useState('');

  useEffect(() => {
    async function loadProduct() {
      setIsLoading(true);
      try {
        const res = await apiRequest(`/products/${id}`);
        if (res.success) {
          setProduct(res.product);
          setReviews(res.reviews || []);
          setRelated(res.related || []);
          setQuantity(1);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadProduct();
  }, [id]);

  const handleQuantityChange = (delta) => {
    const max = product?.stock_quantity ?? 99;
    setQuantity(prev => Math.max(1, Math.min(max, prev + delta)));
  };

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) return;
    setIsSubmittingReview(true);
    setReviewError('');
    setReviewSuccess('');

    try {
      const res = await apiRequest(`/products/${id}/reviews`, {
        method: 'POST',
        body: { rating, comment }
      });

      if (res.success) {
        setReviews(prev => [res.review, ...prev]);
        setComment('');
        setReviewSuccess('Thank you! Your verified customer review has been posted.');
      }
    } catch (err) {
      setReviewError(err.message || 'Failed to submit review');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 flex justify-center">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-4 text-center">
        <h2 className="text-xl font-bold text-slate-800">Agricultural Product Not Found</h2>
        <p className="text-sm text-slate-500 mt-2">The product you requested might have been sold out or unlisted by the farmer.</p>
        <Link to="/products" className="mt-6 inline-flex items-center space-x-2 text-sm font-bold text-emerald-700 hover:underline">
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Marketplace</span>
        </Link>
      </div>
    );
  }

  const isOutOfStock = product.stock_quantity <= 0;
  const isLowStock = product.stock_quantity > 0 && product.stock_quantity <= product.low_stock_threshold;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center space-x-2 text-xs font-semibold text-slate-400">
        <Link to="/" className="hover:text-emerald-700">Home</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-emerald-700">Marketplace</Link>
        <span>/</span>
        <Link to={`/products?category=${product.category_slug}`} className="hover:text-emerald-700">{product.category_name}</Link>
        <span>/</span>
        <span className="text-slate-700 truncate max-w-[200px]">{product.name}</span>
      </nav>

      {/* Main Product Details Card */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Image */}
        <div className="lg:col-span-6 space-y-4">
          <div className="h-80 sm:h-[420px] rounded-2xl overflow-hidden bg-slate-100 border border-slate-100 relative shadow-inner">
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4">
              <span className="bg-emerald-700 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                {product.category_name}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-50 p-3.5 rounded-xl">
            <span className="flex items-center space-x-1">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span className="font-semibold text-slate-700">Origin:</span>
              <span>{product.location}</span>
            </span>
            <span className="flex items-center space-x-1">
              <Truck className="w-4 h-4 text-emerald-600" />
              <span>Available for dispatch</span>
            </span>
          </div>
        </div>

        {/* Right Column: Pricing & Purchase */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                {product.name}
              </h1>
              <div className="mt-2 flex items-center space-x-3">
                <span className="text-xs text-slate-500 font-medium">Availability:</span>
                {isOutOfStock ? (
                  <Badge status="OUT_OF_STOCK" />
                ) : isLowStock ? (
                  <Badge status="LOW_STOCK" />
                ) : (
                  <Badge status="IN_STOCK" />
                )}
                <span className="text-xs text-slate-500">({product.stock_quantity} {product.unit} in stock)</span>
              </div>
            </div>

            {/* Price Badge */}
            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100/80 flex items-baseline space-x-2">
              <span className="text-3xl font-black text-emerald-800">
                {product.price.toLocaleString()}
              </span>
              <span className="text-sm font-bold text-slate-600">FCFA</span>
              <span className="text-xs text-slate-500 font-medium">/ {product.unit}</span>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Produce Description</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                {product.description || 'Fresh agricultural produce directly harvested and supplied under standard quality assurance.'}
              </p>
            </div>

            {/* Farmer Profile Card */}
            <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 flex items-center space-x-4">
              <img
                src={product.farmer_avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'}
                alt={product.farmer_name}
                className="w-12 h-12 rounded-xl object-cover border border-emerald-200"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h4 className="text-sm font-bold text-slate-900 truncate">
                    {product.farm_name || product.farmer_name}
                  </h4>
                  <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" title="Verified Producer" />
                </div>
                <p className="text-xs text-slate-500 truncate">Farmer: {product.farmer_name}</p>
                <p className="text-[11px] text-emerald-700 font-semibold">{product.farm_location || product.location}</p>
              </div>
            </div>
          </div>

          {/* Action & Quantity Selector */}
          <div className="pt-4 border-t border-slate-100 space-y-4">
            {!isOutOfStock && (
              <div className="flex items-center space-x-4">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Quantity:</span>
                <div className="flex items-center space-x-2 border border-slate-200 rounded-xl p-1 bg-white">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 disabled:opacity-30"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 text-center text-sm font-bold text-slate-800">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= product.stock_quantity}
                    className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 disabled:opacity-30"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
                <span className="text-xs text-slate-400 font-medium">({product.unit})</span>
              </div>
            )}

            <div className="flex items-center space-x-4">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`flex-1 py-3.5 px-6 rounded-2xl font-bold text-sm shadow-md transition-all flex items-center justify-center space-x-2 ${
                  isAdded
                    ? 'bg-emerald-600 text-white'
                    : isOutOfStock
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-emerald-700 hover:bg-emerald-800 text-white hover:shadow-lg'
                }`}
              >
                <ShoppingCart className="w-4 h-4" />
                <span>
                  {isAdded ? 'Added to Cart!' : isOutOfStock ? 'Currently Out of Stock' : `Add ${quantity} to Order Cart`}
                </span>
              </button>

              <Link
                to="/cart"
                className="px-5 py-3.5 rounded-2xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-bold transition-colors"
              >
                View Cart
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews & Feedback Section */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-10 space-y-8">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5 text-emerald-600" />
            <h3 className="text-lg font-bold text-slate-900">
              Customer Reviews ({reviews.length})
            </h3>
          </div>
        </div>

        {/* Review Form */}
        {isAuthenticated ? (
          <form onSubmit={handleReviewSubmit} className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Leave a Review</h4>

            {reviewSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl">
                {reviewSuccess}
              </div>
            )}
            {reviewError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl">
                {reviewError}
              </div>
            )}

            <div className="flex items-center space-x-2">
              <span className="text-xs font-medium text-slate-600">Rating:</span>
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setRating(s)}
                    className="p-1 text-amber-400 hover:scale-110 transition-transform"
                  >
                    <Star className={`w-5 h-5 ${s <= rating ? 'fill-amber-400' : 'text-slate-300'}`} />
                  </button>
                ))}
              </div>
            </div>

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your feedback on produce quality, freshness, and delivery..."
              rows={3}
              required
              className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />

            <button
              type="submit"
              disabled={isSubmittingReview}
              className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50"
            >
              {isSubmittingReview ? 'Submitting...' : 'Post Review'}
            </button>
          </form>
        ) : (
          <div className="bg-slate-50 p-4 rounded-xl text-xs text-slate-600 flex items-center justify-between">
            <span>Please sign in with your buyer account to share a product review.</span>
            <Link to="/login" className="font-bold text-emerald-700 hover:underline">
              Sign In →
            </Link>
          </div>
        )}

        {/* Reviews List */}
        <div className="space-y-4 divide-y divide-slate-100">
          {reviews.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No customer reviews yet for this harvest. Be the first to order and review!</p>
          ) : (
            reviews.map((r) => (
              <div key={r.id} className="pt-4 first:pt-0 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <img
                      src={r.user_avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                      alt={r.user_name}
                      className="w-7 h-7 rounded-full object-cover border border-slate-200"
                    />
                    <span className="text-xs font-bold text-slate-800">{r.user_name}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${s <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{r.comment}</p>
                <p className="text-[10px] text-slate-400">{new Date(r.created_at).toLocaleDateString()}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
