
import React from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';

export const HomePage: React.FC = () => {
    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
            {/* Dynamic Background */}
            <div className="absolute inset-0 bg-neutral-900">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-800 via-black to-black opacity-60"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] animate-pulse"></div>
            </div>

            <div className="relative z-10 text-center flex flex-col items-center gap-8 max-w-2xl">
                <div className="size-32 bg-white/5 rounded-[32px] border border-white/10 flex items-center justify-center p-6 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in duration-700">
                    <Logo className="w-full h-full" />
                </div>

                <div className="space-y-4">
                    <h1 className="text-6xl sm:text-7xl font-[900] uppercase italic tracking-tighter leading-none animate-in slide-in-from-bottom-8 duration-700 delay-100">
                        Welcome to <br />
                        <Link to="/repairs" className="text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:text-white/80 transition-colors cursor-pointer">Fix</Link> <Link to="/store" className="text-primary drop-shadow-[0_0_30px_rgba(255,0,0,0.5)] hover:text-primary/80 transition-colors cursor-pointer">It</Link>
                    </h1>
                    <div className="flex flex-col items-center gap-3 mt-4 animate-in fade-in duration-1000 delay-500">
                        <div className="text-[10px] font-black text-white/40 uppercase tracking-widest bg-white/5 px-6 py-3 rounded-full border border-white/5 backdrop-blur-md">
                            <span className="text-white">TAP FIX → REPAIRS</span>
                            <span className="mx-2 opacity-20">|</span>
                            <span className="text-primary">TAP IT → STORE</span>
                        </div>
                        <p className="text-[9px] font-bold text-white/20 uppercase tracking-[0.3em] animate-pulse">Tap on top to go</p>
                    </div>
                </div>
            </div>

            {/* Why Choose Section */}
            <div className="relative z-10 mt-16 w-full max-w-4xl px-4 animate-in slide-in-from-bottom-16 duration-1000 delay-700">
                <div className="text-center mb-10">
                    <h2 className="text-2xl font-black uppercase italic tracking-tight text-white mb-4">Why Fix <span className="text-primary">It ?</span></h2>
                    <p className="text-xs text-white/40 font-bold uppercase tracking-widest leading-relaxed max-w-xl mx-auto">
                        We provide the best mobile services and accessories in Kurnool, ensuring genuine products, warranty support, quality assurance, and complete customer satisfaction.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white/5 backdrop-blur-md border border-white/5 p-6 rounded-[32px] hover:bg-white/10 transition-colors group">
                        <span className="material-symbols-outlined text-3xl text-primary mb-4 group-hover:scale-110 transition-transform">verified</span>
                        <h3 className="text-sm font-black text-white uppercase tracking-wider mb-2">Quality Guaranteed</h3>
                        <p className="text-[10px] text-white/40 font-bold leading-relaxed uppercase tracking-wide">
                            Premium mobile accessories and genuine spare parts
                        </p>
                    </div>
                    <div className="bg-white/5 backdrop-blur-md border border-white/5 p-6 rounded-[32px] hover:bg-white/10 transition-colors group">
                        <span className="material-symbols-outlined text-3xl text-primary mb-4 group-hover:scale-110 transition-transform">local_shipping</span>
                        <h3 className="text-sm font-black text-white uppercase tracking-wider mb-2">Fast Delivery</h3>
                        <p className="text-[10px] text-white/40 font-bold leading-relaxed uppercase tracking-wide">
                            Quick delivery across Kurnool and nearby areas
                        </p>
                    </div>
                    <div className="bg-white/5 backdrop-blur-md border border-white/5 p-6 rounded-[32px] hover:bg-white/10 transition-colors group">
                        <span className="material-symbols-outlined text-3xl text-primary mb-4 group-hover:scale-110 transition-transform">support_agent</span>
                        <h3 className="text-sm font-black text-white uppercase tracking-wider mb-2">24/7 Support</h3>
                        <p className="text-[10px] text-white/40 font-bold leading-relaxed uppercase tracking-wide">
                            Professional assistance for all your mobile needs
                        </p>
                    </div>
                </div>
            </div>

            {/* Ready to Get Started Section */}
            <div className="relative z-10 mt-20 mb-10 text-center animate-in fade-in duration-1000 delay-1000">
                <h2 className="text-2xl font-black uppercase italic tracking-tight text-white mb-3">Ready to get started?</h2>
                <p className="text-xs text-white/40 font-bold uppercase tracking-widest max-w-md mx-auto">
                    Browse our collection of premium mobile accessories and place your orders in home page
                </p>
            </div>
            {/* Footer Copyright */}
            <div className="absolute bottom-4 text-center w-full z-20 animate-in fade-in duration-1000 delay-1000">
                <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">
                    © 2026 FIX IT KURNOOL • AUTHENTIC GEAR
                </p>
            </div>
        </div>
    );
};

export default HomePage;
