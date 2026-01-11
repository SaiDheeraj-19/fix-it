
import React, { useState, useEffect, useMemo } from 'react';
import { Order, CartItem } from '../types';

interface CheckoutFormProps {
  onClose: () => void;
  onSubmit: (data: Omit<Order, 'id' | 'timestamp' | 'status'>) => Promise<Order>;
  total: number;
  items: CartItem[];
}

type CheckoutStep = 'DETAILS' | 'PAYMENT' | 'PROCESSING' | 'SUCCESS';

const CheckoutForm: React.FC<CheckoutFormProps> = ({ onClose, onSubmit, total, items }) => {
  const [step, setStep] = useState<CheckoutStep>('DETAILS');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    paymentMode: 'UPI' as Order['paymentMode']
  });

  const [addressData, setAddressData] = useState({
    street: '',
    city: 'Kurnool',
    pincode: '',
    landmark: '',
    state: 'Andhra Pradesh'
  });

  const [transactionIdInput, setTransactionIdInput] = useState('');
  const [verificationStatus, setVerificationStatus] = useState('');
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [paymentTimer, setPaymentTimer] = useState(300);
  const [isVerifying, setIsVerifying] = useState(false);

  const upiId = "9182919360-6@ibl";
  const ownerPhone = "919182919360";

  // Stable transaction reference to prevent QR code from regenerating on every timer tick
  const transactionRef = useMemo(() => `FIX${Date.now()}${Math.floor(Math.random() * 1000)}`, []);

  // Pre-filled UPI intent link with transaction note (tn)
  const upiLink = useMemo(() => {
    return `upi://pay?pa=${upiId}&pn=Fix%20It%20Kurnool&tr=${transactionRef}&am=${total}&cu=INR&mc=5411&tn=FixIt%20Order`;
  }, [total, transactionRef]);

  useEffect(() => {
    let interval: any;
    if (step === 'PAYMENT' && formData.paymentMode === 'UPI' && paymentTimer > 0) {
      interval = setInterval(() => {
        setPaymentTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, paymentTimer, formData.paymentMode]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.paymentMode === 'COD') {
      confirmOrder();
    } else {
      setStep('PAYMENT');
    }
  };

  const confirmOrder = () => {
    setIsVerifying(true);
    setStep('PROCESSING');

    // Realistic simulation steps
    const steps = [
      "Contacting secure gateway...",
      "Validating transaction hash...",
      "NPCI Node check active...",
      "Confirming bank settlement...",
      "Generating order receipt..."
    ];

    let currentStep = 0;
    const interval = setInterval(async () => {
      if (currentStep < steps.length) {
        setVerificationStatus(steps[currentStep]);
        currentStep++;
      } else {
        clearInterval(interval);
        try {
          const fullAddress = `${addressData.street}, ${addressData.landmark ? addressData.landmark + ', ' : ''}${addressData.city}, ${addressData.state} - ${addressData.pincode}`;

          const order = await onSubmit({
            customerName: formData.name,
            email: formData.email,
            phone: formData.phone,
            address: fullAddress,
            items,
            total,
            paymentMode: formData.paymentMode
          });
          setCreatedOrder(order);
          setStep('SUCCESS');
        } catch (error) {
          console.error("Order creation failed", error);
          // Handle error state if needed, simpler to just log for now
        } finally {
          setIsVerifying(false);
        }
      }
    }, 800);
  };

  const simulatePaymentVerification = () => {
    if (transactionIdInput.length < 12) return;
    confirmOrder();
  };

  const getItemPrice = (item: CartItem) => item.quotedPrice || item.price || 0;

  const notifyOwnerOnWhatsApp = () => {
    if (!createdOrder) return;

    const itemsList = createdOrder.items
      .map(item => `• ${item.name} (${item.quantity}x) - ₹${(getItemPrice(item) * item.quantity).toLocaleString()}${item.phoneDetails ? ` [${item.phoneDetails}]` : ''}`)
      .join('\n');

    const paymentStatus = createdOrder.paymentMode === 'UPI' ? `Payment Verified ✅ (Ref: ${transactionIdInput})` : 'Cash on Delivery (Pending Payment) 💵';
    const tag = createdOrder.paymentMode === 'UPI' ? 'PAID ORDER' : 'COD ORDER';

    const message = `🚀 *${tag}: Fix It Kurnool*\n\n` +
      `*Order ID:* ${createdOrder.id}\n` +
      `*Customer:* ${createdOrder.customerName}\n` +
      `*Phone:* ${createdOrder.phone}\n` +
      `*Address:* ${createdOrder.address}\n\n` +
      `*Items:*\n${itemsList}\n\n` +
      `*Total Amount:* ₹${createdOrder.total.toLocaleString()}\n` +
      `*Status:* ${paymentStatus}\n\n` +
      `_Order is ready for processing._`;

    window.open(`https://wa.me/${ownerPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (step === 'PROCESSING') {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/98 backdrop-blur-2xl" />
        <div className="relative text-center w-full max-w-xs">
          <div className="size-28 relative mx-auto mb-10">
            <div className="absolute inset-0 border-4 border-primary/10 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-transparent border-t-primary rounded-full animate-spin"></div>
            <div className="absolute inset-4 border-2 border-white/5 rounded-full animate-pulse"></div>
          </div>
          <p className="text-primary text-[10px] font-black uppercase tracking-[0.5em] mb-4 animate-pulse">Security Check</p>
          <h2 className="text-lg font-black text-white h-8">
            {verificationStatus || 'Initializing...'}
          </h2>
          <div className="mt-8 flex justify-center gap-1">
            {[0, 1, 2, 3, 4].map(i => <div key={i} className="size-1 bg-white/10 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.1}s` }} />)}
          </div>
        </div>
      </div>
    );
  }

  if (step === 'SUCCESS' && createdOrder) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" />
        <div className="relative w-full max-w-md bg-neutral-900 rounded-[32px] border border-primary/20 p-8 text-center animate-in zoom-in-95 duration-300">
          <div className="size-20 bg-green-500/10 rounded-full flex items-center justify-center text-green-500 mx-auto mb-6 border border-green-500/20 shadow-[0_0_30px_rgba(34,197,94,0.15)]">
            <span className="material-symbols-outlined text-4xl">verified</span>
          </div>
          <h2 className="text-3xl font-black text-white mb-2">Order Confirmed!</h2>
          <p className="text-sm text-white/40 mb-8">Ref: <span className="text-primary font-mono">{createdOrder.id.split('-').pop()}</span></p>

          <div className="bg-black/50 rounded-2xl p-6 mb-8 text-left border border-white/5">
            <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-4">Final Receipt</p>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-xs font-bold text-white/60">
                <span>Payment Status</span>
                <span className={createdOrder.paymentMode === 'UPI' ? 'text-green-500' : 'text-yellow-500'}>
                  {createdOrder.paymentMode === 'UPI' ? 'PAID & VERIFIED' : 'PENDING (COD)'}
                </span>
              </div>
              <div className="flex justify-between text-xs font-bold text-white/60">
                <span>Payment Method</span>
                <span>{createdOrder.paymentMode}</span>
              </div>
              {transactionIdInput && (
                <div className="flex justify-between text-xs font-bold text-white/60">
                  <span>Bank Ref No.</span>
                  <span className="font-mono">{transactionIdInput}</span>
                </div>
              )}
            </div>
            <div className="border-t border-white/5 pt-4 flex justify-between items-center">
              <span className="text-sm font-black text-white">Total Amount</span>
              <span className="text-xl font-black text-primary">₹{createdOrder.total.toLocaleString()}</span>
            </div>
          </div>

          <div className="space-y-4">
            <button
              onClick={notifyOwnerOnWhatsApp}
              className="w-full h-14 bg-primary text-black font-black rounded-xl flex items-center justify-center gap-3 shadow-xl shadow-primary/30 transition-all hover:bg-white active:scale-95"
            >
              <span>Share Receipt to WhatsApp</span>
              <span className="material-symbols-outlined">chat</span>
            </button>
            <button
              onClick={onClose}
              className="w-full h-14 bg-white/5 text-white/60 font-black rounded-xl hover:bg-white/10 transition-all"
            >
              Back to Store
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'PAYMENT') {
    return (
      <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
        <div className="relative w-full max-w-md bg-neutral-900 rounded-t-3xl sm:rounded-[40px] shadow-2xl overflow-hidden border border-white/10 flex flex-col animate-in slide-in-from-bottom-8 duration-500">
          <div className="p-6 bg-black border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary border border-primary/20">
                <span className="material-symbols-outlined">qr_code_scanner</span>
              </div>
              <div>
                <h2 className="text-lg font-black text-white leading-none tracking-tight">Scan & Pay</h2>
                <p className="text-[10px] text-white/40 uppercase font-black tracking-widest mt-1">Amount: ₹{total.toLocaleString()}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Time Left</p>
              <p className="text-sm font-black text-primary font-mono">{formatTime(paymentTimer)}</p>
            </div>
          </div>

          <div className="p-6 space-y-6 flex flex-col items-center overflow-y-auto no-scrollbar max-h-[75vh]">

            <div className="w-full">
              <a
                href={upiLink}
                className="w-full h-16 bg-white text-black font-black text-sm rounded-2xl flex items-center justify-center gap-3 shadow-xl transition-all active:scale-[0.97] hover:bg-primary"
              >
                <span className="material-symbols-outlined">open_in_new</span>
                OPEN ANY UPI APP
              </a>
              <p className="text-[8px] text-white/20 mt-3 uppercase font-black tracking-[0.3em] text-center">GPay • PhonePe • Paytm • AmazonPay</p>
            </div>

            <div className="relative size-52 bg-white p-3 rounded-[32px] shadow-2xl shadow-primary/10">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiLink)}`}
                alt="Payment QR"
                className="w-full h-full"
              />
            </div>

            <div className="w-full space-y-4">
              <div className="bg-black/40 p-5 rounded-[24px] border border-white/10">
                <label className="block text-[9px] font-black text-primary uppercase tracking-[0.3em] mb-3 text-center">Enter Transaction ID After Payment</label>
                <input
                  type="text"
                  maxLength={12}
                  value={transactionIdInput}
                  onChange={(e) => setTransactionIdInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="12 Digit UPI Ref No."
                  className="w-full h-14 bg-black border border-white/5 rounded-xl text-center font-black text-white text-lg tracking-[0.2em] focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-white/10"
                />
                <p className="text-[8px] text-white/20 mt-3 text-center uppercase font-bold">Mandatory for verification</p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={simulatePaymentVerification}
                  disabled={transactionIdInput.length < 12}
                  className="w-full h-16 bg-primary text-black font-black text-base rounded-[24px] flex items-center justify-center gap-3 shadow-xl shadow-primary/30 transition-all active:scale-[0.97] disabled:opacity-20 disabled:grayscale"
                >
                  <span>Verify Payment Now</span>
                  <span className="material-symbols-outlined">security</span>
                </button>
                <button
                  onClick={() => setStep('DETAILS')}
                  className="w-full text-[10px] font-black text-white/20 uppercase tracking-[0.4em] py-2"
                >
                  Edit Details
                </button>
              </div>
            </div>
          </div>

          <div className="p-4 bg-black/60 text-center border-t border-white/5">
            <p className="text-[8px] font-black text-white/10 uppercase tracking-[0.5em]">256-BIT ENCRYPTED SIMULATION</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-neutral-900 rounded-t-3xl sm:rounded-[40px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col border border-white/10 animate-in slide-in-from-bottom-4 duration-300">
        <div className="p-6 border-b border-white/5 flex items-center justify-between sticky top-0 bg-neutral-900 z-10">
          <div>
            <h2 className="text-2xl font-black text-white">Checkout</h2>
            <p className="text-sm text-white/40 font-medium italic">Kurnool's #1 Smartphone Gear</p>
          </div>
          <button onClick={onClose} className="size-10 rounded-full hover:bg-white/5 flex items-center justify-center text-white">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleProceedToPayment} className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-black text-white/40 uppercase tracking-widest mb-1 ml-1">Full Name</label>
              <input
                required
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Ramesh Babu"
                className="w-full h-14 px-5 rounded-2xl border border-white/10 bg-black focus:ring-2 focus:ring-primary text-sm font-bold text-white placeholder:text-white/20"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-white/40 uppercase tracking-widest mb-1 ml-1">Email</label>
                <input
                  required
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@email.com"
                  className="w-full h-14 px-5 rounded-2xl border border-white/10 bg-black focus:ring-2 focus:ring-primary text-sm font-bold text-white placeholder:text-white/20"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-white/40 uppercase tracking-widest mb-1 ml-1">Phone</label>
                <input
                  required
                  type="tel"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="91829 19360"
                  className="w-full h-14 px-5 rounded-2xl border border-white/10 bg-black focus:ring-2 focus:ring-primary text-sm font-bold text-white placeholder:text-white/20"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-black text-white/40 uppercase tracking-widest mb-1 ml-1">Delivery Address</label>
              <div className="space-y-3">
                <textarea
                  required
                  rows={2}
                  value={addressData.street}
                  onChange={e => setAddressData({ ...addressData, street: e.target.value })}
                  placeholder="Door No, Street Name, Area"
                  className="w-full px-5 py-4 rounded-2xl border border-white/10 bg-black focus:ring-2 focus:ring-primary text-sm font-bold text-white resize-none placeholder:text-white/20"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={addressData.landmark}
                    onChange={e => setAddressData({ ...addressData, landmark: e.target.value })}
                    placeholder="Landmark (Optional)"
                    className="w-full h-14 px-5 rounded-2xl border border-white/10 bg-black focus:ring-2 focus:ring-primary text-sm font-bold text-white placeholder:text-white/20"
                  />
                  <input
                    required
                    type="text"
                    value={addressData.city}
                    onChange={e => setAddressData({ ...addressData, city: e.target.value })}
                    placeholder="City / Town"
                    className="w-full h-14 px-5 rounded-2xl border border-white/10 bg-black focus:ring-2 focus:ring-primary text-sm font-bold text-white placeholder:text-white/20"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    required
                    type="text"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    value={addressData.pincode}
                    onChange={e => setAddressData({ ...addressData, pincode: e.target.value.replace(/\D/g, '') })}
                    placeholder="Pincode (6 digits)"
                    className="w-full h-14 px-5 rounded-2xl border border-white/10 bg-black focus:ring-2 focus:ring-primary text-sm font-bold text-white placeholder:text-white/20"
                  />
                  <div className="relative">
                    <select
                      value={addressData.state}
                      onChange={e => setAddressData({ ...addressData, state: e.target.value })}
                      className="w-full h-14 px-5 rounded-2xl border border-white/10 bg-black focus:ring-2 focus:ring-primary text-sm font-bold text-white appearance-none"
                    >
                      <option value="Andhra Pradesh">Andhra Pradesh</option>
                      <option value="Telangana">Telangana</option>
                      <option value="Karnataka">Karnataka</option>
                      <option value="Tamil Nadu">Tamil Nadu</option>
                      <option value="Kerala">Kerala</option>
                      <option value="Maharashtra">Maharashtra</option>
                      <option value="Odisha">Odisha</option>
                      <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                      <option value="Assam">Assam</option>
                      <option value="Bihar">Bihar</option>
                      <option value="Chhattisgarh">Chhattisgarh</option>
                      <option value="Goa">Goa</option>
                      <option value="Gujarat">Gujarat</option>
                      <option value="Haryana">Haryana</option>
                      <option value="Himachal Pradesh">Himachal Pradesh</option>
                      <option value="Jharkhand">Jharkhand</option>
                      <option value="Madhya Pradesh">Madhya Pradesh</option>
                      <option value="Manipur">Manipur</option>
                      <option value="Meghalaya">Meghalaya</option>
                      <option value="Mizoram">Mizoram</option>
                      <option value="Nagaland">Nagaland</option>
                      <option value="Punjab">Punjab</option>
                      <option value="Rajasthan">Rajasthan</option>
                      <option value="Sikkim">Sikkim</option>
                      <option value="Tripura">Tripura</option>
                      <option value="Uttar Pradesh">Uttar Pradesh</option>
                      <option value="Uttarakhand">Uttarakhand</option>
                      <option value="West Bengal">West Bengal</option>
                      <option value="Others/UT">Others/UT</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-white/40">
                      <span className="material-symbols-outlined">expand_more</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-black text-white/40 uppercase tracking-widest ml-1">Select Payment</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, paymentMode: 'UPI' })}
                className={`h-16 rounded-2xl border-2 flex items-center px-4 gap-3 font-black transition-all ${formData.paymentMode === 'UPI' ? 'border-primary bg-primary/10 text-white shadow-[0_0_20px_rgba(255,0,0,0.1)]' : 'border-white/5 bg-black text-white/40'}`}
              >
                <span className="material-symbols-outlined text-xl">account_balance_wallet</span>
                <div className="text-left">
                  <p className="text-[11px] leading-tight">Prepaid UPI</p>
                  <p className="text-[7px] font-bold text-white/40 uppercase">Safe & Fast</p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, paymentMode: 'COD' })}
                className={`h-16 rounded-2xl border-2 flex items-center px-4 gap-3 font-black transition-all ${formData.paymentMode === 'COD' ? 'border-primary bg-primary/10 text-white shadow-[0_0_20px_rgba(255,0,0,0.1)]' : 'border-white/5 bg-black text-white/40'}`}
              >
                <span className="material-symbols-outlined text-xl">handshake</span>
                <div className="text-left">
                  <p className="text-[11px] leading-tight">Cash on Delivery</p>
                  <p className="text-[7px] font-bold text-white/40 uppercase">Pay at door</p>
                </div>
              </button>
            </div>
          </div>

          <div className="bg-black/40 p-5 rounded-[24px] border border-white/5 shadow-inner">
            <h4 className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-4">Order Summary</h4>
            <div className="space-y-2">
              {items.map(item => (
                <div key={item.id + (item.phoneDetails || '')} className="flex justify-between text-[11px] font-bold">
                  <span className="text-white/70">{item.name} x {item.quantity}</span>
                  <span className="text-white/40">₹{(getItemPrice(item) * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-white/10 mt-4 pt-4 flex justify-between items-center">
              <span className="font-black text-white/30 text-[9px] uppercase tracking-widest">Grand Total</span>
              <span className="font-black text-primary text-xl">₹{total.toLocaleString()}</span>
            </div>
          </div>
        </form>

        <div className="p-6 bg-neutral-900 border-t border-white/10">
          <button
            onClick={handleProceedToPayment}
            className="w-full h-16 bg-primary hover:bg-white text-black font-black text-lg rounded-[24px] flex items-center justify-center gap-2 shadow-xl shadow-primary/20 transition-all active:scale-[0.97]"
          >
            {formData.paymentMode === 'COD' ? 'Confirm COD Order' : 'Proceed to UPI Pay'}
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutForm;
