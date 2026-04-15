import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, limit, addDoc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase.js';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Star, ArrowRight, Database } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'react-hot-toast';

export default function Home() {
  const navigate = useNavigate();
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
    <div className="space-y-20 pb-20">
      {/* Premium Hero Section */}
      <section className="relative h-[600px] rounded-[3rem] overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent z-10" />
        <img
          src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=2000"
          alt="Luxury Store"
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-[2s]"
          referrerPolicy="no-referrer"
        />
        <div className="relative z-20 h-full flex flex-col justify-center px-16 max-w-3xl space-y-8">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <span className="inline-block px-4 py-1.5 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-full">
              Established 2024
            </span>
            <h1 className="text-7xl font-black text-white leading-[0.9] tracking-tighter">
              Redefining <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">the Marketplace.</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-lg leading-relaxed font-medium">
              Explore a curated collection of premium goods from the world's most talented independent artisans and curators.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Link
              to="/products"
              className="inline-block bg-indigo-600 text-white px-12 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-600/20 active:scale-95"
            >
              Explore Collection
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Browse by Department */}
      <section className="space-y-8">
        <div className="flex items-end justify-between px-4">
          <div>
            <h2 className="text-4xl font-black text-gray-900 tracking-tight">
              Browse by <span className="text-indigo-600">Department</span>
            </h2>
          </div>
          <Link to="/categories" className="text-sm font-black text-indigo-600 uppercase tracking-widest hover:underline">
            View All Categories
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { name: 'Fashion', desc: 'Curated Styles', img: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=800' },
            { name: 'Accessories', desc: 'Timeless Pieces', img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800' },
            { name: 'Home', desc: 'Essential Living', img: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=800' },
            { name: 'Photography', desc: 'Fine Detail', img: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=800' }
          ].map((dept, i) => (
            <motion.div
              key={dept.name}
              whileHover={{ y: -8 }}
              className="relative h-64 rounded-[2.5rem] overflow-hidden group cursor-pointer shadow-xl shadow-gray-200/50"
            >
              <img
                src={dept.img}
                alt={dept.name}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />
              <div className="absolute inset-x-8 bottom-8 text-white">
                <h3 className="text-2xl font-black tracking-tight leading-none">{dept.name}</h3>
                <p className="text-xs font-bold opacity-60 mt-1 uppercase tracking-widest">{dept.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Artifacts (Products) */}
      <section className="space-y-12">
        <div className="flex items-center justify-between px-4">
          <h2 className="text-4xl font-black text-gray-900 tracking-tight">
            Featured <span className="text-indigo-600">Artifacts</span>
          </h2>

        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-[500px] bg-gray-100 rounded-[3rem] animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <motion.div
                key={product.id}
                whileHover={{ y: -10 }}
                className="bg-white rounded-[3rem] p-4 border border-gray-50 shadow-2xl shadow-gray-200/40 group overflow-hidden"
              >
                <Link to={`/product/${product.id}`} className="block relative aspect-[4/5] rounded-[2.5rem] overflow-hidden bg-gray-50 mb-6">
                  <img
                    src={product.images?.[0] || `https://picsum.photos/seed/${product.id}/600/800`}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-6 left-6">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur text-[9px] font-black uppercase tracking-widest text-indigo-600 rounded-lg shadow-sm">
                      {product.category || 'Curated'}
                    </span>
                  </div>
                  <button className="absolute top-6 right-6 w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-gray-300 hover:text-red-500 transition-colors shadow-sm">
                    <Star className="w-4 h-4" />
                  </button>
                </Link>

                <div className="px-4 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h3 className="font-extrabold text-gray-900 line-clamp-1 text-lg group-hover:text-indigo-600 transition-colors">
                        {product.name}
                      </h3>
                      <div className="flex items-center gap-1.5">
                        <Star className="w-3 h-3 text-yellow-400 fill-current" />
                        <span className="text-xs font-bold text-gray-400">
                          {product.averageRating?.toFixed(1) || '4.5'}
                        </span>
                      </div>
                    </div>
                    <span className="text-xl font-black text-gray-900">₹{product.price}</span>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        toast.success('Added to collection!');
                      }}
                      className="flex-1 bg-gray-50 text-gray-900 py-3 rounded-2xl font-black uppercase tracking-widest text-[8px] hover:bg-gray-100 transition-all border border-gray-100"
                    >
                      Add to Cart
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        navigate(`/product/${product.id}`);
                      }}
                      className="flex-1 bg-indigo-600 text-white py-3 rounded-2xl font-black uppercase tracking-widest text-[8px] hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
