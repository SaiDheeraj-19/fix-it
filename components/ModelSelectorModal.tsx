
import React, { useState } from 'react';
import { Product } from '../types';
import { IPHONE_MODELS } from '../constants';

interface ModelSelectorModalProps {
  product: Product;
  onClose: () => void;
  onConfirm: (model: string) => void;
}

const ModelSelectorModal: React.FC<ModelSelectorModalProps> = ({ product, onClose, onConfirm }) => {
  const [selectedModel, setSelectedModel] = useState('');
  const [customModel, setCustomModel] = useState('');
  const isUniversal = product.isUniversalModel;

  const handleConfirm = () => {
    onConfirm(customModel || selectedModel);
  };

  return (
    <div className="fixed inset-0 z-[75] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-neutral-900 rounded-[32px] shadow-2xl overflow-hidden border border-white/10 flex flex-col max-h-[80vh]">
        <div className="p-6 bg-black border-b border-white/5 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-black text-white">Select Model</h2>
            <p className="text-[10px] text-primary font-bold uppercase tracking-widest">For {product.name}</p>
          </div>
          <button onClick={onClose} className="size-10 rounded-full hover:bg-white/5 flex items-center justify-center text-white">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-4 overflow-y-auto no-scrollbar grid grid-cols-1 gap-2">
          {isUniversal && (
            <div className="px-2 mb-4">
              <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-1 opacity-50">Type Your Phone Model</label>
              <input 
                type="text"
                placeholder="e.g. Samsung S24, Redmi Note 13, etc."
                value={customModel}
                onChange={e => {
                  setCustomModel(e.target.value);
                  setSelectedModel('');
                }}
                className="w-full h-12 px-4 rounded-xl border border-white/10 bg-black focus:ring-2 focus:ring-primary text-sm font-bold text-white placeholder:text-white/20"
              />
              <div className="flex items-center gap-4 my-4">
                <div className="h-px bg-white/5 flex-1" />
                <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">or pick apple</span>
                <div className="h-px bg-white/5 flex-1" />
              </div>
            </div>
          )}

          <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-2 px-2">
            {isUniversal ? 'Quick Pick Apple Models' : 'iPhone 11 to 16 Series Only'}
          </p>
          
          {IPHONE_MODELS.map((model) => (
            <button
              key={model}
              onClick={() => {
                setSelectedModel(model);
                setCustomModel('');
              }}
              className={`
                w-full h-12 px-4 rounded-xl text-left font-bold text-sm transition-all border
                ${selectedModel === model 
                  ? 'bg-primary border-primary text-black' 
                  : 'bg-black/40 border-white/5 text-white/60 hover:border-white/20'
                }
              `}
            >
              {model}
            </button>
          ))}
        </div>

        <div className="p-6 bg-black border-t border-white/5">
          <button
            disabled={!selectedModel && !customModel}
            onClick={handleConfirm}
            className="w-full h-14 bg-primary text-black font-black rounded-2xl shadow-xl shadow-primary/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-30 disabled:grayscale"
          >
            <span>Confirm Selection</span>
            <span className="material-symbols-outlined">check_circle</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModelSelectorModal;
