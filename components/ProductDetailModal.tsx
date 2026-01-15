
import React, { useState } from 'react';
import { Product } from '../types';

interface ProductDetailModalProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (quantity: number) => void;
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, onClose, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);
  const isContactOnly = product.category === 'Skin' || product.category === 'Protection';
  // Allow image for Skins specifically
  const showDetailImage = !isContactOnly || product.category === 'Skin';

  const handleAction = () => {
    if (isContactOnly) {
      const message = encodeURIComponent(`Hi Fix It Kurnool, I am interested in ${product.name}. Can you help me with the availability and pricing?`);
      window.open(`https://wa.me/919182919360?text=${message}`, '_blank');
    } else {
      onAddToCart(quantity);
      onClose();
    }
  };

  const incrementQty = () => setQuantity(prev => Math.min(prev + 1, 10));
  const decrementQty = () => setQuantity(prev => Math.max(prev - 1, 1));

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-black rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col border border-white/10 animate-in slide-in-from-bottom-4 duration-300">
        <div className="p-4 border-b border-white/5 flex items-center justify-between sticky top-0 bg-black z-10">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">{product.category} Details</p>
          <button onClick={onClose} className="size-10 rounded-full hover:bg-white/5 flex items-center justify-center text-white">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar">
          <div className="flex flex-col md:flex-row">
            {/* Image Area */}
            {showDetailImage ? (
              <div className="w-full md:w-1/2 p-4 sm:p-8 bg-neutral-900/30">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full aspect-square object-cover rounded-2xl shadow-2xl border border-white/5"
                />
              </div>
            ) : (
              <div className="w-full md:w-1/2 p-12 bg-neutral-900/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-8xl text-white/5 select-none">
                  shield_with_heart
                </span>
              </div>
            )}

            {/* Content Area */}
            <div className="w-full md:w-1/2 p-6 sm:p-8">
              <div className="mb-6">
                <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight mb-2">{product.name}</h2>
                <p className="text-primary text-[10px] font-black uppercase tracking-widest mb-4">Fix It Authorized Kurnool</p>

                {!isContactOnly && (
                  <div className="flex items-baseline gap-1 mt-4 border-b border-white/5 pb-4">
                    <span className="text-sm font-bold text-white/40">₹</span>
                    <span className="text-4xl font-black text-white">
                      {product.price?.toLocaleString()}
                    </span>
                    <span className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-2">Inc. GST</span>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-3">About this item</h4>
                  <ul className="space-y-3">
                    {product.description.split('. ').map((point, i) => (
                      <li key={i} className="flex gap-3 text-sm text-white/70 font-medium leading-relaxed">
                        <span className="text-primary mt-1.5">•</span>
                        <span>{point}{point.endsWith('.') ? '' : '.'}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {!isContactOnly && (
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-primary">Quantity</h4>
                    <div className="flex items-center gap-4 bg-white/5 p-2 rounded-2xl border border-white/10 w-fit">
                      <button
                        onClick={decrementQty}
                        className="size-10 rounded-xl bg-black flex items-center justify-center text-white hover:text-primary transition-colors active:scale-90"
                      >
                        <span className="material-symbols-outlined">remove</span>
                      </button>
                      <span className="w-8 text-center font-black text-lg">{quantity}</span>
                      <button
                        onClick={incrementQty}
                        className="size-10 rounded-xl bg-black flex items-center justify-center text-white hover:text-primary transition-colors active:scale-90"
                      >
                        <span className="material-symbols-outlined">add</span>
                      </button>
                    </div>
                  </div>
                )}

                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                  <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-white/60 mb-2">
                    <span className="material-symbols-outlined text-sm text-primary">local_shipping</span>
                    Same-day Delivery in Kurnool
                  </div>
                  <p className="text-[9px] font-bold text-white/30 uppercase leading-relaxed">
                    Orders placed before 4 PM are delivered within 4 hours.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-black border-t border-white/10">
          <button
            onClick={(!product.isSoldOut || isContactOnly) ? handleAction : undefined}
            disabled={product.isSoldOut && !isContactOnly}
            className={`w-full h-14 font-black text-lg rounded-xl flex items-center justify-center gap-3 shadow-xl transition-all active:scale-[0.97]
              ${product.isSoldOut && !isContactOnly
                ? 'bg-neutral-800 text-white/20 border border-white/5 cursor-not-allowed shadow-none'
                : 'bg-primary hover:bg-white text-black shadow-primary/20'
              }`}
          >
            <span>
              {product.isSoldOut && !isContactOnly
                ? 'Sold Out'
                : (isContactOnly ? 'Connect on WhatsApp' : 'Add to Cart')}
            </span>
            <span className="material-symbols-outlined">
              {product.isSoldOut && !isContactOnly
                ? 'block'
                : (isContactOnly ? 'chat' : 'shopping_basket')}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;
