import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, limit, addDoc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase.js';
import { Link } from 'react-router-dom';
import { ShoppingCart, Star, ArrowRight, Database } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'react-hot-toast';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const seedProducts = async () => {
    const tempProducts = [
      {
        name: "Premium Wireless Headphones",
        description: "High-fidelity audio with active noise cancellation and 40-hour battery life.",
        price: 299,
        inventory: 50,
        category: "Electronics",
        vendorId: "system_seed",
        status: "active",
        averageRating: 4.8,
        reviewCount: 12,
        images: ["https://picsum.photos/seed/headphones/800/800"],
        createdAt: new Date().toISOString()
      },
      {
        name: "Minimalist Leather Watch",
        description: "Elegant timepiece with genuine Italian leather strap and sapphire crystal glass.",
        price: 150,
        inventory: 30,
        category: "Fashion",
        vendorId: "system_seed",
        status: "active",
        averageRating: 4.5,
        reviewCount: 8,
        images: ["https://picsum.photos/seed/watch/800/800"],
        createdAt: new Date().toISOString()
      },
      {
        name: "Smart Home Security Camera",
        description: "2K resolution with night vision, two-way audio, and AI motion detection.",
        price: 89,
        inventory: 100,
        category: "Electronics",
        vendorId: "system_seed",
        status: "active",
        averageRating: 4.2,
        reviewCount: 25,
        images: ["https://picsum.photos/seed/camera/800/800"],
        createdAt: new Date().toISOString()
      },
      {
        name: "Organic Cotton Hoodie",
        description: "Ultra-soft, sustainable hoodie perfect for everyday comfort.",
        price: 65,
        inventory: 75,
        category: "Fashion",
        vendorId: "system_seed",
        status: "active",
        averageRating: 4.9,
        reviewCount: 15,
        images: ["https://picsum.photos/seed/hoodie/800/800"],
        createdAt: new Date().toISOString()
      }
    ];

    try {
      toast.loading('Seeding products...');
      for (const p of tempProducts) {
        await addDoc(collection(db, 'products'), p);
      }
      toast.dismiss();
      toast.success('Temporary products added!');
      window.location.reload();
    } catch (error) {
      toast.error('Failed to seed products');
      console.error(error);
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const q = query(collection(db, 'products'), where('status', '==', 'active'), limit(8));
        const querySnapshot = await getDocs(q);
        const productsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProducts(productsData);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative h-[500px] rounded-3xl overflow-hidden bg-indigo-900 flex items-center">
        <div className="absolute inset-0 opacity-40">
          <img 
            src="https://picsum.photos/seed/shopping/1920/1080" 
            alt="Hero" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="relative z-10 px-12 max-w-2xl text-white space-y-6">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-extrabold leading-tight"
          >
            Discover the Best Multi-Vendor Marketplace
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-indigo-100"
          >
            Shop from thousands of trusted vendors or start your own business today with our easy-to-use platform.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex space-x-4"
          >
            <Link to="/register" className="bg-white text-indigo-600 px-8 py-3 rounded-xl font-bold hover:bg-indigo-50 transition-colors">
              Get Started
            </Link>
            {products.length === 0 && (
              <button 
                onClick={seedProducts}
                className="bg-indigo-500/20 backdrop-blur border border-indigo-400/30 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-500/40 transition-colors flex items-center"
              >
                <Database className="w-5 h-5 mr-2" /> Seed Products
              </button>
            )}
          </motion.div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Featured Products</h2>
            <p className="text-gray-500">Handpicked items from our top vendors</p>
          </div>
          <Link to="/products" className="text-indigo-600 font-semibold flex items-center hover:underline">
            View all <ArrowRight className="ml-2 w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl h-80 animate-pulse border border-gray-100"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.length > 0 ? products.map((product) => (
              <motion.div 
                key={product.id}
                whileHover={{ y: -5 }}
                className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all group"
              >
                <Link to={`/product/${product.id}`}>
                  <div className="h-48 overflow-hidden relative">
                    <img 
                      src={product.images?.[0] || `https://picsum.photos/seed/${product.id}/400/300`} 
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-xs font-bold text-gray-900 flex items-center">
                      <Star className="w-3 h-3 text-yellow-400 mr-1 fill-yellow-400" />
                      {product.averageRating?.toFixed(1) || '0.0'}
                    </div>
                  </div>
                </Link>
                <div className="p-4 space-y-2">
                  <Link to={`/product/${product.id}`}>
                    <h3 className="font-bold text-gray-900 line-clamp-1 hover:text-indigo-600">{product.name}</h3>
                  </Link>
                  <p className="text-sm text-gray-500 line-clamp-2 h-10">{product.description}</p>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-xl font-bold text-indigo-600">${product.price}</span>
                    <button className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-colors">
                      <ShoppingCart className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )) : (
              <div className="col-span-full py-12 text-center text-gray-500">
                No products found. Start by adding some!
              </div>
            )}
          </div>
        )}
      </section>

      {/* Categories */}
      <section className="bg-white rounded-3xl p-12 border border-gray-100">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Shop by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {['Electronics', 'Fashion', 'Home & Living', 'Beauty'].map((cat) => (
            <Link 
              key={cat} 
              to={`/products?category=${cat}`}
              className="group relative h-40 rounded-2xl overflow-hidden flex items-center justify-center"
            >
              <img 
                src={`https://picsum.photos/seed/${cat}/400/400`} 
                alt={cat}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors"></div>
              <span className="relative z-10 text-white font-bold text-xl">{cat}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
