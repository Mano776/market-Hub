import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db, auth } from '../../lib/firebase.js';
import { Package, Clock, CheckCircle, Truck, ChevronDown, ChevronUp, MapPin, CreditCard, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

export default function CustomerDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!auth.currentUser) return;
      try {
        const q = query(
          collection(db, 'orders'), 
          where('customerId', '==', auth.currentUser.uid),
          orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        setOrders(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-700 border-green-200';
      case 'shipped': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'processing': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      default: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered': return <CheckCircle className="w-4 h-4" />;
      case 'shipped': return <Truck className="w-4 h-4" />;
      case 'processing': return <Clock className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  if (loading) return (
    <div className="space-y-6">
      <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
      {[1, 2, 3].map(i => (
        <div key={i} className="h-40 bg-white rounded-3xl border border-gray-100 animate-pulse"></div>
      ))}
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Order History</h2>
        <div className="text-sm text-gray-500 font-medium">
          Total Orders: {orders.length}
        </div>
      </div>

      <div className="space-y-6">
        {orders.length > 0 ? orders.map((order) => (
          <div 
            key={order.id} 
            className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
          >
            {/* Order Header */}
            <div className="p-6 flex flex-wrap items-center justify-between gap-4 bg-gray-50/50">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white rounded-2xl shadow-sm">
                  <Package className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Order ID</p>
                  <p className="font-mono text-sm font-bold text-gray-900">{order.id.slice(0, 8)}...</p>
                </div>
              </div>

              <div className="flex items-center space-x-8">
                <div className="hidden sm:block">
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Date</p>
                  <div className="flex items-center text-sm font-bold text-gray-700">
                    <Calendar className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                    {new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Total</p>
                  <p className="text-lg font-black text-indigo-600">${order.totalAmount}</p>
                </div>
                <div className={`px-4 py-1.5 rounded-full text-xs font-black border flex items-center space-x-2 ${getStatusColor(order.status)}`}>
                  {getStatusIcon(order.status)}
                  <span>{order.status.toUpperCase()}</span>
                </div>
                <button 
                  onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                  className="p-2 hover:bg-white rounded-xl transition-colors text-gray-400 hover:text-indigo-600"
                >
                  {expandedOrder === order.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Order Summary (Visible when collapsed) */}
            {expandedOrder !== order.id && (
              <div className="px-6 py-4 flex items-center space-x-2 overflow-x-auto no-scrollbar">
                {order.items?.map((item, i) => (
                  <div key={i} className="flex-shrink-0 relative group">
                    <img 
                      src={item.image || `https://picsum.photos/seed/${item.id}/100/100`} 
                      alt={item.name}
                      className="w-12 h-12 rounded-xl object-cover border border-gray-100"
                      referrerPolicy="no-referrer"
                    />
                    {item.quantity > 1 && (
                      <span className="absolute -top-2 -right-2 bg-gray-900 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                        {item.quantity}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Expanded Details */}
            <AnimatePresence>
              {expandedOrder === order.id && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-gray-100"
                >
                  <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Items List */}
                    <div className="md:col-span-2 space-y-4">
                      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Items Ordered</h3>
                      <div className="space-y-3">
                        {order.items?.map((item, i) => (
                          <div key={i} className="flex items-center justify-between p-3 rounded-2xl border border-gray-50 hover:bg-gray-50 transition-colors">
                            <div className="flex items-center space-x-4">
                              <img 
                                src={item.image || `https://picsum.photos/seed/${item.id}/100/100`} 
                                alt={item.name}
                                className="w-16 h-16 rounded-xl object-cover border border-gray-100"
                                referrerPolicy="no-referrer"
                              />
                              <div>
                                <p className="font-bold text-gray-900">{item.name}</p>
                                <p className="text-xs text-gray-500">Unit Price: ${item.price}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-gray-900">${item.price * item.quantity}</p>
                              <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Shipping & Payment */}
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center">
                          <MapPin className="w-4 h-4 mr-2 text-indigo-600" /> Shipping Address
                        </h3>
                        <div className="p-4 bg-gray-50 rounded-2xl text-sm text-gray-600 leading-relaxed">
                          {order.shippingAddress ? (
                            <>
                              <p className="font-bold text-gray-900 mb-1">{order.shippingAddress.name}</p>
                              <p>{order.shippingAddress.street}</p>
                              <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}</p>
                            </>
                          ) : (
                            <p className="italic">Standard Shipping to registered address</p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center">
                          <CreditCard className="w-4 h-4 mr-2 text-indigo-600" /> Payment Method
                        </h3>
                        <div className="p-4 bg-gray-50 rounded-2xl text-sm text-gray-600 flex items-center justify-between">
                          <span className="font-medium">{order.paymentMethod || 'Credit Card'}</span>
                          <span className="font-mono text-xs">**** 4242</span>
                        </div>
                      </div>

                      {/* Order Timeline */}
                      <div className="space-y-3">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Order Status</h3>
                        <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
                          <div className="relative">
                            <div className={`absolute -left-6 w-4 h-4 rounded-full border-4 border-white shadow-sm ${order.status === 'pending' ? 'bg-yellow-400' : 'bg-green-500'}`}></div>
                            <p className="text-xs font-bold text-gray-900">Order Placed</p>
                            <p className="text-[10px] text-gray-400">{new Date(order.createdAt).toLocaleString()}</p>
                          </div>
                          {order.status !== 'pending' && (
                            <div className="relative">
                              <div className={`absolute -left-6 w-4 h-4 rounded-full border-4 border-white shadow-sm ${order.status === 'processing' ? 'bg-indigo-400' : 'bg-green-500'}`}></div>
                              <p className="text-xs font-bold text-gray-900">Processing</p>
                            </div>
                          )}
                          {['shipped', 'delivered'].includes(order.status) && (
                            <div className="relative">
                              <div className={`absolute -left-6 w-4 h-4 rounded-full border-4 border-white shadow-sm ${order.status === 'shipped' ? 'bg-blue-400' : 'bg-green-500'}`}></div>
                              <p className="text-xs font-bold text-gray-900">Shipped</p>
                            </div>
                          )}
                          {order.status === 'delivered' && (
                            <div className="relative">
                              <div className="absolute -left-6 w-4 h-4 rounded-full border-4 border-white shadow-sm bg-green-500"></div>
                              <p className="text-xs font-bold text-gray-900">Delivered</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )) : (
          <div className="bg-white p-16 rounded-3xl border border-gray-100 text-center space-y-6">
            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto">
              <Package className="w-10 h-10 text-indigo-300" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-gray-900">No orders yet</h3>
              <p className="text-gray-500 max-w-xs mx-auto">When you buy something, your order history will appear here.</p>
            </div>
            <Link to="/" className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
              Start Shopping
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

