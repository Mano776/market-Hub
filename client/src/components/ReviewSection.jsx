import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, orderBy, limit, doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { db, auth } from '../lib/firebase.js';
import { Star, MessageSquare, Send, User } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

export default function ReviewSection({ productId, productName }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const q = query(
          collection(db, 'reviews'),
          where('productId', '==', productId),
          where('status', '==', 'approved'),
          orderBy('createdAt', 'desc'),
          limit(10)
        );
        const querySnapshot = await getDocs(q);
        setReviews(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [productId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!auth.currentUser) {
      toast.error('Please login to leave a review');
      return;
    }

    setSubmitting(true);
    try {
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
      const customerName = userDoc.exists() ? userDoc.data().name : 'Anonymous';

      const reviewData = {
        productId,
        customerId: auth.currentUser.uid,
        customerName,
        rating,
        comment,
        status: 'approved', // Auto-approved
        createdAt: new Date().toISOString(),
      };

      const reviewRef = await addDoc(collection(db, 'reviews'), reviewData);
      
      // Update product average rating immediately
      const productRef = doc(db, 'products', productId);
      const productSnap = await getDoc(productRef);
      
      if (productSnap.exists()) {
        const productData = productSnap.data();
        const currentCount = productData.reviewCount || 0;
        const currentRating = productData.averageRating || 0;
        const newRating = ((currentRating * currentCount) + rating) / (currentCount + 1);
        
        await updateDoc(productRef, {
          averageRating: newRating,
          reviewCount: increment(1)
        });
      }

      setReviews([{ id: reviewRef.id, ...reviewData }, ...reviews]);
      toast.success('Review posted successfully!');
      setComment('');
      setRating(5);
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div className="space-y-2">
          <h2 className="text-4xl font-black text-gray-900 tracking-tight">
            Curated <span className="text-indigo-600">Feedback</span>
          </h2>
          <p className="text-gray-400 font-medium">Reflections from our community</p>
        </div>
        
        {/* Rating Summary Snippet */}
        <div className="flex items-center gap-6 px-8 py-4 bg-indigo-50/30 rounded-2xl border border-indigo-100/30">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-400 fill-current" />
            <span className="text-xl font-black text-gray-900">
              {reviews.length > 0 
                ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
                : '0.0'}
            </span>
          </div>
          <div className="w-px h-8 bg-indigo-100/50" />
          <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">
            {reviews.length} Verified <br /> Reflections
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        {/* Review Form - Minimalist */}
        <div className="lg:col-span-1">
          {auth.currentUser ? (
            <form onSubmit={handleSubmit} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8 space-y-8 sticky top-24">
              <h3 className="text-lg font-black text-gray-900">Share your experience</h3>
              
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 text-center block">Rating</label>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`transition-all ${rating >= star ? 'text-yellow-400 scale-110' : 'text-gray-200'}`}
                    >
                      <Star className={`w-8 h-8 ${rating >= star ? 'fill-current' : ''}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Commentary</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="How does it feel in your collection?"
                  className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-white transition-all min-h-[150px] font-medium text-gray-600"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 disabled:opacity-50"
              >
                {submitting ? 'Archiving...' : 'Submit Reflection'}
              </button>
            </form>
          ) : (
            <div className="bg-gray-900 rounded-[2.5rem] p-8 text-white space-y-4 sticky top-24">
              <h3 className="text-xl font-black italic">Join the Collection</h3>
              <p className="opacity-60 text-sm font-medium">Sign in to share your reflections with the community.</p>
              <Link to="/login" className="block w-full bg-white text-gray-900 text-center py-4 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-gray-100 transition-colors">
                Login to Reflect
              </Link>
            </div>
          )}
        </div>

        {/* Reviews List */}
        <div className="lg:col-span-2 space-y-12">
          {loading ? (
            <div className="space-y-12">
              {[1, 2].map(i => <div key={i} className="h-40 bg-gray-50 rounded-[2rem] animate-pulse" />)}
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-20 bg-gray-50/50 rounded-[3rem] border border-dashed border-gray-200">
              <p className="text-gray-400 font-bold">No reflections yet. Be the first to share.</p>
            </div>
          ) : (
            reviews.map((review) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-indigo-600 fill-current' : 'text-gray-200'}`} />
                  ))}
                </div>

                <blockquote className="text-3xl font-black text-gray-900 leading-tight tracking-tight italic">
                  "{review.comment}"
                </blockquote>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 font-black">
                    {review.customerName?.charAt(0) || 'C'}
                  </div>
                  <div>
                    <h4 className="font-black text-gray-900">{review.customerName || 'Anonymous Curator'}</h4>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      Verified Collector • {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Example of optional photo support (visual only) */}
                {review.rating === 5 && (
                  <div className="pt-4">
                    <div className="aspect-video w-full max-w-sm rounded-[2rem] overflow-hidden bg-gray-100">
                      <img 
                        src={`https://images.unsplash.com/photo-1542491595-63e8509401cc?auto=format&fit=crop&q=80&w=800`} 
                        className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700 cursor-pointer"
                      />
                    </div>
                    <p className="mt-2 text-[10px] font-black uppercase tracking-widest text-gray-300">Shared by collector</p>
                  </div>
                )}
                
                <div className="pt-12 border-b border-gray-100" />
              </motion.div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
