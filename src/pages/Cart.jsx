import { useCart } from '../context/CartContext.jsx';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, total } = useCart();

  if (cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20 space-y-6">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
          <ShoppingBag className="w-12 h-12 text-gray-300" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Your cart is empty</h1>
        <p className="text-gray-500">Looks like you haven't added anything to your cart yet.</p>
        <Link to="/" className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <div key={item.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center space-x-6">
              <img 
                src={item.image || `https://picsum.photos/seed/${item.id}/200/200`} 
                alt={item.name} 
                className="w-24 h-24 rounded-2xl object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="flex-1 space-y-1">
                <h3 className="font-bold text-gray-900 text-lg">{item.name}</h3>
                <p className="text-indigo-600 font-bold">${item.price}</p>
              </div>
              <div className="flex items-center space-x-3 bg-gray-50 p-1 rounded-xl border border-gray-100">
                <button 
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="p-1 hover:bg-white rounded-lg transition-colors"
                >
                  <Minus className="w-4 h-4 text-gray-500" />
                </button>
                <span className="font-bold text-gray-900 w-8 text-center">{item.quantity}</span>
                <button 
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="p-1 hover:bg-white rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4 text-gray-500" />
                </button>
              </div>
              <button 
                onClick={() => removeFromCart(item.id)}
                className="p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <h2 className="text-xl font-bold text-gray-900">Order Summary</h2>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span className="font-bold text-gray-900">${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Shipping</span>
                <span className="font-bold text-green-600">Free</span>
              </div>
              <div className="pt-4 border-t border-gray-100 flex justify-between text-lg">
                <span className="font-bold text-gray-900">Total</span>
                <span className="font-extrabold text-indigo-600">${total.toFixed(2)}</span>
              </div>
            </div>
            <Link 
              to="/checkout"
              className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center shadow-lg shadow-indigo-200"
            >
              Checkout <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
          
          <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100">
            <p className="text-sm text-indigo-700 font-medium">
              Secure checkout powered by Stripe. Your data is encrypted and safe.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
