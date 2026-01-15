
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Product, Order, CartItem, Coupon, Category } from '../types';
import Logo from './Logo';
import { fetchOrdersFromDb, uploadProductImage, syncOrderToDb } from '../supabase';

interface AdminDashboardProps {
  orders: Order[];
  onUpdateStatus: (id: string, status: Order['status']) => void;
  onDeleteOrder: (id: string) => void;
  onLogout: () => void;
  coupons: Coupon[];
  products?: Product[];
  onAddCoupon: (coupon: Coupon) => void;
  onDeleteCoupon: (code: string) => void;
  onAddProduct?: (product: Omit<Product, 'id'>) => Promise<void>;
  onUpdateProduct?: (id: string, updates: Partial<Product>) => Promise<void>;
  onDeleteProduct?: (id: string) => Promise<void>;
  currentUser?: string;
  onOrderCreated?: (order: Order) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({
  orders,
  onUpdateStatus,
  onDeleteOrder,
  onLogout,
  coupons,
  onAddCoupon,
  onDeleteCoupon,
  products = [],
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  currentUser,
  onOrderCreated
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'orders' | 'inventory' | 'pos'>('orders');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<Order['status'] | 'All'>('All');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Coupon State
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponDiscount, setNewCouponDiscount] = useState('');
  const [newCouponLimit, setNewCouponLimit] = useState('');

  // Product Form State
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [productForm, setProductForm] = useState<Partial<Product>>({
    name: '',
    category: 'Accessory',
    price: 0,
    description: '',
    image: '',
    size: 'small',
    isPopular: false,
    isQuoteRequired: false,
    isHidden: false,
    isSoldOut: false
  });

  // POS State
  const [posSearchQuery, setPosSearchQuery] = useState('');
  const [posCart, setPosCart] = useState<CartItem[]>([]);
  const [posCustomerName, setPosCustomerName] = useState('');
  const [posCustomerPhone, setPosCustomerPhone] = useState('');
  const [posPaymentMode, setPosPaymentMode] = useState<'Cash' | 'UPI' | 'Card'>('Cash');

  const prevOrdersCount = useRef(orders.length);

  const handleCreateCoupon = async () => {
    if (newCouponCode && newCouponDiscount) {
      const newCoupon: Coupon = {
        code: newCouponCode.toUpperCase(),
        discountPercentage: Number(newCouponDiscount),
        isActive: true,
        maxUses: newCouponLimit ? Number(newCouponLimit) : undefined,
        timesUsed: 0
      };

      // Assuming onAddCoupon handles the DB interaction and updates the coupons state
      // The provided snippet had `addCouponToDb` and `setCoupons` which are not defined in this context.
      // Sticking to the existing `onAddCoupon` prop.
      await onAddCoupon(newCoupon); // Assuming onAddCoupon is async or handles its own success/failure

      setNewCouponCode('');
      setNewCouponDiscount('');
      setNewCouponLimit('');
      alert('Coupon Generated Successfully!');
    } else {
      alert('Please fill in both coupon code and discount percentage.');
    }
  };

  const openEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({ ...product });
    setShowAddProduct(true);
  };

  const handleSaveProduct = async () => {
    if (!productForm.name || !productForm.description) {
      alert("Please fill in at least the Name and Description.");
      return;
    }

    const isEditing = !!editingProduct;
    setIsUploading(true);

    try {
      let imageUrl = productForm.image;

      if (selectedImage) {
        imageUrl = await uploadProductImage(selectedImage);
      } else if (!imageUrl) {
        imageUrl = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=1000';
      }

      if (isEditing && onUpdateProduct) {
        // Edit Mode
        await onUpdateProduct(editingProduct.id, { ...productForm, image: imageUrl });
        alert('Product Updated Successfully');
      } else if (onAddProduct) {
        // Create Mode
        await onAddProduct({
          name: productForm.name!,
          category: productForm.category as Category,
          price: Number(productForm.price),
          description: productForm.description!,
          image: imageUrl!,
          size: productForm.size || 'small',
          isPopular: productForm.isPopular,
          isQuoteRequired: productForm.isQuoteRequired,
          isContactOnly: productForm.isContactOnly,
          isModelRequired: productForm.isModelRequired,
          isUniversalModel: productForm.isUniversalModel,
          isHidden: productForm.isHidden || false,
          isSoldOut: productForm.isSoldOut || false
        } as Product);
        alert('Product Added Successfully');
      }

      setShowAddProduct(false);
      setEditingProduct(null);
      setSelectedImage(null);
      setProductForm({
        name: '', category: 'Accessory', price: 0, description: '', image: '', size: 'small', isPopular: false, isQuoteRequired: false, isHidden: false, isSoldOut: false
      });
    } catch (error) {
      console.error("Failed to save product:", error);
      alert("Failed to save product. If uploading an image, ensure you have run the setup_storage.sql script.");
    } finally {
      setIsUploading(false);
    }
  };

  // POS Logic
  const addToPosCart = (product: Product) => {
    setPosCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromPosCart = (productId: string) => {
    setPosCart(prev => prev.filter(item => item.id !== productId));
  };

  const updatePosQuantity = (productId: string, delta: number) => {
    setPosCart(prev => prev.map(item => {
      if (item.id === productId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const handleCreateInShopOrder = async () => {
    if (!posCustomerName || posCart.length === 0) {
      alert("Please enter customer name and add items to cart.");
      return;
    }

    const total = posCart.reduce((sum, item) => sum + (getItemPrice(item) * item.quantity), 0);

    const newOrder: any = {
      id: `POS-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
      customerName: posCustomerName,
      email: `pos-order-${Date.now()}@fixit.store`, // Dummy email to satisfy DB constraints
      phone: posCustomerPhone || 'N/A', // Ensure string
      address: 'In-Shop Purchase',
      items: posCart,
      total,
      paymentMode: posPaymentMode,
      status: 'Completed',
      timestamp: Date.now()
    };

    const result = await syncOrderToDb(newOrder);
    if (result && result.success) {
      alert("In-Shop Order Created Successfully!");
      if (onOrderCreated) onOrderCreated(newOrder); // Manual sync
      setPosCart([]);
      setPosCustomerName('');
      setPosCustomerPhone('');
      setActiveTab('orders');
    } else {
      const msg = result?.error?.message || result?.error?.details || JSON.stringify(result?.error) || "Unknown error";
      alert("Failed to create order: " + msg);
      console.error("Order Sync Error:", result?.error);
    }
  };

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
    await fetchOrdersFromDb();
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

  const handleInvoice = (order: Order, mode: 'print' | 'view') => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const receiptContent = `
      <html>
        <head>
          <title>Invoice #${order.id.split('-').pop()}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
            body { font-family: 'Inter', sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; color: #000; }
            .header { display: flex; justify-content: space-between; align-items: start; margin-bottom: 40px; border-bottom: 2px solid #eee; padding-bottom: 20px; }
            .brand-logo { position: relative; width: 60px; height: 60px; margin-right: 15px; }
            .brand-text { font-size: 32px; font-weight: 900; text-transform: uppercase; letter-spacing: -1px; line-height: 1; }
            .brand-text span { color: #facc15; }
            .brand-container { display: flex; align-items: center; }
            .invoice-details { text-align: right; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
            .card { background: #f9f9f9; padding: 20px; border-radius: 12px; }
            .label { font-size: 10px; font-weight: 700; text-transform: uppercase; color: #666; margin-bottom: 5px; letter-spacing: 1px; }
            .value { font-size: 14px; font-weight: 600; line-height: 1.4; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th { text-align: left; font-size: 10px; text-transform: uppercase; color: #666; padding: 10px; border-bottom: 1px solid #ddd; }
            td { padding: 15px 10px; font-size: 13px; font-weight: 500; border-bottom: 1px solid #eee; }
            .total-row { display: flex; justify-content: space-between; font-size: 18px; font-weight: 900; margin-top: 20px; padding-top: 20px; border-top: 2px solid #000; }
            @media print {
              body { padding: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="brand-container">
               <!-- SVG Logo Inline -->
               <svg viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg" class="brand-logo">
                 <path d="M145 70 H442 V367" stroke="black" stroke-width="75" stroke-linecap="round" stroke-linejoin="round"/>
                 <path d="M145 185 H327 V367" stroke="#FF0000" stroke-width="75" stroke-linecap="round" stroke-linejoin="round"/>
                 <rect x="145" y="420" width="45" height="45" fill="black" />
               </svg>
               <div class="brand-text">Fix It<span>.</span></div>
               <div style="margin-top: 10px; font-size: 11px; color: #666; line-height: 1.4;">
                 <p style="margin:0; font-weight: 700;">Shop no 6, Venkateshwara Swamy Temple Line,</p>
                 <p style="margin:0;">Near ITC Circle, Krishna Reddy Nagar,</p>
                 <p style="margin:0;">New Krishna Nagar, Kalluru, AP - 518002</p>
                 <p style="margin:0;">+91 91829 19360</p>
               </div>
            </div>
            <div class="invoice-details">
              <div class="type" style="font-weight: 900; font-size: 20px; margin-bottom: 8px;">INVOICE</div>
              <div class="meta">#${order.id.split('-').pop()}</div>
              <div class="meta" style="color: #666;">${new Date(order.timestamp).toLocaleDateString()}</div>
            </div>
          </div>

          <div class="grid">
            <div class="card">
              <div class="label">Billed To</div>
              <div class="value">${order.customerName}</div>
              <div class="value" style="color: #666;">${order.email}</div>
              <div class="value" style="color: #666;">${order.phone}</div>
              <div class="value" style="margin-top: 8px; font-size: 12px; white-space: pre-wrap;">${order.address}</div>
            </div>
            <div class="card">
              <div class="label">Payment Info</div>
              <div class="value">Method: ${order.paymentMode}</div>
              <div class="value" style="color: #666;">Status: ${order.status}</div>
              ${order.couponCode ? `<div class="value" style="margin-top:5px; color:#22c55e;">Coupon: ${order.couponCode}</div>` : ''}
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th style="text-align: right;">Price</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map(item => `
                <tr>
                  <td>
                    <div style="font-weight: 700;">${item.name}</div>
                    ${item.phoneDetails ? `<div style="font-size: 10px; color: #666; text-transform: uppercase; margin-top: 2px;">${item.phoneDetails}</div>` : ''}
                  </td>
                  <td>${item.quantity}</td>
                  <td style="text-align: right;">₹${getItemPrice(item).toLocaleString()}</td>
                  <td style="text-align: right;">₹${(getItemPrice(item) * item.quantity).toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="total-row">
            <span>Total Amount</span>
            <span>₹${order.total.toLocaleString()}</span>
          </div>

          <div style="margin-top: 50px; text-align: center; font-size: 11px; color: #999;">
            <p>Thank you for choosing Fix It Kurnool!</p>
            <p>For support: +91 91829 19360</p>
          </div>
          ${mode === 'print' ? `
          <script>
            window.onload = () => {
                 setTimeout(() => {
                     window.print();
                     window.close();
                 }, 500);
            };
          </script>
          ` : ''}
        </body>
      </html>
    `;

    printWindow.document.write(receiptContent);
    printWindow.document.close();
  };

  return (
    <div className="min-h-screen bg-[url('/admin-bg.png')] bg-cover bg-center bg-fixed text-white pb-20 pt-32 sm:pt-40">
      <div className="p-4 sm:p-8 max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-6">
          <div className="flex items-center gap-5">
            <Link to="/" className="shrink-0 bg-primary px-5 py-3 rounded-2xl border border-white/10 hover:opacity-90 transition-all shadow-xl shadow-primary/20 flex items-center justify-center">
              <span className="text-white font-black text-xl tracking-tighter uppercase leading-none">Fix It</span>
            </Link>

            <div>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <Link to="/store" className="text-primary font-bold flex items-center gap-1 hover:underline text-[10px] uppercase tracking-widest">
                  <span className="material-symbols-outlined text-xs">arrow_back</span>
                  Store
                </Link>
                <span className="text-white/10 text-[10px]">•</span>
                <span className="text-white/60 font-black text-[10px] uppercase tracking-widest">
                  {currentUser === 'Store' ? 'Welcome Store' : 'Welcome Dinesh, CEO of Fix It'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white leading-none">
                Owner Dashboard
              </h1>
              <div className="flex gap-4 mt-4">
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`text-[10px] font-black uppercase tracking-[0.2em] pb-2 border-b-2 transition-colors ${activeTab === 'orders' ? 'text-primary border-primary' : 'text-white/40 border-transparent hover:text-white'}`}
                >
                  Orders
                </button>
                <button
                  onClick={() => setActiveTab('inventory')}
                  className={`text-[10px] font-black uppercase tracking-[0.2em] pb-2 border-b-2 transition-colors ${activeTab === 'inventory' ? 'text-primary border-primary' : 'text-white/40 border-transparent hover:text-white'}`}
                >
                  Inventory
                </button>
                <button
                  onClick={() => setActiveTab('pos')}
                  className={`text-[10px] font-black uppercase tracking-[0.2em] pb-2 border-b-2 transition-colors ${activeTab === 'pos' ? 'text-primary border-primary' : 'text-white/40 border-transparent hover:text-white'}`}
                >
                  POS
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Total Revenue</p>
              <p className="text-xl font-black text-primary">₹{orders.reduce((sum, o) => sum + (o.total || 0), 0).toLocaleString()}</p>
            </div>
            <div className="text-right hidden sm:block">
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Total Orders</p>
              <p className="text-xl font-black text-white">{orders.length}</p>
            </div>

            <div className="h-10 w-px bg-white/10 hidden sm:block"></div>

            <div className="flex items-center gap-3">
              {/* Stats and Refresh buttons remain same */}
              <button
                onClick={() => {
                  try {
                    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
                    if (!AudioContext) {
                      alert("Audio API not supported in this browser");
                      return;
                    }
                    const ctx = new AudioContext();
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.connect(gain);
                    gain.connect(ctx.destination);

                    // Alarm sound pattern
                    osc.type = 'square';
                    osc.frequency.setValueAtTime(800, ctx.currentTime);
                    osc.frequency.setValueAtTime(800, ctx.currentTime + 0.1);
                    osc.frequency.setValueAtTime(0, ctx.currentTime + 0.11);
                    osc.frequency.setValueAtTime(800, ctx.currentTime + 0.2);

                    gain.gain.setValueAtTime(0.3, ctx.currentTime);

                    osc.start();
                    osc.stop(ctx.currentTime + 0.5);
                  } catch (e: any) {
                    alert("Audio failed: " + (e.message || e));
                  }
                }}
                className="size-14 rounded-2xl bg-neutral-900 text-yellow-500 bento-shadow flex items-center justify-center hover:bg-yellow-500/10 transition-all border border-white/5 shadow-inner"
                title="Test Notification Sound"
              >
                <span className="material-symbols-outlined text-2xl">volume_up</span>
              </button>
              <button
                onClick={handleManualRefresh}
                disabled={isRefreshing}
                className="size-14 rounded-2xl bg-neutral-900 text-primary bento-shadow flex items-center justify-center hover:bg-primary/10 transition-all border border-white/5 shadow-inner disabled:opacity-50"
              >
                <span className={`material-symbols-outlined text-2xl ${isRefreshing ? 'animate-spin' : ''}`}>refresh</span>
              </button>

              <button
                onClick={handleLogoutClick}
                className="h-14 px-6 rounded-2xl bg-red-500/10 text-red-500 font-bold bento-shadow flex items-center gap-2 hover:bg-red-500 hover:text-white transition-all border border-red-500/20 shadow-inner"
                title="Logout"
              >
                <span>Logout</span>
                <span className="material-symbols-outlined text-xl">logout</span>
              </button>
            </div>
          </div>
        </div>

        {activeTab === 'orders' ? (
          <>
            {/* Coupon Manager */}
            {/* Keep existing Coupon UI */}
            <div className="bg-neutral-900 p-6 rounded-[32px] border border-white/10 mb-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-32 translate-x-32 pointer-events-none" />

              <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center mb-6">
                <div>
                  <h2 className="text-xl font-black text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">local_activity</span>
                    Coupon Generator
                  </h2>
                  <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-1">Create Discounts & Offers</p>
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                  <input
                    type="text"
                    value={newCouponCode}
                    onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                    placeholder="CODE (e.g. SAVE20)"
                    className="bg-black border border-white/10 rounded-xl px-4 h-12 text-sm font-bold text-white placeholder:text-white/20 uppercase w-full md:w-40 focus:ring-1 focus:ring-primary outline-none"
                  />
                  <input
                    type="number"
                    value={newCouponDiscount}
                    onChange={(e) => setNewCouponDiscount(e.target.value)}
                    placeholder="%"
                    className="bg-black border border-white/10 rounded-xl px-4 h-12 text-sm font-bold text-white placeholder:text-white/20 w-20 focus:ring-1 focus:ring-primary outline-none text-center"
                  />
                  <input
                    type="number"
                    value={newCouponLimit}
                    onChange={(e) => setNewCouponLimit(e.target.value)}
                    placeholder="Limit"
                    className="bg-black border border-white/10 rounded-xl px-4 h-12 text-sm font-bold text-white placeholder:text-white/20 w-20 focus:ring-1 focus:ring-primary outline-none text-center"
                  />
                  <button
                    onClick={handleCreateCoupon}
                    disabled={!newCouponCode.trim() || newCouponDiscount === ''}
                    className="bg-white/10 hover:bg-white/20 text-white px-4 h-12 rounded-xl flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <span className="material-symbols-outlined">add</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {coupons.length === 0 && <p className="text-xs text-white/20 col-span-full italic py-2">No active coupons</p>}
                {coupons.map((coupon) => (
                  <div key={coupon.code} className="bg-black/40 border border-white/5 rounded-xl p-3 flex justify-between items-center group/coupon hover:border-primary/30 transition-colors">
                    <div>
                      <p className="text-sm font-black text-white">{coupon.code}</p>
                      <div className="flex gap-2 text-[9px] font-bold">
                        <span className="text-green-500">{coupon.discountPercentage}% OFF</span>
                        <span className="text-white/30">
                          {coupon.maxUses ? `${coupon.timesUsed}/${coupon.maxUses} Used` : 'Unlimited'}
                        </span>
                      </div>
                    </div>
                    <button onClick={() => onDeleteCoupon(coupon.code)} className="text-white/20 hover:text-red-500 transition-colors">
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  </div>
                ))}
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
                              <span className="font-mono text-[11px] font-black bg-black text-primary px-2 py-1 rounded-lg border border-primary/20 flex items-center gap-1 w-fit">
                                {order.id.split('-').pop()}
                                {order.id.startsWith('POS') && <span className="text-[8px] bg-primary text-black px-1 rounded ml-1">IN-STORE</span>}
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
                              <span className={`px-2 py-0.5 rounded text-[9px] font-black border ${order.paymentMode === 'UPI' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                order.paymentMode === 'Cash' || order.paymentMode === 'Card' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                  'bg-orange-500/10 text-orange-400 border-orange-500/20'
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
                          {/* Expanded View same as before, simplified for brevity here since replaced content mimics exact style */}
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
                                          <button onClick={(e) => { e.stopPropagation(); onUpdateStatus(order.id, 'Shipped'); }} className="px-5 h-10 bg-blue-500 text-white text-[10px] font-black rounded-xl hover:bg-blue-600 transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20">
                                            <span className="material-symbols-outlined text-sm">local_shipping</span> Mark as Shipped
                                          </button>
                                        )}
                                        {order.status === 'Shipped' && (
                                          <button onClick={(e) => { e.stopPropagation(); onUpdateStatus(order.id, 'Completed'); }} className="px-5 h-10 bg-primary text-black text-[10px] font-black rounded-xl hover:bg-white transition-all flex items-center gap-2 shadow-lg shadow-primary/20">
                                            <span className="material-symbols-outlined text-sm">task_alt</span> Complete Order
                                          </button>
                                        )}
                                        <button onClick={(e) => { e.stopPropagation(); if (window.confirm('Are you sure?')) onDeleteOrder(order.id); }} className="px-5 h-10 bg-red-500/10 text-red-500 border border-red-500/20 text-[10px] font-black rounded-xl hover:bg-red-500 hover:text-white transition-all flex items-center gap-2">
                                          <span className="material-symbols-outlined text-sm">delete</span> Delete
                                        </button>
                                        <button onClick={(e) => { e.stopPropagation(); handleInvoice(order, 'print'); }} className="px-5 h-10 bg-white/5 text-white border border-white/10 text-[10px] font-black rounded-xl hover:bg-white/20 transition-all flex items-center gap-2">
                                          <span className="material-symbols-outlined text-sm">print</span> Print
                                        </button>
                                        <button onClick={(e) => { e.stopPropagation(); handleInvoice(order, 'view'); }} className="px-5 h-10 bg-white/5 text-white border border-white/10 text-[10px] font-black rounded-xl hover:bg-white/20 transition-all flex items-center gap-2">
                                          <span className="material-symbols-outlined text-sm">visibility</span> View
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                  {/* Customer Info */}
                                  <div className="space-y-6">
                                    <div>
                                      <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-3">Customer Info</h4>
                                      <div className="bg-black/40 rounded-2xl p-5 border border-white/5 space-y-4">
                                        <div className="flex items-center justify-between">
                                          <div>
                                            <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Email</p>
                                            <p className="text-xs font-bold text-white">{order.email}</p>
                                          </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                          <div>
                                            <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Phone</p>
                                            <p className="text-xs font-bold text-white">{order.phone}</p>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    <div>
                                      <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-3">Shipping Address</h4>
                                      <div className="bg-black/40 rounded-2xl p-5 border border-white/5">
                                        <p className="text-xs font-medium text-white/70 leading-relaxed italic">"{order.address}"</p>
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
          </>
        ) : activeTab === 'inventory' ? (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-black text-white">Inventory Management</h2>
              <button onClick={() => { setEditingProduct(null); setProductForm({ name: '', category: 'Accessory', price: 0, description: '' }); setShowAddProduct(true); }} className="bg-primary text-black px-5 h-11 rounded-xl font-black text-xs uppercase tracking-wider hover:bg-white transition-all shadow-lg shadow-primary/20 flex items-center gap-2">
                <span className="material-symbols-outlined">add</span>
                Add Product
              </button>
            </div>

            {showAddProduct && (
              <div className="bg-neutral-900 border border-white/10 rounded-[32px] p-6 mb-8 animate-in slide-in-from-top-4">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-black text-white">{editingProduct ? 'Edit Product' : 'New Product'}</h3>
                  <button onClick={() => setShowAddProduct(false)} className="text-white/40 hover:text-white"><span className="material-symbols-outlined">close</span></button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input value={productForm.name} onChange={e => setProductForm({ ...productForm, name: e.target.value })} placeholder="Product Name" className="bg-black border border-white/10 rounded-xl px-4 h-12 text-sm text-white focus:border-primary outline-none" />
                  <input value={productForm.price} onChange={e => setProductForm({ ...productForm, price: Number(e.target.value) })} type="number" placeholder="Price (₹)" className="bg-black border border-white/10 rounded-xl px-4 h-12 text-sm text-white focus:border-primary outline-none" />
                  <select value={productForm.category} onChange={e => setProductForm({ ...productForm, category: e.target.value as Category })} className="bg-black border border-white/10 rounded-xl px-4 h-12 text-sm text-white focus:border-primary outline-none">
                    {['AirPods', 'Chargers', 'Cables', 'Skins', 'ScreenGuards', 'Speakers', 'Neckbands', 'WiredAudio', 'Accessory'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>

                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={e => {
                        if (e.target.files?.[0]) {
                          setSelectedImage(e.target.files[0]);
                          // Clear URL input if file selected
                          setProductForm({ ...productForm, image: '' });
                        }
                      }}
                      className="hidden"
                      id="image-upload"
                    />
                    <div className="flex gap-2">
                      <label htmlFor="image-upload" className="flex-1 bg-black border border-white/10 rounded-xl px-4 h-12 flex items-center gap-2 text-sm text-white/60 cursor-pointer hover:border-primary/50 transition-colors">
                        <span className="material-symbols-outlined">cloud_upload</span>
                        {selectedImage ? selectedImage.name : "Upload Image"}
                      </label>
                      {(selectedImage || productForm.image) && (
                        <div className="size-12 rounded-xl border border-white/10 overflow-hidden shrink-0">
                          <img src={selectedImage ? URL.createObjectURL(selectedImage) : productForm.image} className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  </div>
                  <input value={productForm.image} onChange={e => setProductForm({ ...productForm, image: e.target.value })} placeholder="Or paste Image URL" className="bg-black border border-white/10 rounded-xl px-4 h-12 text-sm text-white focus:border-primary outline-none" />
                  <textarea value={productForm.description} onChange={e => setProductForm({ ...productForm, description: e.target.value })} placeholder="Description" className="bg-black border border-white/10 rounded-xl px-4 py-3 h-24 text-sm text-white focus:border-primary outline-none col-span-1 md:col-span-2" />

                  <div className="col-span-1 md:col-span-2 flex flex-wrap gap-6">
                    <label className="flex items-center gap-2 cursor-pointer text-sm text-white/80">
                      <input type="checkbox" checked={productForm.isPopular} onChange={e => setProductForm({ ...productForm, isPopular: e.target.checked })} className="accent-primary" /> Is Popular?
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-sm text-white/80">
                      <input type="checkbox" checked={productForm.isQuoteRequired} onChange={e => setProductForm({ ...productForm, isQuoteRequired: e.target.checked })} className="accent-primary" /> Service (Quote Only)
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-sm text-white/80">
                      <input type="checkbox" checked={productForm.isSoldOut} onChange={e => setProductForm({ ...productForm, isSoldOut: e.target.checked })} className="accent-red-500" /> Sold Out?
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-sm text-white/80">
                      <input type="checkbox" checked={productForm.isHidden} onChange={e => setProductForm({ ...productForm, isHidden: e.target.checked })} className="accent-gray-500" /> Hidden?
                    </label>
                  </div>
                </div>
                <div className="mt-6 flex justify-end">
                  <button onClick={handleSaveProduct} disabled={isUploading} className="bg-white/10 hover:bg-white/20 text-white px-6 h-11 rounded-xl font-bold text-xs uppercase tracking-wider mr-2 disabled:opacity-50 disabled:cursor-not-allowed">
                    {isUploading ? 'Uploading...' : (editingProduct ? 'Save Changes' : 'Create Product')}
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map(p => (
                <div key={p.id} className={`bg-neutral-900 border ${p.isHidden ? 'border-red-500/20 opacity-60' : 'border-white/5'} rounded-2xl overflow-hidden group hover:border-white/20 transition-all`}>
                  <div className="h-32 bg-black/50 relative">
                    <img src={p.image} className="w-full h-full object-cover" />
                    <div className="absolute top-2 right-2 flex gap-1">
                      <button onClick={() => openEditProduct(p)} className="size-8 rounded-lg flex items-center justify-center backdrop-blur-md bg-black/40 text-white/60 hover:text-white hover:bg-blue-500 hover:shadow-lg transition-all" title="Edit Product">
                        <span className="material-symbols-outlined text-sm">edit</span>
                      </button>
                      <button onClick={() => onDeleteProduct && window.confirm('Are you sure you want to PERMANENTLY delete this product?') && onDeleteProduct(p.id)} className="size-8 rounded-lg flex items-center justify-center backdrop-blur-md bg-black/40 text-white/60 hover:text-white hover:bg-red-500 hover:shadow-lg transition-all" title="Delete Product">
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                      <button onClick={() => onUpdateProduct?.(p.id, { isHidden: !p.isHidden })} className={`size-8 rounded-lg flex items-center justify-center backdrop-blur-md ${p.isHidden ? 'bg-red-500 text-white' : 'bg-black/40 text-white/60 hover:text-white'}`} title={p.isHidden ? 'Show Product' : 'Hide Product'}>
                        <span className="material-symbols-outlined text-sm">{p.isHidden ? 'visibility_off' : 'visibility'}</span>
                      </button>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-sm font-black text-white line-clamp-1">{p.name}</h4>
                      <span className="text-[10px] font-bold text-white/40 uppercase">{p.category}</span>
                    </div>
                    <div className="flex justify-between items-center mt-4">
                      <p className="text-sm font-black text-primary">{p.isQuoteRequired ? 'Quote' : `₹${p.price}`}</p>
                      <button onClick={(e) => { e.stopPropagation(); onUpdateProduct?.(p.id, { isSoldOut: !p.isSoldOut }); }} className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-wider border ${p.isSoldOut ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-green-500/10 text-green-500 border-green-500/20'} hover:bg-white hover:text-black transition-all`}>
                        {p.isSoldOut ? 'Sold Out' : 'In Stock'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-xl font-black text-white mb-6">Point of Sale (In-Shop)</h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Product Selection */}
              <div className="lg:col-span-2 space-y-6">
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-white/40">search</span>
                  <input
                    type="text"
                    value={posSearchQuery}
                    onChange={(e) => setPosSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="w-full bg-neutral-900 border border-white/10 rounded-xl pl-12 pr-4 h-12 text-sm font-bold text-white placeholder:text-white/20 focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {products.filter(p => !p.isHidden && !p.isSoldOut && p.name.toLowerCase().includes(posSearchQuery.toLowerCase())).map(product => (
                    <button
                      key={product.id}
                      onClick={() => addToPosCart(product)}
                      className="bg-neutral-900 border border-white/5 rounded-xl p-4 text-left hover:border-primary/50 hover:bg-white/5 transition-all group"
                    >
                      <div className="h-24 bg-black/50 rounded-lg mb-3 overflow-hidden relative">
                        <img src={product.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      </div>
                      <h4 className="text-xs font-bold text-white line-clamp-1">{product.name}</h4>
                      <p className="text-[10px] text-white/40 uppercase font-bold mt-1">{product.category}</p>
                      <p className="text-sm font-black text-primary mt-2">₹{product.price}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Cart & Checkout */}
              <div className="bg-neutral-900 border border-white/10 rounded-2xl p-6 h-fit sticky top-24">
                <h3 className="text-lg font-black text-white mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">shopping_cart</span>
                  Current Order
                </h3>

                <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto">
                  {posCart.length === 0 ? (
                    <p className="text-white/40 text-center text-xs py-8">Cart is empty</p>
                  ) : (
                    posCart.map(item => (
                      <div key={item.id} className="flex gap-3 bg-black/20 p-3 rounded-xl border border-white/5">
                        <img src={item.image} className="size-12 rounded-lg object-cover bg-black" />
                        <div className="flex-1">
                          <h4 className="text-xs font-bold text-white line-clamp-1">{item.name}</h4>
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-xs font-black text-primary">₹{item.price}</span>
                            <div className="flex items-center gap-2 bg-black rounded-lg px-2 py-1">
                              <button onClick={() => updatePosQuantity(item.id, -1)} className="text-white/40 hover:text-white text-[10px]">-</button>
                              <span className="text-xs font-bold text-white w-4 text-center">{item.quantity}</span>
                              <button onClick={() => updatePosQuantity(item.id, 1)} className="text-white/40 hover:text-white text-[10px]">+</button>
                            </div>
                            <button onClick={() => removeFromPosCart(item.id)} className="text-red-500 hover:text-red-400">
                              <span className="material-symbols-outlined text-sm">delete</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="space-y-4 pt-6 border-t border-white/10">
                  <div>
                    <label className="text-[10px] font-bold text-white/40 uppercase mb-1 block">Customer Name</label>
                    <input
                      type="text"
                      value={posCustomerName}
                      onChange={(e) => setPosCustomerName(e.target.value)}
                      className="w-full bg-black border border-white/10 rounded-lg h-9 px-3 text-xs text-white focus:border-primary outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-white/40 uppercase mb-1 block">Phone (Optional)</label>
                    <input
                      type="text"
                      value={posCustomerPhone}
                      onChange={(e) => setPosCustomerPhone(e.target.value)}
                      className="w-full bg-black border border-white/10 rounded-lg h-9 px-3 text-xs text-white focus:border-primary outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-white/40 uppercase mb-1 block">Payment Mode</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['Cash', 'UPI', 'Card'].map(mode => (
                        <button
                          key={mode}
                          onClick={() => setPosPaymentMode(mode as any)}
                          className={`h-9 rounded-lg text-xs font-bold border transition-all ${posPaymentMode === mode ? 'bg-primary text-black border-primary' : 'bg-black text-white border-white/10 hover:border-white/30'}`}
                        >
                          {mode}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4">
                    <span className="text-white/60 font-bold uppercase text-xs">Total</span>
                    <span className="text-xl font-black text-white">
                      ₹{posCart.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0)}
                    </span>
                  </div>

                  <button
                    onClick={handleCreateInShopOrder}
                    className="w-full h-12 bg-primary text-black font-black uppercase tracking-wider rounded-xl hover:bg-white transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined">check_circle</span>
                    Place Order
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;
