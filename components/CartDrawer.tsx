
import React from 'react';
import { CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onRemove: (uniqueId: string) => void;
  onProceed: () => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, items, onRemove, onProceed }) => {
  const getItemPrice = (item: CartItem) => item.quotedPrice || item.price || 0;
  const total = items.reduce((sum, item) => sum + getItemPrice(item) * item.quantity, 0);

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      
      <div className={`fixed top-0 right-0 h-full w-full max-w-sm bg-black z-50 shadow-2xl transition-transform transform ${isOpen ? 'translate-x-0' : 'translate-x-full'} border-l border-white/5`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-6 border-b border-white/5">
            <h2 className="text-xl font-extrabold text-white">Shopping Cart</h2>
            <button onClick={onClose} className="size-10 rounded-full hover:bg-neutral-800 flex items-center justify-center text-white">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center opacity-40">
                <span className="material-symbols-outlined text-6xl mb-4 text-white">shopping_cart_off</span>
                <p className="font-bold text-white">Your cart is empty</p>
                <button onClick={onClose} className="mt-4 text-primary font-black uppercase text-[10px] tracking-widest">Start Shopping</button>
              </div>
            ) : (
              items.map(item => {
                const uniqueId = item.id + (item.phoneDetails || '');
                return (
                  <div key={uniqueId} className="bg-neutral-900 rounded-2xl p-4 flex gap-4 relative border border-white/5">
                    <img src={item.image} alt={item.name} className="size-20 rounded-xl object-cover shadow-sm opacity-80" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-black text-sm truncate text-white">{item.name}</h4>
                      {item.phoneDetails && (
                        <p className="text-[10px] text-white/40 font-bold mt-0.5 truncate italic">
                          {item.phoneDetails}
                        </p>
                      )}
                      <p className="text-[10px] text-white/40 mt-1">Qty: {item.quantity}</p>
                      <p className="font-black text-primary mt-1 text-lg">₹{getItemPrice(item).toLocaleString()}</p>
                    </div>
                    <button 
                      onClick={() => onRemove(uniqueId)}
                      className="absolute top-2 right-2 size-8 flex items-center justify-center text-red-500 hover:bg-red-500/10 rounded-full transition-all"
                    >
                      <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                  </div>
                );
              })
            )}
          </div>

          <div className="p-6 bg-neutral-900/50 border-t border-white/5">
            <div className="flex justify-between items-center mb-6">
              <span className="text-white/60 font-bold uppercase text-[10px] tracking-widest">Subtotal</span>
              <span className="text-2xl font-black text-white">₹{total.toLocaleString()}</span>
            </div>
            <button 
              disabled={items.length === 0}
              onClick={onProceed}
              className="w-full h-14 bg-primary hover:bg-red-700 disabled:opacity-50 text-black font-black rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-primary/20"
            >
              <span>Proceed to Buy</span>
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
            <p className="text-center text-[9px] text-white/20 mt-4 uppercase font-black tracking-[0.2em]">Authorized Dealer Kurnool</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default CartDrawer;