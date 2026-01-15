
import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import Header from './components/Header';
import BentoGrid from './components/BentoGrid';
import CartDrawer from './components/CartDrawer';
import CheckoutForm from './components/CheckoutForm';
import AdminDashboard from './components/AdminDashboard';
import AdminLogin from './components/AdminLogin';
import QuoteModal from './components/QuoteModal';
import ModelSelectorModal from './components/ModelSelectorModal';
import ProductDetailModal from './components/ProductDetailModal';
import FloatingCart from './components/FloatingCart';
import ServicesPage from './components/ServicesPage';
import HomePage from './components/HomePage';
import StorePage from './components/StorePage';
import Footer from './components/Footer';
import Logo from './components/Logo';
import { CartItem, Product, Order, Category, Coupon } from './types';
import { PRODUCTS } from './constants';
import { syncOrderToDb, fetchOrdersFromDb, updateOrderStatusInDb, fetchProductsFromDb, deleteOrderFromDb, subscribeToOrders, subscribeToProducts, addProductToDb, updateProductInDb, deleteProductFromDb, fetchCouponsFromDb, addCouponToDb, deleteCouponFromDb, incrementCouponUsage } from './supabase';

// Helper component to fix navigation scroll issue
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('fixit_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('fixit_orders');
    return saved ? JSON.parse(saved) : [];
  });

  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    const saved = localStorage.getItem('fixit_coupons');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    const loadCoupons = async () => {
      const dbCoupons = await fetchCouponsFromDb();
      if (dbCoupons) setCoupons(dbCoupons);
    };
    loadCoupons();
  }, []);

  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    return localStorage.getItem('fixit_admin_session') === 'active';
  });

  const [currentUser, setCurrentUser] = useState<string>(() => {
    return localStorage.getItem('fixit_admin_user') || 'Dinesh';
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedProductForQuote, setSelectedProductForQuote] = useState<Product | null>(null);
  const [selectedProductForModel, setSelectedProductForModel] = useState<Product | null>(null);
  const [selectedProductForDetail, setSelectedProductForDetail] = useState<Product | null>(null);

  const [notification, setNotification] = useState<{ title: string, message: string } | null>(null);

  const arrivalsRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize and unlock AudioContext on user interaction
  useEffect(() => {
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }

    const unlockAudio = () => {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }

      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // Play a silent buffer to truly unlock iOS/Safari
      const buffer = ctx.createBuffer(1, 1, 22050);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start(0);

      // Verify it's running
      if (ctx.state === 'running') {
        console.log("Audio Context Unlocked & Running");
        ['click', 'touchstart', 'touchend', 'keydown', 'scroll', 'mousemove'].forEach(evt =>
          window.removeEventListener(evt, unlockAudio)
        );
      }
    };

    // Attach to every possible interaction
    const events = ['click', 'touchstart', 'touchend', 'keydown', 'scroll', 'mousemove'];
    events.forEach(evt =>
      window.addEventListener(evt, () => {
        console.log(`User interaction detected: ${evt}`);
        unlockAudio();
      })
    );

    return () => {
      ['click', 'touchstart', 'touchend', 'keydown', 'scroll', 'mousemove'].forEach(evt =>
        window.removeEventListener(evt, unlockAudio)
      );
    };
  }, []);

  useEffect(() => {
    let orderSub: any;
    let productSub: any;

    const loadData = async () => {
      // 1. Initial Product Fetch
      const dbProducts = await fetchProductsFromDb();
      if (dbProducts) setProducts(dbProducts);

      // 2. Product Subscription (For Everyone)
      productSub = subscribeToProducts(async () => {
        const updated = await fetchProductsFromDb();
        if (updated) setProducts(updated);
      });

      // 3. Fetch Orders if Admin
      if (isAdminLoggedIn) {
        const fetchAndSetOrders = async () => {
          const dbOrders = await fetchOrdersFromDb();
          if (dbOrders) {
            setOrders(dbOrders);
            localStorage.setItem('fixit_orders', JSON.stringify(dbOrders));
          }
        };

        await fetchAndSetOrders();

        orderSub = subscribeToOrders((payload) => {
          console.log('Realtime Event Received:', payload);
          if (payload.eventType === 'INSERT') {
            console.log('New Order Inserted! Playing sound...');
            try {
              // Brute Force: Create fresh context for immediately engaging the hardware
              const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
              const ctx = new AudioContext();

              const osc = ctx.createOscillator();
              const gain = ctx.createGain();
              osc.connect(gain);
              gain.connect(ctx.destination);

              // Alarm Pattern
              osc.type = 'square';
              osc.frequency.setValueAtTime(880, ctx.currentTime);
              osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1);
              osc.frequency.setValueAtTime(880, ctx.currentTime + 0.2);
              gain.gain.setValueAtTime(1.0, ctx.currentTime);
              gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 1);

              osc.start();
              osc.stop(ctx.currentTime + 1);

            } catch (e) {
              console.error('Buzzer failed', e);
            }

            // Browser Notification logic (Inside INSERT block)
            const newOrder = payload.new;
            if (newOrder) {
              if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('New Order Received!', {
                  body: `₹${newOrder.total} - ${newOrder.customerName || newOrder.customer_name || 'Customer'}`,
                  icon: '/logo.png'
                });
              }

              // In-App Toast
              setNotification({
                title: 'New Order Received',
                message: `₹${newOrder.total} from ${newOrder.customerName || newOrder.customer_name || 'Customer'}`
              });
              setTimeout(() => setNotification(null), 5000);
            }
          }
          fetchAndSetOrders();
        });
      }
    };
    loadData();

    return () => {
      if (orderSub) orderSub.unsubscribe();
      if (productSub) productSub.unsubscribe();
    };
  }, [isAdminLoggedIn]);

  useEffect(() => {
    localStorage.setItem('fixit_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('fixit_orders', JSON.stringify(orders));
  }, [orders]);

  // Sync modals with live product state
  useEffect(() => {
    if (selectedProductForDetail) {
      const fresh = products.find(p => p.id === selectedProductForDetail.id);
      if (fresh && fresh !== selectedProductForDetail) setSelectedProductForDetail(fresh);
    }
    if (selectedProductForModel) {
      const fresh = products.find(p => p.id === selectedProductForModel.id);
      if (fresh && fresh !== selectedProductForModel) setSelectedProductForModel(fresh);
    }
    if (selectedProductForQuote) {
      const fresh = products.find(p => p.id === selectedProductForQuote.id);
      if (fresh && fresh !== selectedProductForQuote) setSelectedProductForQuote(fresh);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products]);

  const handleLogin = (password: string) => {
    if (password === 'dinesh@fixit') {
      setIsAdminLoggedIn(true);
      setCurrentUser('Dinesh');
      localStorage.setItem('fixit_admin_session', 'active');
      localStorage.setItem('fixit_admin_user', 'Dinesh');
      return true;
    }
    if (password === 'store3@fixit') {
      setIsAdminLoggedIn(true);
      setCurrentUser('Store');
      localStorage.setItem('fixit_admin_session', 'active');
      localStorage.setItem('fixit_admin_user', 'Store');
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setIsAdminLoggedIn(false);
    localStorage.removeItem('fixit_admin_session');
    localStorage.removeItem('fixit_admin_user');
  };

  const addToCart = (product: Product, quantity: number, phoneDetails?: string, quotedPrice?: number) => {
    // Strictly verify status against latest state
    const currentProduct = products.find(p => p.id === product.id) || product;

    if (currentProduct.isSoldOut) {
      alert("Sorry, this item is currently sold out.");
      return;
    }

    setCart(prev => {
      const existingKey = product.id + (phoneDetails || '');
      const existing = prev.find(item => (item.id + (item.phoneDetails || '')) === existingKey);

      if (existing) {
        return prev.map(item =>
          (item.id + (item.phoneDetails || '')) === existingKey
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { ...currentProduct, quantity, phoneDetails, quotedPrice }];
    });
    setIsCartOpen(true);
  };

  const updateCartQuantity = (uniqueId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if ((item.id + (item.phoneDetails || '')) === uniqueId) {
        const newQty = Math.max(1, Math.min(10, item.quantity + delta));
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const handleAddToCartRequest = (product: Product, quantity: number) => {
    // Strictly check latest status
    const currentProduct = products.find(p => p.id === product.id) || product;

    if (currentProduct.isSoldOut) {
      alert("This product is sold out.");
      return;
    }

    if (currentProduct.isModelRequired || currentProduct.isUniversalModel) {
      setSelectedProductForModel(currentProduct);
      return;
    }

    if (currentProduct.isContactOnly) {
      const msg = encodeURIComponent(`Hi Fix It, I'm interested in the ${currentProduct.name}.`);
      window.open(`https://wa.me/919182919360?text=${msg}`, '_blank');
      return;
    }

    if (currentProduct.isQuoteRequired) {
      setSelectedProductForQuote(currentProduct);
    } else {
      addToCart(currentProduct, quantity);
    }
  };

  const removeFromCart = (uniqueId: string) => {
    setCart(prev => prev.filter(item => (item.id + (item.phoneDetails || '')) !== uniqueId));
  };

  const clearCart = () => setCart([]);

  const createOrder = async (orderData: Omit<Order, 'id' | 'timestamp' | 'status'>): Promise<Order> => {
    const newOrder: Order = {
      ...orderData,
      id: `FIX-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
      timestamp: Date.now(),
      status: 'Pending'
    };

    setOrders(prev => [newOrder, ...prev]);
    clearCart();
    const result = await syncOrderToDb(newOrder);
    if (!result?.success) {
      console.error('Order Sync Warning:', result?.error);
      // We still proceed locally, or warn user? For now just log.
    }

    // Increment specific coupon usage if applicable
    if (newOrder.couponCode) {
      await incrementCouponUsage(newOrder.couponCode); // This runs blindly on backend

      // Optimistically update frontend coupon state
      setCoupons(prev => prev.map(c =>
        c.code === newOrder.couponCode
          ? { ...c, timesUsed: (c.timesUsed || 0) + 1 }
          : c
      ));
    }

    return newOrder;
  };

  const handleUpdateOrderStatus = async (id: string, status: Order['status']) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    await updateOrderStatusInDb(id, status);
  };

  const handleDeleteOrder = async (id: string) => {
    setOrders(prev => prev.filter(o => o.id !== id));
    await deleteOrderFromDb(id);
  };

  const handleAddCoupon = async (coupon: Coupon) => {
    const success = await addCouponToDb(coupon);
    if (success) {
      setCoupons(prev => [...prev, coupon]);
    } else {
      alert('Failed to add coupon. Code may already exist.');
    }
  };

  const handleDeleteCoupon = async (code: string) => {
    const success = await deleteCouponFromDb(code);
    if (success) {
      setCoupons(prev => prev.filter(c => c.code !== code));
    }
  };

  const getItemPrice = (item: CartItem) => item.quotedPrice || item.price || 0;
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + (getItemPrice(item) * item.quantity), 0);

  const filteredProducts = products.filter(p => {
    const isService = p.isQuoteRequired;
    if (isService) return false;

    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const repairServices = products.filter(p => p.isQuoteRequired);

  const scrollToArrivals = () => {
    arrivalsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const categories: (Category | 'All')[] = [
    'All', 'AirPods', 'Chargers', 'Cables', 'Skins', 'ScreenGuards', 'Speakers', 'Neckbands', 'WiredAudio'
  ];

  return (
    <>
      <ScrollToTop />
      {notification && (
        <div className="fixed top-4 right-4 bg-primary text-black px-6 py-4 rounded-xl shadow-2xl z-[9999] animate-in slide-in-from-right duration-300 flex items-center gap-3 border-2 border-white/20">
          <span className="material-symbols-outlined text-3xl">notifications_active</span>
          <div>
            <h4 className="font-black text-sm uppercase tracking-wider">{notification.title}</h4>
            <p className="text-xs font-bold opacity-80">{notification.message}</p>
          </div>
        </div>
      )}
      <div className={`min-h-screen text-white ${location.pathname === '/' || location.pathname === '/admin' || location.pathname === '/login' ? '' : 'pb-32'}`}>
        {location.pathname !== '/' && location.pathname !== '/login' && location.pathname !== '/admin' && (
          <Header
            isAdminLoggedIn={isAdminLoggedIn}
            onLogout={handleLogout}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        )}

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/store" element={
            <StorePage
              products={products}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              searchQuery={searchQuery}
              onAddToCart={handleAddToCartRequest}
              onViewDetails={setSelectedProductForDetail}
            />
          } />
          <Route path="/repairs" element={<ServicesPage services={repairServices} onSelect={(service) => handleAddToCartRequest(service, 1)} />} />
          <Route path="/admin" element={
            isAdminLoggedIn ?
              <AdminDashboard
                orders={orders}
                onOrderCreated={(newOrder: Order) => setOrders(prev => [newOrder, ...prev])}
                coupons={coupons}
                products={products}
                onAddCoupon={handleAddCoupon}
                onDeleteCoupon={handleDeleteCoupon}
                onLogout={handleLogout}
                onUpdateStatus={handleUpdateOrderStatus}
                onDeleteOrder={handleDeleteOrder}
                currentUser={currentUser}
                onAddProduct={async (prod) => {
                  console.log("App: onAddProduct called with", prod);
                  const newId = `PROD-${Date.now()}`;
                  try {
                    const saved = await addProductToDb({ ...prod, id: newId });
                    console.log("App: addProductToDb result", saved);
                    if (saved) {
                      const mapped: Product = {
                        id: saved.id,
                        name: saved.name,
                        category: saved.category,
                        price: saved.price,
                        description: saved.description,
                        image: saved.image,
                        size: saved.size,
                        isPopular: saved.is_popular,
                        isQuoteRequired: saved.is_quote_required,
                        isContactOnly: saved.is_contact_only,
                        isModelRequired: saved.is_model_required,
                        isUniversalModel: saved.is_universal_model,
                        rating: saved.rating,
                        reviews: saved.reviews,
                        isHidden: saved.is_hidden,
                        isSoldOut: saved.is_sold_out
                      };
                      setProducts(prev => [mapped, ...prev]);

                      // Refresh from DB to ensure sync
                      fetchProductsFromDb().then(fresh => {
                        if (fresh) setProducts(fresh);
                      });
                    }
                  } catch (e) {
                    console.error("App: Error adding product", e);
                    throw e;
                  }
                }}
                onUpdateProduct={async (id, updates) => {
                  setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
                  await updateProductInDb(id, updates);
                }}
                onDeleteProduct={async (id) => {
                  setProducts(prev => prev.filter(p => p.id !== id));
                  await deleteProductFromDb(id);
                }}
              />
              : <Navigate to="/login" replace />
          } />
          <Route path="/login" element={isAdminLoggedIn ? <Navigate to="/admin" replace /> : <AdminLogin onLogin={handleLogin} />} />
        </Routes>
        {!isAdminLoggedIn && location.pathname !== '/login' && location.pathname !== '/' && <Footer />}
        {location.pathname !== '/' && location.pathname !== '/admin' && location.pathname !== '/login' && <FloatingCart count={totalItems} onClick={() => setIsCartOpen(true)} />}
        <CartDrawer
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          items={cart}
          onRemove={removeFromCart}
          onUpdateQuantity={updateCartQuantity}
          onProceed={() => { setIsCartOpen(false); setIsCheckoutOpen(true); }}
        />
        {isCheckoutOpen && <CheckoutForm onClose={() => setIsCheckoutOpen(false)} onSubmit={createOrder} total={totalPrice} items={cart} coupons={coupons} />}
        {selectedProductForQuote && <QuoteModal
          product={selectedProductForQuote}
          onClose={() => setSelectedProductForQuote(null)}
          onConfirm={(details, price) => {
            addToCart(selectedProductForQuote, 1, details, price);
            setSelectedProductForQuote(null);
          }}
        />}
        {selectedProductForModel && <ModelSelectorModal
          product={selectedProductForModel}
          onClose={() => setSelectedProductForModel(null)}
          onConfirm={(model) => {
            addToCart(selectedProductForModel, 1, model);
            setSelectedProductForModel(null);
          }}
        />}
        {selectedProductForDetail && <ProductDetailModal
          product={selectedProductForDetail}
          onClose={() => setSelectedProductForDetail(null)}
          onAddToCart={(quantity) => handleAddToCartRequest(selectedProductForDetail, quantity)}
        />}
      </div >
    </>
  );
};

export default App;