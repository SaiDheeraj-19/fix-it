
import React, { useState } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { Product } from '../types';

interface QuoteModalProps {
  product: Product;
  onClose: () => void;
  onConfirm: (details: string, price: number) => void;
}

const QuoteModal: React.FC<QuoteModalProps> = ({ product, onClose, onConfirm }) => {
  const [model, setModel] = useState('');
  const [issue, setIssue] = useState('');
  const [loading, setLoading] = useState(false);
  const [quote, setQuote] = useState<{ price: number; time: string } | null>(null);

  const generateQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Provide a high-quality professional estimated iPhone repair cost in INR for local service in Kurnool, India.
        Device: ${model} (iPhone)
        Service: ${product.name}
        Additional Info: ${issue}
        
        Ensure the price reflects current spare market rates for high-quality OLED or original pulls.
        Return ONLY a JSON object with 'price' (number) and 'estimatedTime' (string).`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              price: { type: Type.NUMBER },
              estimatedTime: { type: Type.STRING }
            },
            required: ["price", "estimatedTime"]
          }
        }
      });

      const result = JSON.parse(response.text);
      setQuote({ price: result.price, time: result.estimatedTime });
    } catch (err) {
      console.error(err);
      setQuote({ price: 3499, time: "2-3 Hours" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-neutral-900 rounded-[32px] shadow-2xl overflow-hidden border border-white/10">
        <div className="p-6 bg-black border-b border-white/5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-white uppercase italic">iPhone Quote</h2>
            <p className="text-[10px] text-primary font-black uppercase tracking-widest">{product.name} Expert</p>
          </div>
          <button onClick={onClose} className="size-10 rounded-full hover:bg-white/5 flex items-center justify-center text-white">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-6">
          {!quote ? (
            <form onSubmit={generateQuote} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-1 opacity-50">iPhone Model</label>
                <input 
                  required
                  type="text"
                  placeholder="e.g. iPhone 15 Pro, iPhone 11"
                  value={model}
                  onChange={e => setModel(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl border border-white/10 bg-black focus:ring-2 focus:ring-primary text-sm font-bold text-white placeholder:text-white/20"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-1 opacity-50">State of Device</label>
                <textarea 
                  required
                  rows={3}
                  placeholder="e.g. Cracked glass, Touch working, Green line..."
                  value={issue}
                  onChange={e => setIssue(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-black focus:ring-2 focus:ring-primary text-sm font-bold text-white resize-none placeholder:text-white/20"
                />
              </div>
              
              <button 
                type="submit"
                disabled={loading}
                className="w-full h-14 bg-primary text-black font-black rounded-2xl shadow-xl shadow-primary/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 hover:bg-red-600"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="size-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                    <span>Analyzing Parts...</span>
                  </div>
                ) : (
                  <>
                    <span>Get iPhone Quote</span>
                    <span className="material-symbols-outlined">auto_awesome</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="text-center py-4">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6 border border-primary/20">
                <span className="material-symbols-outlined text-sm font-bold">verified</span>
                <span className="text-[10px] font-black uppercase tracking-widest">Kurnool Pro Estimate</span>
              </div>
              
              <div className="mb-8">
                <p className="text-[10px] text-white/40 uppercase font-black tracking-widest mb-2">Estimated Cost</p>
                <h3 className="text-5xl font-black text-white">₹{quote.price.toLocaleString()}</h3>
              </div>

              <div className="bg-black p-4 rounded-2xl border border-white/5 mb-8 text-left">
                <p className="text-[9px] font-black text-white/30 uppercase mb-1">Device Details</p>
                <p className="text-xs font-bold text-white uppercase">{model} • {product.name}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setQuote(null)}
                  className="h-14 rounded-2xl border-2 border-white/5 font-black text-white/60 hover:bg-white/5 transition-all"
                >
                  Edit Model
                </button>
                <button 
                  onClick={() => onConfirm(`${model} (${product.name})`, quote.price)}
                  className="h-14 rounded-2xl bg-primary text-black font-black shadow-xl shadow-primary/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] hover:bg-red-600"
                >
                  Book Fix
                  <span className="material-symbols-outlined">add_shopping_cart</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuoteModal;
