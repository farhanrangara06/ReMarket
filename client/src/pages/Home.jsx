import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Search, Tag, Shield, Users } from 'lucide-react';
import { getProducts } from '../services/productService';
import ProductCard from '../components/products/ProductCard';
import ProductCardSkeleton from '../components/products/ProductCardSkeleton';
import CategoryCard from '../components/home/CategoryCard';
import { PRODUCT_CATEGORIES } from '../utils/constants';
import { useAuth } from '../context/AuthContext';

const popularCategories = [
  'Electronics', 'Mobile Phones', 'Laptops', 'Furniture', 'Books', 'Vehicles',
];

const Home = () => {
  const { isAuthenticated } = useAuth();
  const [featured, setFeatured] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const { data } = await getProducts({ limit: 8, sort: 'newest' });
        setFeatured(data);
      } catch {
        setFeatured([]);
      } finally {
        setLoadingFeatured(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-primary-300 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="max-w-3xl">
            <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-sm font-medium mb-4 backdrop-blur-sm">
              Mumbai&apos;s Trusted Used Marketplace
            </span>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              Buy Smart. Sell Easy. <span className="text-primary-200">ReMarket.</span>
            </h1>
            <p className="text-lg md:text-xl text-primary-100 mb-8 max-w-2xl">
              Your trusted marketplace for buying and selling used products.
              Find great deals or list items you no longer need.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 bg-white text-primary-700 px-6 py-3 rounded-xl font-semibold hover:bg-primary-50 transition-all shadow-lg hover:shadow-xl"
              >
                Browse Products
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to={isAuthenticated ? '/sell' : '/register'}
                className="inline-flex items-center gap-2 border-2 border-white/80 text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/10 transition-all"
              >
                Sell Your Product
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Categories */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Popular Categories</h2>
            <Link to="/products" className="text-primary-600 text-sm font-medium hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {popularCategories.map((cat) => (
              <CategoryCard key={cat} name={cat} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Featured Products</h2>
            <Link to="/products" className="text-primary-600 text-sm font-medium hover:underline flex items-center gap-1">
              Browse all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {loadingFeatured ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)}
            </div>
          ) : featured.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featured.slice(0, 8).map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <p className="text-gray-500 mb-4">No products listed yet. Be the first to sell!</p>
              <Link to="/sell" className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-primary-700">
                List a Product
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">How It Works</h2>
          <p className="text-gray-600 text-center mb-12 max-w-xl mx-auto">
            Start buying or selling in just a few simple steps
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {[
              { step: '1', title: 'Create Account', desc: 'Register with your details in seconds' },
              { step: '2', title: 'List Product', desc: 'Upload photos and set your price' },
              { step: '3', title: 'Browse & Search', desc: 'Find products or receive requests' },
              { step: '4', title: 'Connect', desc: 'Communicate with buyers or sellers' },
              { step: '5', title: 'Complete Deal', desc: 'Finalize the transaction locally' },
            ].map((item) => (
              <div key={item.step} className="text-center p-4">
                <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-4 shadow-md">
                  {item.step}
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                <p className="text-gray-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why ReMarket */}
      <section className="bg-white py-16 md:py-20 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">Why ReMarket?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Search, title: 'Easy Search & Filter', desc: 'Find exactly what you need with powerful search, category filters, and price range options.' },
              { icon: Shield, title: 'Secure Platform', desc: 'Safe JWT authentication, verified profiles, and admin moderation for a trusted experience.' },
              { icon: Users, title: 'Local Community', desc: 'Connect with buyers and sellers in Mumbai, Thane, Navi Mumbai, and nearby areas.' },
            ].map((item) => (
              <div key={item.title} className="p-6 rounded-2xl border border-gray-200 hover:border-primary-200 hover:shadow-lg transition-all">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
                  <item.icon className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2 text-gray-900">{item.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Browse by type */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center mb-8 text-gray-900">Browse by Category</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
            {PRODUCT_CATEGORIES.map((cat) => (
              <Link
                key={cat}
                to={`/products?category=${encodeURIComponent(cat)}`}
                className="px-4 py-3 bg-white rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:border-primary-400 hover:text-primary-600 text-center transition-colors"
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Tag className="w-12 h-12 mx-auto mb-4 opacity-80" />
          <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-primary-100 mb-8 max-w-xl mx-auto">
            Join ReMarket today and start buying or selling used products in your area.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 bg-white text-primary-700 px-8 py-3 rounded-xl font-semibold hover:bg-primary-50 transition-colors shadow-lg"
            >
              Create Free Account
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 border-2 border-white/60 text-white px-8 py-3 rounded-xl font-semibold hover:bg-white/10 transition-colors"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
