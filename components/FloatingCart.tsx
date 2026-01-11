
import React from 'react';

interface FloatingCartProps {
  count: number;
  onClick: () => void;
}

const FloatingCart: React.FC<FloatingCartProps> = ({ count, onClick }) => {
  return (
    <button 
      onClick={onClick}
      className="fixed bottom-32 right-6 z-40 size-16 rounded-full bg-primary text-black shadow-2xl flex items-center justify-center border-4 border-black transition-transform active:scale-90 hover:scale-105"
    >
      <span className="material-symbols-outlined text-3xl font-bold">shopping_cart</span>
      {count > 0 && (
        <div className="absolute -top-1 -right-1 size-7 bg-white text-black text-[10px] font-black rounded-full flex items-center justify-center border-2 border-black animate-bounce shadow-lg">
          {count}
        </div>
      )}
    </button>
  );
};

export default FloatingCart;
