import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, doc, updateDoc, where, deleteDoc, getDoc, increment } from 'firebase/firestore';
import { db } from '../../lib/firebase.js';
import { Users, ShoppingBag, CheckCircle, XCircle, BarChart3, MessageSquare, Star } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('vendors');
  const [stats, setStats] = useState({ totalUsers: 0, totalVendors: 0, totalOrders: 0, totalSales: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersSnap = await getDocs(collection(db, 'users'));
        const ordersSnap = await getDocs(collection(db, 'orders'));
        const reviewsSnap = await getDocs(query(collection(db, 'reviews'), where('status', '==', 'pending')));
        
        const usersData = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const ordersData = ordersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const reviewsData = reviewsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        setUsers(usersData);
        setOrders(ordersData);
        setReviews(reviewsData);
        
        setStats({
          totalUsers: usersData.length,
          totalVendors: usersData.filter((u) => u.role === 'vendor').length,
          totalOrders: ordersData.length,
          totalSales: ordersData.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0)
        });
      } catch (error) {
        console.error('Error fetching admin data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleVendorStatus = async (userId, status) => {
    try {
      await updateDoc(doc(db, 'users', userId), { status });
      setUsers(users.map(u => u.id === userId ? { ...u, status } : u));
      toast.success(`Vendor ${status} successfully!`);
    } catch (error) {
      toast.error('Failed to update vendor status');
    }
  };

  const handleReviewStatus = async (reviewId, status) => {
    try {
      const reviewRef = doc(db, 'reviews', reviewId);
      const reviewSnap = await getDoc(reviewRef);
      
      if (!reviewSnap.exists()) return;
      const reviewData = reviewSnap.data();

      if (status === 'approved') {
        // Update product average rating
        const productRef = doc(db, 'products', reviewData.productId);
        const productSnap = await getDoc(productRef);
        
        if (productSnap.exists()) {
          const productData = productSnap.data();
          const currentCount = productData.reviewCount || 0;
          const currentRating = productData.averageRating || 0;
          const newRating = ((currentRating * currentCount) + reviewData.rating) / (currentCount + 1);
          
          await updateDoc(productRef, {
            averageRating: newRating,
            reviewCount: increment(1)
          });
        }
        await updateDoc(reviewRef, { status: 'approved' });
      } else {
        await deleteDoc(reviewRef);
      }

      setReviews(reviews.filter(r => r.id !== reviewId));
      toast.success(`Review ${status} successfully!`);
    } catch (error) {
      console.error('Error moderating review:', error);
      toast.error('Failed to moderate review');
    }
  };

  if (loading) return <div className="animate-pulse space-y-8">...</div>;

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'bg-blue-500' },
          { label: 'Vendors', value: stats.totalVendors, icon: ShoppingBag, color: 'bg-purple-500' },
          { label: 'Total Orders', value: stats.totalOrders, icon: CheckCircle, color: 'bg-green-500' },
          { label: 'Total Revenue', value: `$${stats.totalSales}`, icon: BarChart3, color: 'bg-orange-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center space-x-4">
            <div className={`${stat.color} p-3 rounded-2xl text-white`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 border-b border-gray-100">
        <button 
          onClick={() => setActiveTab('vendors')}
          className={`pb-4 px-2 font-bold text-sm transition-colors relative ${
            activeTab === 'vendors' ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Vendors
          {activeTab === 'vendors' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"></div>}
        </button>
        <button 
          onClick={() => setActiveTab('reviews')}
          className={`pb-4 px-2 font-bold text-sm transition-colors relative ${
            activeTab === 'reviews' ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Reviews Moderation
          {reviews.length > 0 && (
            <span className="ml-2 bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-[10px]">
              {reviews.length}
            </span>
          )}
          {activeTab === 'reviews' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"></div>}
        </button>
      </div>

      {activeTab === 'vendors' ? (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">Vendor Management</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-500 text-sm font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Vendor Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.filter(u => u.role === 'vendor').map((vendor) => (
                  <tr key={vendor.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{vendor.name}</td>
                    <td className="px-6 py-4 text-gray-600">{vendor.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        vendor.status === 'approved' ? 'bg-green-100 text-green-700' :
                        vendor.status === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {vendor.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 space-x-2">
                      {vendor.status === 'pending' && (
                        <>
                          <button 
                            onClick={() => handleVendorStatus(vendor.id, 'approved')}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => handleVendorStatus(vendor.id, 'rejected')}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.length > 0 ? reviews.map((review) => (
            <div key={review.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{review.customerName}</p>
                    <div className="flex items-center text-yellow-400">
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star key={s} className={`w-3 h-3 ${s <= review.rating ? 'fill-current' : 'text-gray-200'}`} />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleReviewStatus(review.id, 'approved')}
                    className="bg-green-50 text-green-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-green-100 transition-colors"
                  >
                    Approve
                  </button>
                  <button 
                    onClick={() => handleReviewStatus(review.id, 'rejected')}
                    className="bg-red-50 text-red-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-red-100 transition-colors"
                  >
                    Reject
                  </button>
                </div>
              </div>
              <p className="text-gray-600 italic">"{review.comment}"</p>
              <p className="text-xs text-gray-400">Product ID: {review.productId}</p>
            </div>
          )) : (
            <div className="bg-white p-12 rounded-3xl border border-gray-100 text-center text-gray-500">
              No reviews pending moderation.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
