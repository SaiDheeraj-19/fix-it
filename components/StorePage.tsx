
import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';
import BentoGrid from './BentoGrid';
import { Product, Category } from '../types';

interface StorePageProps {
    products: Product[];
    selectedCategory: Category | 'All';
    setSelectedCategory: (category: Category | 'All') => void;
    searchQuery: string;
    onAddToCart: (product: Product, quantity: number) => void;
    onViewDetails: (product: Product) => void;
}

const StorePage: React.FC<StorePageProps> = ({
    products,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    onAddToCart,
    onViewDetails
}) => {
    const arrivalsRef = useRef<HTMLDivElement>(null);

    const scrollToArrivals = () => {
        arrivalsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const categories: (Category | 'All')[] = [
        'All', 'AirPods', 'Chargers', 'Cables', 'Skins', 'ScreenGuards', 'Speakers', 'Neckbands', 'WiredAudio'
    ];

    const filteredProducts = products.filter(p => {
        const isService = p.isQuoteRequired;
        if (isService) return false;

        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (searchQuery.toLowerCase() === 'all'); // Fallback matches all

        const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <main className="max-w-4xl mx-auto px-4 pt-44 sm:pt-48">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12 auto-rows-[160px] sm:auto-rows-[200px]">
                <div className="col-span-2 row-span-2 relative p-8 sm:p-10 rounded-[40px] overflow-hidden bg-neutral-900 border border-white/5 bento-shadow flex flex-col justify-end group">
                    <div className="absolute top-1/2 -right-16 -translate-y-1/2 w-80 h-80 opacity-[0.08] pointer-events-none rotate-12 group-hover:rotate-45 transition-transform duration-1000">
                        <div className="relative w-full h-full">
                            <div className="absolute top-0 right-0 w-64 h-64 border-t-[48px] border-r-[48px] border-white/40 rounded-tr-[80px]"></div>
                            <div className="absolute top-16 right-16 w-40 h-40 border-t-[48px] border-r-[48px] border-primary rounded-tr-[48px]"></div>
                        </div>
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="h-6 w-6 bg-neutral-800 rounded-md border border-white/10 flex items-center justify-center p-1.5">
                                <Logo />
                            </div>
                            <span className="text-xs font-extrabold text-white tracking-tight uppercase">Fix <span className="text-primary">It</span> Kurnool</span>
                        </div>
                        <h1 className="text-[32px] sm:text-[48px] font-[900] mb-4 leading-[1.1] tracking-tight">
                            Fix It <span className="text-primary drop-shadow-[0_0_20px_rgba(255,0,0,0.35)]">Phone</span><br />Service
                        </h1>
                        <p className="text-white/40 text-[11px] sm:text-xs mb-6 font-medium leading-relaxed max-w-[240px]">
                            Professional repairs & premium accessories delivered to your door.
                        </p>
                        <button
                            onClick={scrollToArrivals}
                            className="h-11 px-6 bg-white/5 border border-white/10 text-white font-[900] rounded-2xl hover:bg-neutral-800 transition-all active:scale-95 flex items-center justify-center text-[11px] tracking-tight backdrop-blur-sm"
                        >
                            Shop Collection
                        </button>
                    </div>
                </div>
                <Link to="/repairs" className="col-span-1 row-span-2 sm:col-span-1 sm:row-span-2 bg-primary p-6 rounded-[40px] flex flex-col justify-between items-start group shadow-2xl shadow-primary/20 border border-primary/20 hover:brightness-110 transition-all relative overflow-hidden">
                    <span className="material-symbols-outlined text-black text-5xl font-black group-hover:scale-110 transition-transform">build_circle</span>
                    <div className="relative z-10">
                        <p className="text-black font-black text-xs uppercase tracking-widest mb-1 opacity-70">Expert Fix</p>
                        <h3 className="text-black text-2xl font-black leading-tight italic">BOOK<br />REPAIR</h3>
                    </div>
                    <div className="absolute -bottom-4 -right-4 opacity-10">
                        <span className="material-symbols-outlined text-[120px] font-black text-black">handyman</span>
                    </div>
                </Link>
                <button onClick={scrollToArrivals} className="col-span-1 row-span-1 bg-neutral-900 border border-white/5 rounded-[40px] p-6 flex flex-col items-center justify-center text-center gap-2 transition-all hover:bg-neutral-800 hover:border-primary/30 group active:scale-95">
                    <span className="material-symbols-outlined text-primary text-3xl font-black group-hover:scale-110 transition-transform">shopping_cart</span>
                    <div>
                        <p className="text-white font-black text-xs uppercase tracking-widest leading-none">Order Now</p>
                        <p className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em] mt-1.5 group-hover:text-primary transition-colors">Premium Gear</p>
                    </div>
                </button>
                <a href="https://www.google.com/maps/search/?api=1&query=Fix+It+Kurnool+Temple+Line+ITC+Circle" target="_blank" rel="noopener noreferrer" className="col-span-1 row-span-1 bg-neutral-900 border border-white/5 rounded-[40px] p-6 flex flex-col items-center justify-center text-center gap-2 group hover:border-white/20 transition-all">
                    <span className="material-symbols-outlined text-white/40 text-3xl group-hover:text-primary transition-colors">location_on</span>
                    <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Kurnool Store</p>
                </a>
            </div>
            <div className="mb-12">
                <div className="flex items-center justify-between mb-4 px-2">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Explore Categories</h2>
                    <div className="h-px bg-white/5 flex-1 mx-4" />
                </div>
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2">
                    {categories.map((cat) => (
                        <button key={cat} onClick={() => setSelectedCategory(cat)} className={`whitespace-nowrap px-8 h-12 rounded-[22px] text-[10px] font-[900] uppercase tracking-widest transition-all border ${selectedCategory === cat ? 'bg-primary text-black border-primary shadow-[0_0_20px_rgba(255,0,0,0.3)]' : 'bg-neutral-900 text-white/40 border-white/5 hover:border-white/10 hover:text-white'}`}>
                            {cat}
                        </button>
                    ))}
                </div>
            </div>
            <div ref={arrivalsRef} className="mb-8 flex items-center gap-3 px-2">
                <span className="material-symbols-outlined text-primary text-xl fill-current">auto_awesome</span>
                <h2 className="text-[11px] font-[900] uppercase tracking-[0.2em] text-white">
                    {selectedCategory === 'All' ? 'Featured This Week' : `${selectedCategory} Collection`}
                </h2>
            </div>
            <section className="mb-12">
                <BentoGrid products={filteredProducts} onAddToCart={onAddToCart} onViewDetails={onViewDetails} />
            </section>
        </main>
    );
};

export default StorePage;
