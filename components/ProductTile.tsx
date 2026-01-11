
import React from 'react';
import { Product } from '../types';

interface ProductTileProps {
  product: Product;
  onAddToCart: (quantity: number) => void;
  onViewDetails: (product: Product) => void;
}

const ProductTile: React.FC<ProductTileProps> = ({ product, onAddToCart, onViewDetails }) => {
  const isLarge = product.size === 'large';
  const isService = product.isQuoteRequired;
  const isModelRequired = product.isModelRequired || product.isUniversalModel;
  
  // Skins and Screen Guards always require store contact per user request
  const isContactOnly = product.isContactOnly || product.category === 'Skins' || product.category === 'ScreenGuards';
  
  const handleAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(1);
  };
  
  return (
    <div 
      onClick={() => onViewDetails(product)}
      className={`
        relative rounded-[40px] overflow-hidden bento-shadow transition-all duration-300 active:scale-[0.98] group cursor-pointer
        ${isLarge ? 'col-span-2 row-span-2 h-full' : 'col-span-1 row-span-1 h-full'}
        bg-neutral-900 border border-white/5 hover:border-white/20
      `}
    >
      <img 
        src={product.image} 
        alt={product.name} 
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 opacity-60"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
      
      <div className="absolute top-4 left-4 flex flex-col items-start gap-1 z-10">
        {product.isPopular && (
          <div className="bg-[#232F3E] text-white text-[8px] font-black px-2 py-1 rounded-lg shadow-sm flex items-center gap-1 border border-white/10 uppercase tracking-widest">
            <span className="text-primary">Fix It's</span> Choice
          </div>
        )}
        {isModelRequired && (
          <div className="bg-primary text-black text-[8px] font-black px-2 py-1 rounded-lg shadow-sm flex items-center gap-1 border border-primary/20 uppercase tracking-widest">
            MODEL REQ.
          </div>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
        <div className="flex flex-col gap-3">
          <div className="flex-1">
            <p className="text-[9px] text-white/30 uppercase tracking-[0.3em] font-black mb-1">{product.category}</p>
            <h3 className={`font-extrabold text-white leading-tight ${isLarge ? 'text-xl sm:text-2xl' : 'text-sm sm:text-base'}`}>
              {product.name}
            </h3>
            
            {isContactOnly ? (
               <p className="text-primary text-[10px] font-black mt-1 uppercase tracking-wider">Contact Store</p>
            ) : (
              isService ? (
                <p className="text-primary text-[10px] font-black mt-1 uppercase tracking-wider">Instant Quote</p>
              ) : (
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-[10px] font-bold text-white/40">₹</span>
                  <span className={`text-white font-black ${isLarge ? 'text-2xl' : 'text-lg'}`}>
                    {product.price?.toLocaleString()}
                  </span>
                </div>
              )
            )}
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={handleAction}
              className={`
                flex items-center justify-center rounded-2xl bg-primary text-black shadow-xl shadow-primary/20 transition-all hover:bg-white flex-1
                ${isLarge ? 'h-11' : 'h-10'}
              `}
            >
              <span className={`font-black uppercase tracking-widest ${isLarge ? 'text-[10px] mr-2' : 'text-[9px] mr-2'}`}>
                {isContactOnly ? 'Choose Model' : 'Add To Cart'}
              </span>
              <span className={`material-symbols-outlined ${isLarge ? 'text-xl' : 'text-lg'}`}>
                {isContactOnly ? 'phone_iphone' : 'shopping_bag'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductTile;
