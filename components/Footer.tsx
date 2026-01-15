
import React from 'react';
import Logo from './Logo';

const Footer: React.FC = () => {
  const googleMapsUrl = "https://www.google.com/maps/search/?api=1&query=Fix+It+Kurnool+Temple+Line+ITC+Circle";
  const instagramUrl = "https://www.instagram.com/fix_it_kurnool/";
  const whatsappUrl = "https://wa.me/919182919360";
  const youtubeUrl = "https://www.youtube.com/@fix_it_kurnool";
  const phoneUrl = "tel:+919182919360";
  const displayPhone = "+91 91829 19360";

  return (
    <footer className="max-w-4xl mx-auto px-4 mt-20 mb-12">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        {/* Brand & Mission Tile */}
        <div className="col-span-1 sm:col-span-2 p-8 rounded-[40px] bg-neutral-900 border border-white/5 bento-shadow flex flex-col justify-between group overflow-hidden relative">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/5 blur-[60px] rounded-full group-hover:bg-primary/10 transition-colors" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 p-1 bg-black rounded-xl border border-white/10 flex items-center justify-center">
                <Logo />
              </div>
              <h3 className="text-xl font-black italic uppercase text-white tracking-tighter">
                FIX <span className="text-primary">IT</span> KURNOOL
              </h3>
            </div>
            <p className="text-[11px] font-[900] text-white/40 uppercase tracking-[0.2em] leading-relaxed max-w-sm mb-8">
              Kurnool's flagship destination for premium smartphone accessories and expert iPhone surgical repairs.
            </p>
          </div>
          <div className="flex gap-4 relative z-10">
            <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="size-12 rounded-2xl bg-black border border-white/10 flex items-center justify-center text-white/40 hover:text-primary hover:border-primary/30 transition-all">
              <span className="material-symbols-outlined">camera</span>
            </a>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="size-12 rounded-2xl bg-black border border-white/10 flex items-center justify-center text-white/40 hover:text-primary hover:border-primary/30 transition-all">
              <span className="material-symbols-outlined">chat</span>
            </a>
            <a href={youtubeUrl} target="_blank" rel="noopener noreferrer" className="size-12 rounded-2xl bg-black border border-white/10 flex items-center justify-center text-white/40 hover:text-primary hover:border-primary/30 transition-all">
              <span className="material-symbols-outlined">smart_display</span>
            </a>
          </div>
        </div>

        {/* Quick Contact Tile */}
        <div className="col-span-1 p-8 rounded-[40px] bg-neutral-900 border border-white/5 bento-shadow flex flex-col justify-between group">
          <div>
            <span className="material-symbols-outlined text-primary text-3xl mb-4 group-hover:rotate-12 transition-transform">contact_support</span>
            <h4 className="text-xs font-black uppercase tracking-widest text-white mb-2">Need Help?</h4>
            <p className="text-[10px] text-white/40 font-bold leading-relaxed mb-6 uppercase tracking-wider">Direct line to our service desk in Kurnool.</p>
          </div>
          <a href={phoneUrl} className="flex flex-col">
            <span className="text-[9px] font-black text-primary uppercase tracking-widest mb-1">Call Now</span>
            <span className="text-sm font-black text-white hover:text-primary transition-colors">{displayPhone}</span>
          </a>
        </div>

        {/* Location & Directions Tile */}
        <div className="col-span-1 sm:col-span-3 p-8 rounded-[40px] bg-neutral-900 border border-white/5 bento-shadow flex flex-col sm:flex-row items-center justify-between gap-6 group">
          <div className="flex items-center gap-5">
            <div className="size-14 rounded-2xl bg-black border border-white/10 flex items-center justify-center text-primary shrink-0">
              <span className="material-symbols-outlined text-3xl">location_on</span>
            </div>
            <div className="text-center sm:text-left">
              <p className="text-[10px] font-black uppercase text-primary tracking-[0.3em] mb-1">Store Address</p>
              <p className="text-[10px] font-black text-white/40 uppercase tracking-widest leading-relaxed">
                Shop 6, Venkateshwara Temple Line, ITC Circle, Kurnool 518002
              </p>
            </div>
          </div>
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto h-14 px-10 bg-white text-black font-black rounded-2xl flex items-center justify-center gap-2 hover:bg-primary transition-all active:scale-95 text-[11px] uppercase tracking-widest shadow-xl shadow-white/5"
          >
            <span>Get Directions</span>
            <span className="material-symbols-outlined">map</span>
          </a>
        </div>

      </div>

      {/* Final Credit Section */}
      <div className="mt-12 text-center space-y-4">
        <div className="flex items-center justify-center gap-4">
          <div className="h-px bg-white/5 flex-1" />
          <p className="text-[9px] font-black text-white/60 uppercase tracking-[0.5em] whitespace-nowrap">
            © 2026 FIX IT KURNOOL • AUTHENTIC GEAR
          </p>
          <div className="h-px bg-white/5 flex-1" />
        </div>
        <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] flex items-center justify-center gap-2">
          Build with <span className="text-primary animate-pulse text-xs">🫶</span> by fix it tech team
        </p>
      </div>
    </footer>
  );
};

export default Footer;
