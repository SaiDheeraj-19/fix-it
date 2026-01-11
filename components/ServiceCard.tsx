
import React from 'react';
import { Product } from '../types';

interface ServiceCardProps {
  product: Product;
  onClick: () => void;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ product, onClick }) => {
  const getIcon = () => {
    if (product.name.toLowerCase().includes('screen')) return 'phone_iphone';
    if (product.name.toLowerCase().includes('battery')) return 'battery_charging_full';
    if (product.name.toLowerCase().includes('charging')) return 'power';
    if (product.name.toLowerCase().includes('motherboard')) return 'memory';
    if (product.name.toLowerCase().includes('ic')) return 'memory';
    return 'settings_suggest';
  };

  const isIphone = product.id.startsWith('iph');

  return (
    <button 
      onClick={onClick}
      className="group relative h-52 sm:h-64 rounded-[40px] overflow-hidden bento-shadow border border-white/5 bg-neutral-900 text-left transition-all active:scale-[0.97] w-full"
    >
      <img 
        src={product.image} 
        alt={product.name} 
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-30 grayscale group-hover:grayscale-0"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
      
      <div className="absolute inset-0 p-8 flex flex-col justify-end">
        <div className="size-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary mb-4 backdrop-blur-xl border border-primary/20 group-hover:bg-primary group-hover:text-black transition-all">
          <span className="material-symbols-outlined text-2xl font-bold">{getIcon()}</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-black text-white leading-tight mb-2 uppercase italic">{product.name}</h3>
        <p className="text-[10px] text-primary font-black uppercase tracking-[0.2em] flex items-center gap-2 group-hover:translate-x-2 transition-transform">
          {isIphone ? 'Get iPhone Quote' : 'Contact Store'} <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </p>
      </div>
      
      {isIphone && (
        <div className="absolute top-6 right-6 bg-white text-black text-[8px] font-black px-3 py-1.5 rounded-xl z-10 shadow-lg uppercase tracking-widest flex items-center gap-2">
          <span className="material-symbols-outlined text-[10px]">verified</span>
          iPhone Only
        </div>
      )}
    </button>
  );
};

export default ServiceCard;
