
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Order, CartItem } from '../types';
import Logo from './Logo';
import { fetchOrdersFromDb } from '../supabase';

interface AdminDashboardProps {
  orders: Order[];
  onUpdateStatus: (id: string, status: Order['status']) => void;
  onDeleteOrder: (id: string) => void;
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ orders, onUpdateStatus, onDeleteOrder, onLogout }) => {
  const navigate = useNavigate();
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<Order['status'] | 'All'>('All');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const prevOrdersCount = useRef(orders.length);

  // Request Notification Permissions on Dashboard mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Real-time alert logic for browser notifications
  useEffect(() => {
    if (orders.length > prevOrdersCount.current) {
      const newOrder = orders[0];
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('New Order Received! 🚀', {
          body: `Order from ${newOrder.customerName} for ₹${newOrder.total.toLocaleString()}`,
          icon: 'https://img.icons8.com/color/192/iphone-x.png'
        });
      }
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      audio.play().catch(e => console.log('Audio alert blocked by browser'));
    }
    prevOrdersCount.current = orders.length;
  }, [orders]);

  const handleLogoutClick = () => {
    onLogout();
    navigate('/');
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await fetchOrdersFromDb(); // Parent App.tsx effect handles state sync usually, but we could pass a refetch prop
    // In this MVP, we assume App.tsx re-syncs or we can just reload the page for a hard sync
    setTimeout(() => {
      setIsRefreshing(false);
      window.location.reload();
    }, 1000);
  };

  const filteredOrders = filterStatus === 'All'
    ? orders
    : orders.filter(o => o.status === filterStatus);

  const toggleExpand = (id: string) => {
    setExpandedOrderId(expandedOrderId === id ? null : id);
  };

  const getItemPrice = (item: CartItem) => item.quotedPrice || item.price || 0;

  return (
    <div className="min-h-screen bg-black text-white pb-20 pt-32 sm:pt-40">
      <div className="p-4 sm:p-8 max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-6">
          <div className="flex items-center gap-5">
            <Link to="/" className="shrink-0 bg-primary px-5 py-3 rounded-2xl border border-white/10 hover:opacity-90 transition-all shadow-xl shadow-primary/20 flex items-center justify-center">
              <span className="text-white font-black text-xl tracking-tighter uppercase leading-none">Fix It</span>
            </Link>

            <div>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <Link to="/" className="text-primary font-bold flex items-center gap-1 hover:underline text-[10px] uppercase tracking-widest">
                  <span className="material-symbols-outlined text-xs">arrow_back</span>
                  Store
                </Link>
                <span className="text-white/10 text-[10px]">•</span>
                <span className="text-white/60 font-black text-[10px] uppercase tracking-widest">
                  Welcome Dinesh, CEO of Fix It
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white leading-none">
                Owner Dashboard
              </h1>
              <p className="text-[10px] text-primary font-black uppercase tracking-[0.2em] mt-2 flex items-center gap-1">
                <span className="size-1.5 rounded-full bg-primary animate-pulse"></span>
                Authorized Admin Session
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="size-14 rounded-2xl bg-neutral-900 text-primary bento-shadow flex items-center justify-center hover:bg-primary/10 transition-all border border-white/5 shadow-inner disabled:opacity-50"
            >
              <span className={`material-symbols-outlined text-2xl ${isRefreshing ? 'animate-spin' : ''}`}>refresh</span>
            </button>
            <div className="bg-neutral-900 px-6 py-4 rounded-2xl bento-shadow border-l-4 border-primary border border-white/5">
              <p className="text-[10px] font-black uppercase text-white/40 tracking-widest mb-1">Total Sales</p>
              <p className="text-2xl font-black text-white">₹{orders.reduce((s, o) => s + o.total, 0).toLocaleString()}</p>
            </div>
            <button
              onClick={() => {
                const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
                audio.play().catch(e => alert('Audio blocked. Please interact with the page first.'));
              }}
              className="size-14 rounded-2xl bg-neutral-900 text-yellow-500 bento-shadow flex items-center justify-center hover:bg-yellow-500/10 transition-all border border-white/5 shadow-inner"
              title="Test Sound"
            >
              <span className="material-symbols-outlined text-2xl">notifications_active</span>
            </button>
            <button
              onClick={handleLogoutClick}
              className="size-14 rounded-2xl bg-neutral-900 text-red-500 bento-shadow flex items-center justify-center hover:bg-red-500/10 transition-all border border-white/5 shadow-inner"
              title="Logout"
            >
              <span className="material-symbols-outlined text-2xl">logout</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar pb-2">
          {(['All', 'Pending', 'Shipped', 'Completed'] as const).map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-5 h-11 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${filterStatus === status
                ? 'bg-primary text-black border-primary shadow-lg shadow-primary/20'
                : 'bg-white/5 text-white/40 border-white/10 hover:border-white/20'
                }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Orders Table */}
        <div className="bg-neutral-900 rounded-[32px] overflow-hidden bento-shadow border border-white/10">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white/5 border-b border-white/5">
                <tr>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-white/40">Reference & Date</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-white/40">Customer</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-white/40">Amount & Items</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-white/40">Payment</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-white/40">Status</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-white/40 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-20 text-center text-white/20">
                      <span className="material-symbols-outlined text-6xl block mb-4 opacity-10">receipt_long</span>
                      <p className="font-bold">No orders found.</p>
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map(order => (
                    <React.Fragment key={order.id}>
                      <tr
                        className={`hover:bg-white/5 transition-colors cursor-pointer ${expandedOrderId === order.id ? 'bg-white/5' : ''}`}
                        onClick={() => toggleExpand(order.id)}
                      >
                        <td className="px-6 py-5">
                          <span className="font-mono text-[11px] font-black bg-black text-primary px-2 py-1 rounded-lg border border-primary/20">
                            {order.id.split('-').pop()}
                          </span>
                          <p className="text-[9px] font-bold opacity-30 mt-1.5 uppercase tracking-tighter">
                            {new Date(order.timestamp).toLocaleDateString()} • {new Date(order.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </td>
                        <td className="px-6 py-5">
                          <p className="font-extrabold text-sm text-white">{order.customerName}</p>
                          <p className="text-[10px] font-bold text-primary/60">{order.phone}</p>
                        </td>
                        <td className="px-6 py-5">
                          <p className="font-black text-sm text-white">₹{order.total.toLocaleString()}</p>
                          <p className="text-[10px] font-bold text-white/30 uppercase">{order.items.length} items</p>
                        </td>
                        <td className="px-6 py-5">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black border ${order.paymentMode === 'UPI' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                            }`}>
                            {order.paymentMode}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${order.status === 'Pending' ? 'bg-yellow-400/10 text-yellow-500' :
                            order.status === 'Shipped' ? 'bg-blue-400/10 text-blue-400' : 'bg-primary/10 text-primary'
                            }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <span className="material-symbols-outlined text-white/20 transition-transform" style={{ transform: expandedOrderId === order.id ? 'rotate(180deg)' : 'none' }}>
                            expand_more
                          </span>
                        </td>
                      </tr>
                      {expandedOrderId === order.id && (
                        <tr>
                          <td colSpan={6} className="px-6 pb-8 bg-white/[0.02] animate-in slide-in-from-top-4 duration-300">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
                              <div className="space-y-6">
                                <div>
                                  <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-3">Order Items</h4>
                                  <div className="space-y-3 bg-black/40 rounded-2xl p-4 border border-white/5">
                                    {order.items.map((item, idx) => (
                                      <div key={idx} className="flex justify-between items-start">
                                        <div className="flex gap-3">
                                          <img src={item.image} className="size-10 rounded-lg object-cover border border-white/10" />
                                          <div>
                                            <p className="text-xs font-bold text-white">{item.name} <span className="text-white/40">x {item.quantity}</span></p>
                                            {item.phoneDetails && <p className="text-[9px] text-primary/60 font-black uppercase mt-0.5 tracking-tighter">{item.phoneDetails}</p>}
                                          </div>
                                        </div>
                                        <p className="text-xs font-black text-white">₹{(getItemPrice(item) * item.quantity).toLocaleString()}</p>
                                      </div>
                                    ))}
                                    <div className="pt-3 mt-3 border-t border-white/5 flex justify-between items-center">
                                      <p className="text-[10px] font-black uppercase text-white/30 tracking-widest">Subtotal</p>
                                      <p className="text-sm font-black text-primary">₹{order.total.toLocaleString()}</p>
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-3">Manage Order</h4>
                                  <div className="flex flex-wrap gap-2">
                                    {order.status === 'Pending' && (
                                      <button
                                        onClick={(e) => { e.stopPropagation(); onUpdateStatus(order.id, 'Shipped'); }}
                                        className="px-5 h-10 bg-blue-500 text-white text-[10px] font-black rounded-xl hover:bg-blue-600 transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20"
                                      >
                                        <span className="material-symbols-outlined text-sm">local_shipping</span>
                                        Mark as Shipped
                                      </button>
                                    )}
                                    {order.status === 'Shipped' && (
                                      <button
                                        onClick={(e) => { e.stopPropagation(); onUpdateStatus(order.id, 'Completed'); }}
                                        className="px-5 h-10 bg-primary text-black text-[10px] font-black rounded-xl hover:bg-white transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
                                      >
                                        <span className="material-symbols-outlined text-sm">task_alt</span>
                                        Complete Order
                                      </button>
                                    )}
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (window.confirm('Are you sure you want to delete this order? This cannot be undone.')) {
                                          onDeleteOrder(order.id);
                                        }
                                      }}
                                      className="px-5 h-10 bg-red-500/10 text-red-500 border border-red-500/20 text-[10px] font-black rounded-xl hover:bg-red-500 hover:text-white transition-all flex items-center gap-2"
                                    >
                                      <span className="material-symbols-outlined text-sm">delete</span>
                                      Delete Order
                                    </button>
                                  </div>
                                </div>
                              </div>
                              <div className="space-y-6">
                                <div>
                                  <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-3">Customer Info</h4>
                                  <div className="bg-black/40 rounded-2xl p-5 border border-white/5 space-y-4">
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Email</p>
                                        <p className="text-xs font-bold text-white">{order.email}</p>
                                      </div>
                                      <a href={`mailto:${order.email}`} className="size-9 rounded-lg bg-white/5 flex items-center justify-center text-white/60 hover:text-white transition-all border border-white/10">
                                        <span className="material-symbols-outlined text-lg">mail</span>
                                      </a>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Phone</p>
                                        <p className="text-xs font-bold text-white">{order.phone}</p>
                                      </div>
                                      <a href={`tel:${order.phone}`} className="size-9 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 hover:bg-blue-500 hover:text-white transition-all border border-blue-500/20">
                                        <span className="material-symbols-outlined text-lg">call</span>
                                      </a>
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-3">Shipping Address</h4>
                                  <div className="bg-black/40 rounded-2xl p-5 border border-white/5">
                                    <p className="text-xs font-medium text-white/70 leading-relaxed italic">
                                      "{order.address}"
                                    </p>
                                    <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-2">
                                      <span className="material-symbols-outlined text-primary text-sm">location_on</span>
                                      <span className="text-[10px] font-black text-white uppercase tracking-widest">Kurnool, Andhra Pradesh</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className="mt-12 text-center opacity-20">
          <p className="text-[9px] font-black uppercase tracking-[0.4em]">Proprietary POS Logic • Fix It Kurnool</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
