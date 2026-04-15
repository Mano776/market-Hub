import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../lib/firebase.js';
import { useCart } from '../context/CartContext.jsx';
import { ShoppingCart, Star, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import ReviewSection from '../components/ReviewSection.jsx';
import { toast } from 'react-hot-toast';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        setUser(userDoc.exists() ? { ...firebaseUser, ...userDoc.data() } : firebaseUser);
      } else {
        setUser(null);
      }
    });

    const fetchProduct = async () => {
      if (!id) return;
      try {
        const docSnap = await getDoc(doc(db, 'products', id));
        if (docSnap.exists()) {
          const data = { id: docSnap.id, ...docSnap.data() };
          setProduct(data);
          setSelectedImage(data.images?.[0] || `https://picsum.photos/seed/${data.id}/800/800`);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
    return () => unsubscribe();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );

  if (!product) return (
    <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">Product not found</h2>
      <button onClick={() => navigate('/')} className="text-indigo-600 font-bold hover:underline">Back to Home</button>
    </div>
  );

  const isAdmin = user?.role === 'admin';

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-16">
      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
        <Link to="/" className="hover:text-indigo-600">Marketplace</Link>
        <span className="text-gray-200">/</span>
        <span className="text-gray-200 uppercase">{product.category}</span>
        <span className="text-gray-200">/</span>
        <span className="text-indigo-600">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
        {/* Left: Images */}
        <div className="space-y-8">
          <div className="aspect-square rounded-[3rem] overflow-hidden bg-gray-50 relative group shadow-2xl shadow-indigo-100/20">
            <span className="absolute top-8 left-8 z-10 px-4 py-1.5 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full">
              New Arrival
            </span>
            <img
              src={selectedImage}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
            />
          </div>

          <div className="flex gap-4">
            {(product.images?.length > 0 ? product.images : [selectedImage, selectedImage, selectedImage, selectedImage]).slice(0, 4).map((img, i) => (
              <button
                key={i}
                onClick={() => setSelectedImage(img)}
                className={`w-24 h-24 rounded-2xl overflow-hidden border-2 transition-all ${selectedImage === img ? 'border-indigo-600 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'}`}
              >
                <img src={img} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Right: Info */}
        <div className="flex flex-col justify-center space-y-10">
          <div className="space-y-4">
            <h1 className="text-6xl font-black text-gray-900 leading-tight tracking-tighter">{product.name}</h1>
            <p className="text-4xl font-black text-indigo-600">₹{product.price.toLocaleString()}</p>
          </div>

          {/* Vendor Badge */}
          <div className="flex items-center justify-between p-6 bg-indigo-50/50 rounded-[2rem] border border-indigo-100/50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black">
                {product.vendorId?.charAt(0).toUpperCase() || 'V'}
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Sold By</p>
                <p className="text-sm font-black text-gray-900">Avenue Boutique</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-lg shadow-sm">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="text-xs font-black text-gray-900">{product.averageRating?.toFixed(1) || '4.9'}</span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{product.reviewCount || '2k'}+</span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">The Narrative</h3>
            <p className="text-gray-500 text-lg leading-relaxed font-medium italic">
              {product.description || "Inspired by the stark minimalism of lunar landscapes, this centerpiece is carved from a single block of high-density obsidian composite. Every surface is hand-finished to achieve a depth of black that absorbs light."}
            </p>
          </div>

          {/* Specs Grid */}
          <div className="grid grid-cols-2 gap-8 py-8 border-y border-gray-100">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Edition</p>
              <p className="font-bold text-gray-900">Founders Series (04/50)</p>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Movement</p>
              <p className="font-bold text-gray-900">Swiss Sellita SW200-1</p>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-6">
            {!isAdmin ? (
              <>
                <div className="flex flex-col gap-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Select Accumulation</label>
                  <div className="flex items-center bg-gray-50 w-fit rounded-2xl p-1 border border-gray-100">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-12 h-12 flex items-center justify-center font-black text-gray-400 hover:text-indigo-600 transition-colors"
                    >
                      -
                    </button>
                    <span className="w-12 text-center font-black text-gray-900">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-12 h-12 flex items-center justify-center font-black text-gray-400 hover:text-indigo-600 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      addToCart(product, quantity);
                      toast.success('Added to collection');
                    }}
                    className="flex-1 bg-white border-2 border-indigo-600 text-indigo-600 h-16 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 hover:bg-indigo-50 transition-all active:scale-95"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Add to Cart
                  </button>
                  <button
                    onClick={() => {
                      addToCart(product, quantity);
                      navigate('/checkout');
                    }}
                    className="flex-1 bg-indigo-600 text-white h-16 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95"
                  >
                    Buy Now
                  </button>
                </div>
              </>
            ) : (
              <div className="p-8 bg-gray-50 rounded-[2.5rem] border border-dashed border-gray-200 text-center">
                <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Administrative View Only</p>
                <p className="text-xs text-gray-400 mt-2 font-medium">Purchase controls are disabled for administrators.</p>
              </div>
            )}

            <p className="text-center text-[9px] font-bold text-gray-300 uppercase tracking-widest">
              Secure Checkout • Complimentary Shipping on Artifacts
            </p>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <ReviewSection productId={id} productName={product.name} />
    </div>
  );
}
