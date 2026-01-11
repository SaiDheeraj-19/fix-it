
import React, { useState } from 'react';
import { Product } from '../types';
import ServiceCard from './ServiceCard';
import Logo from './Logo';
import { Link } from 'react-router-dom';

interface ServicesPageProps {
  services: Product[];
  onSelect: (service: Product) => void;
}

const ServicesPage: React.FC<ServicesPageProps> = ({ services, onSelect }) => {
  const iphoneServices = services.filter(s => s.id.startsWith('iph'));
  const otherServices = services.filter(s => s.id.startsWith('oth'));
  const [customModel, setCustomModel] = useState('');

  const handleCustomModelRedirect = () => {
    if (!customModel.trim()) {
      alert('Please enter your phone model details.');
      return;
    }
    const message = encodeURIComponent(`Hi Fix It, I have a query about my device:\n\nModel: ${customModel}\n\nPlease let me know the repair options.`);
    window.open(`https://wa.me/919182919360?text=${message}`, '_blank');
  };

  return (
    <main className="max-w-4xl mx-auto px-4 pt-44 sm:pt-48 pb-20 bg-black text-white min-h-screen">
      <div className="mb-12">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/" className="size-12 rounded-2xl bg-neutral-900 flex items-center justify-center text-white bento-shadow hover:bg-primary hover:text-black transition-all border border-white/5">
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <div>
            <h1 className="text-3xl sm:text-5xl font-black text-white leading-none italic uppercase">Repair <span className="text-primary">Center</span></h1>
            <p className="text-[10px] text-white/40 font-black uppercase tracking-[0.3em] mt-3">Fix It Hardware Service • Kurnool Flagship</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 mb-12">
          <div className="bg-neutral-900/50 p-6 rounded-[32px] border border-white/5 text-center flex flex-col items-center">
            <span className="material-symbols-outlined text-primary text-3xl mb-2">verified</span>
            <p className="text-[9px] font-black uppercase text-white/40 tracking-widest">OEM Parts</p>
          </div>
          <div className="bg-neutral-900/50 p-6 rounded-[32px] border border-white/5 text-center flex flex-col items-center">
            <span className="material-symbols-outlined text-primary text-3xl mb-2">security</span>
            <p className="text-[9px] font-black uppercase text-white/40 tracking-widest">6M Warranty</p>
          </div>
        </div>
      </div>

      {/* IPHONE SPECIALIZED SECTION */}
      <section className="mb-20">
        <div className="flex items-center gap-4 mb-8 px-2">
          <div className="size-11 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 shadow-xl p-2.5">
            <Logo className="h-full w-full" />
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tight text-white">iPhone <span className="text-primary italic">Pro Service</span></h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {iphoneServices.map(service => (
            <div key={service.id} className="flex flex-col gap-4">
              <ServiceCard
                product={service}
                onClick={() => onSelect(service)}
              />
              <p className="px-6 text-[11px] font-bold text-white/30 uppercase tracking-widest leading-relaxed">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* MULTI-BRAND SECTION */}
      <section className="mb-20">
        <div className="flex items-center gap-4 mb-8 px-2">
          <div className="size-11 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/20 shadow-xl overflow-hidden">
            <svg className="w-6 h-6 fill-primary" viewBox="0 0 24 24">
              <path d="M17.523 15.3414C17.523 16.3533 16.7027 17.1736 15.6908 17.1736C14.679 17.1736 13.8586 16.3533 13.8586 15.3414C13.8586 14.3295 14.679 13.5092 15.6908 13.5092C16.7027 13.5092 17.523 14.3295 17.523 15.3414ZM10.1414 15.3414C10.1414 16.3533 9.32111 17.1736 8.3092 17.1736C7.29729 17.1736 6.47699 16.3533 6.47699 15.3414C6.47699 14.3295 7.29729 13.5092 8.3092 13.5092C9.32111 13.5092 10.1414 14.3295 10.1414 15.3414ZM17.9042 11.0827L19.4578 8.3908C19.5898 8.16118 19.5106 7.86872 19.281 7.73673C19.0514 7.60474 18.7589 7.68393 18.6269 7.91355L17.0421 10.658C15.6186 10.0039 14.0042 9.63684 12.3092 9.63684C10.6142 9.63684 8.99981 10.0039 7.57629 10.658L5.99153 7.91355C5.85954 7.68393 5.56708 7.60474 5.33746 7.73673C5.10784 7.86872 5.02865 8.16118 5.16064 8.3908L6.71424 11.0827C4.1627 12.4343 2.38794 14.996 2.3092 18H22.3092C22.2305 14.996 20.4557 12.4343 17.9042 11.0827Z" />
            </svg>
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tight text-white">Other <span className="text-primary italic">Branded Phones</span></h2>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {otherServices.map(service => (
            <div key={service.id} className="flex flex-col sm:flex-row gap-6 bg-neutral-900 rounded-[32px] overflow-hidden border border-white/5 p-4 items-center group transition-all hover:border-primary/20">
              <div className="size-40 rounded-2xl overflow-hidden relative shrink-0">
                <img src={service.image} alt={service.name} className="absolute inset-0 w-full h-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-80 transition-all duration-500" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="material-symbols-outlined text-white text-3xl font-bold">smartphone</span>
                </div>
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-xl font-black text-white uppercase italic mb-2">{service.name}</h3>
                <p className="text-xs text-white/40 font-bold uppercase tracking-widest mb-6 leading-relaxed">{service.description}</p>
                <button
                  onClick={() => onSelect(service)}
                  className="px-8 h-12 bg-white/5 border border-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-black hover:border-primary transition-all active:scale-95 shadow-lg"
                >
                  Select Model & Contact
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Custom Model Input for Other Brands */}
        <div className="mt-8 p-8 rounded-[32px] bg-neutral-900 border border-white/5 bento-shadow flex flex-col items-center text-center">
          <h3 className="text-xl font-black text-white uppercase italic mb-2">Can't find your model?</h3>
          <p className="text-xs text-white/40 font-bold uppercase tracking-widest mb-6 max-w-md">Enter your specific android model details below and we'll connect you directly with a technician.</p>

          <div className="w-full max-w-md space-y-4">
            <input
              type="text"
              value={customModel}
              onChange={(e) => setCustomModel(e.target.value)}
              placeholder="Ex: Samsung S23 Ultra, OnePlus 11R check..."
              className="w-full h-14 px-6 rounded-2xl bg-black border border-white/10 text-white font-bold placeholder:text-white/20 focus:outline-none focus:border-primary transition-all text-sm"
            />
            <button
              onClick={handleCustomModelRedirect}
              className="w-full h-14 bg-primary text-black rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-white transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <span>Chat on WhatsApp</span>
              <span className="material-symbols-outlined text-lg">chat</span>
            </button>
          </div>
        </div>
      </section>

      {/* Emergency Contact */}
      <div className="p-10 rounded-[48px] bg-neutral-900 border border-white/5 text-center relative overflow-hidden bento-shadow">
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full -translate-y-24 translate-x-24 blur-3xl"></div>
        <h3 className="text-2xl font-black text-white mb-4 uppercase italic">Custom <span className="text-primary">Consultation?</span></h3>
        <p className="text-xs text-white/40 font-bold uppercase tracking-widest mb-8">Not sure what's wrong? Chat with Dinesh for a remote diagnostic.</p>
        <a
          href="https://wa.me/919182919360"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-3 px-10 h-16 bg-primary text-black font-black rounded-2xl hover:bg-white transition-all shadow-xl shadow-primary/20 uppercase tracking-widest text-[11px] active:scale-95"
        >
          <span className="material-symbols-outlined">chat</span>
          WhatsApp Diagnostic
        </a>
      </div>
    </main>
  );
};

export default ServicesPage;
