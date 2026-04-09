import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, orderBy, limit, doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { db, auth } from '../lib/firebase.js';
import { Star, MessageSquare, Send, User } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion } from 'motion/react';

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
    <div className="space-y-8 pt-12 border-t border-gray-100">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <MessageSquare className="w-6 h-6 mr-2 text-indigo-600" />
          Customer Reviews
        </h2>
      </div>

      {/* Review Form */}
      {auth.currentUser ? (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-50 p-6 rounded-3xl border border-gray-100 space-y-4"
        >
          <h3 className="font-bold text-gray-900">Leave a Review</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <Star 
                    className={`w-6 h-6 ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                  />
                </button>
              ))}
            </div>
            <textarea
              required
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience with this product..."
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 h-24"
            />
            <button
              type="submit"
              disabled={submitting}
              className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Post Review'}
              <Send className="w-4 h-4 ml-2" />
            </button>
          </form>
        </motion.div>
      ) : (
        <div className="bg-indigo-50 p-4 rounded-2xl text-indigo-700 text-sm font-medium">
          Please login to leave a review.
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-6">
        {loading ? (
          <div className="animate-pulse space-y-4">
            {[1, 2].map(i => <div key={i} className="h-24 bg-gray-100 rounded-2xl"></div>)}
          </div>
        ) : reviews.length > 0 ? (
          reviews.map((review) => (
            <motion.div 
              key={review.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white p-6 rounded-2xl border border-gray-100 space-y-3"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{review.customerName}</p>
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star}
                          className={`w-3 h-3 ${star <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} 
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-gray-600 leading-relaxed">{review.comment}</p>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-12 text-gray-400">
            No reviews yet. Be the first to review!
          </div>
        )}
      </div>
    </div>
  );
}
