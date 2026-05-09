import { useState } from 'react';
import { ShoppingCart, Star, Filter } from 'lucide-react';
import { useAuthStore, useMarketStore } from '../store/stores';
import { PRODUCTS, PRODUCT_CATEGORIES } from '../data/products';
import { formatCurrency } from '../utils/helpers';
import { useToast } from '../components/Toast';
import './MarketplacePage.css';

function ProductCard({ product, onAddToCart }) {
  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
  return (
    <div className="product-card card">
      <div className="product-img-wrap">
        <img src={product.image} alt={product.name} className="product-img" loading="lazy" />
        {discount > 0 && <span className="product-discount">-{discount}%</span>}
        <span className="product-category-badge">{product.category}</span>
      </div>
      <div className="product-body">
        <div className="product-name">{product.name}</div>
        <div className="product-desc">{product.description}</div>
        <div className="product-stars">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={12} fill="var(--gold-primary)" color="var(--gold-primary)" />
          ))}
          <span className="text-xs text-muted ml-4">({Math.floor(Math.random() * 200 + 50)})</span>
        </div>
        <div className="product-price-row">
          <div>
            <div className="product-price">{formatCurrency(product.price)}</div>
            <div className="product-original-price">{formatCurrency(product.originalPrice)}</div>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => onAddToCart(product.id)}>
            <ShoppingCart size={14} /> Add
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MarketplacePage() {
  const toast = useToast();
  const addToCart = useMarketStore((s) => s.addToCart);
  const cart = useMarketStore((s) => s.cart);
  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = PRODUCTS.filter((p) => {
    const matchCat = category === 'All' || p.category === category;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleAddToCart = (productId) => {
    addToCart(productId);
    toast('Added to cart!', 'success');
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">Shop</h1>
          <p className="page-subtitle">Supplements, gear, and apparel — delivered to your gym</p>
        </div>
        <a href="/cart" className="btn btn-secondary" style={{ textDecoration: 'none' }}>
          <ShoppingCart size={16} />
          Cart {cartCount > 0 && <span className="cart-count-chip">{cartCount}</span>}
        </a>
      </div>

      {/* Search + Filter */}
      <div className="market-toolbar mb-20">
        <input
          className="input market-search"
          placeholder="🔍 Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="market-cats">
          {PRODUCT_CATEGORIES.map((c) => (
            <button
              key={c}
              className={`btn btn-sm ${category === c ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-state-icon">🔍</div>
          <div className="empty-state-title">No products found</div>
          <div className="empty-state-desc">Try a different search or category.</div>
        </div>
      ) : (
        <div className="products-grid">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} onAddToCart={handleAddToCart} />
          ))}
        </div>
      )}
    </div>
  );
}
