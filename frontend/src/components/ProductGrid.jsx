import React from 'react';
import ProductCard from './ProductCard';
import { PackageOpen } from 'lucide-react';

const ProductGrid = ({ products = [], emptyMessage = 'No products found matching your criteria.' }) => {
  if (!products || products.length === 0) {
    return (
      <div className="empty-state-box">
        <PackageOpen size={48} className="empty-icon" />
        <h3>No Products Available</h3>
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
};

export default ProductGrid;
