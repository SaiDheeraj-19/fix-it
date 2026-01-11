
import React from 'react';
import { Product } from '../types';
import ProductTile from './ProductTile';

interface BentoGridProps {
  products: Product[];
  onAddToCart: (p: Product, quantity: number) => void;
  onViewDetails: (p: Product) => void;
}

const BentoGrid: React.FC<BentoGridProps> = ({ products, onAddToCart, onViewDetails }) => {
  if (products.length === 0) return null;
  
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 auto-rows-[200px] sm:auto-rows-[240px]">
      {products.map((product) => (
        <ProductTile 
          key={product.id} 
          product={product} 
          onAddToCart={(q) => onAddToCart(product, q)} 
          onViewDetails={onViewDetails}
        />
      ))}
    </div>
  );
};

export default BentoGrid;
