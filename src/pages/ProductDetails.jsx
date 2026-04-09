import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase.js';
import { useCart } from '../context/CartContext.jsx';
import { ShoppingCart, Star, ShieldCheck, Truck, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import ReviewSection from '../components/ReviewSection.jsx';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        const docSnap = await getDoc(doc(db, 'products', id));
        if (docSnap.exists()) {
          setProduct({ id: docSnap.id, ...docSnap.data() });
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) return <div className="animate-pulse">Loading...</div>;
  if (!product) return <div>Product not found</div>;

  return (
    <div className="space-y-12">
      <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 hover:text-indigo-600 font-medium">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to products
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Image Gallery */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <div className="aspect-square rounded-3xl overflow-hidden border border-gray-100 shadow-sm">
            <img 
              src={product.images?.[0] || `https://picsum.photos/seed/${product.id}/800/800`} 
              alt={product.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </motion.div>

        {/* Product Info */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <div className="space-y-2">
            <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold uppercase tracking-wider">
              {product.category}
            </span>
            <h1 className="text-4xl font-extrabold text-gray-900">{product.name}</h1>
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-yellow-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star} 
                    className={`w-5 h-5 ${star <= Math.round(product.averageRating || 0) ? 'fill-current' : 'text-gray-200 fill-current'}`} 
                  />
                ))}
                <span className="ml-2 text-gray-500 font-medium">
                  {product.averageRating?.toFixed(1) || '0.0'} ({product.reviewCount || 0} reviews)
                </span>
              </div>
            </div>
          </div>

          <div className="text-3xl font-bold text-indigo-600">${product.price}</div>

          <p className="text-gray-600 leading-relaxed text-lg">
            {product.description}
          </p>

          <div className="grid grid-cols-2 gap-4 py-6 border-y border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-50 text-green-600 rounded-lg"><ShieldCheck className="w-5 h-5" /></div>
              <div>
                <p className="text-sm font-bold text-gray-900">Warranty</p>
                <p className="text-xs text-gray-500">1 Year Official</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Truck className="w-5 h-5" /></div>
              <div>
                <p className="text-sm font-bold text-gray-900">Free Delivery</p>
                <p className="text-xs text-gray-500">Orders over $50</p>
              </div>
            </div>
          </div>

          <div className="flex space-x-4 pt-4">
            <button 
              onClick={() => addToCart(product)}
              className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center shadow-lg shadow-indigo-200"
            >
              <ShoppingCart className="w-5 h-5 mr-2" /> Add to Cart
            </button>
          </div>
        </motion.div>
      </div>

      {/* Review Section */}
      <ReviewSection productId={product.id} productName={product.name} />
    </div>
  );
}
