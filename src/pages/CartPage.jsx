import { useState } from 'react';
import { Trash2, Plus, Minus, ShoppingCart, MapPin, Package, X } from 'lucide-react';
import { useAuthStore, useMarketStore, useGymStore } from '../store/stores';
import { PRODUCTS } from '../data/products';
import { formatCurrency, formatDate } from '../utils/helpers';
import { useToast } from '../components/Toast';
import './CartPage.css';

function OrderConfirmModal({ order, gym, onClose }) {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="order-success-icon">🎉</div>
        <h2 className="modal-title" style={{ textAlign: 'center', marginBottom: 8 }}>Order Placed!</h2>
        <p className="text-muted" style={{ textAlign: 'center', fontSize: '0.9rem', marginBottom: 20 }}>
          Your order has been confirmed and will be delivered to your gym.
        </p>
        <div className="order-confirm-details">
          <div className="order-confirm-row">
            <span>Order ID</span>
            <strong className="text-gold">{order.id}</strong>
          </div>
          <div className="order-confirm-row">
            <span>Delivery To</span>
            <strong>{gym?.name || 'Your selected gym'}</strong>
          </div>
          <div className="order-confirm-row">
            <span>Total</span>
            <strong>{formatCurrency(order.total)}</strong>
          </div>
          <div className="order-confirm-row">
            <span>Est. Delivery</span>
            <strong>{formatDate(order.estimatedDelivery)}</strong>
          </div>
        </div>
        <button className="btn btn-primary btn-full mt-16" onClick={onClose}>Done</button>
      </div>
    </div>
  );
}

export default function CartPage() {
  const toast = useToast();
  const user = useAuthStore((s) => s.currentUser);
  const selectedGym = useGymStore((s) => s.selectedGym);
  const { cart, removeFromCart, updateQuantity, placeOrder, clearCart } = useMarketStore();
  const allOrders = useMarketStore((s) => s.orders);
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [tab, setTab] = useState('cart');

  const cartItems = cart.map((item) => ({
    ...item,
    product: PRODUCTS.find((p) => p.id === item.productId),
  })).filter((i) => i.product);

  const total = cartItems.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const orders = user?.uid ? (allOrders[user.uid] || []) : [];

  const handleCheckout = () => {
    if (!selectedGym) {
      toast('Please select a gym first for delivery address.', 'error');
      return;
    }
    if (cartItems.length === 0) {
      toast('Your cart is empty.', 'error');
      return;
    }
    const order = placeOrder(
      user.uid,
      cartItems.map((i) => ({ productId: i.productId, name: i.product.name, qty: i.quantity, price: i.product.price })),
      selectedGym,
      total
    );
    setConfirmedOrder(order);
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Cart & Orders</h1>
      </div>

      <div className="tabs mb-24" style={{ maxWidth: 360 }}>
        <button className={`tab ${tab === 'cart' ? 'active' : ''}`} onClick={() => setTab('cart')}>
          🛒 Cart {cartItems.length > 0 && `(${cartItems.length})`}
        </button>
        <button className={`tab ${tab === 'orders' ? 'active' : ''}`} onClick={() => setTab('orders')}>
          📦 Orders {orders.length > 0 && `(${orders.length})`}
        </button>
      </div>

      {tab === 'cart' && (
        <div className="cart-layout">
          <div>
            {cartItems.length === 0 ? (
              <div className="empty-state card">
                <div className="empty-state-icon">🛒</div>
                <div className="empty-state-title">Your cart is empty</div>
                <div className="empty-state-desc">Browse the shop and add items to get started.</div>
                <a href="/marketplace" className="btn btn-primary mt-16" style={{ textDecoration: 'none' }}>
                  Go to Shop
                </a>
              </div>
            ) : (
              <div className="flex flex-col gap-12">
                {cartItems.map((item) => (
                  <div key={item.productId} className="cart-item card">
                    <img src={item.product.image} alt={item.product.name} className="cart-item-img" />
                    <div className="cart-item-info">
                      <div className="cart-item-name">{item.product.name}</div>
                      <div className="cart-item-price">{formatCurrency(item.product.price)}</div>
                    </div>
                    <div className="cart-qty-ctrl">
                      <button className="btn btn-ghost btn-icon btn-sm" onClick={() => updateQuantity(item.productId, item.quantity - 1)}>
                        <Minus size={12} />
                      </button>
                      <span className="cart-qty">{item.quantity}</span>
                      <button className="btn btn-ghost btn-icon btn-sm" onClick={() => updateQuantity(item.productId, item.quantity + 1)}>
                        <Plus size={12} />
                      </button>
                    </div>
                    <div className="cart-item-total">{formatCurrency(item.product.price * item.quantity)}</div>
                    <button className="btn btn-danger btn-icon btn-sm" onClick={() => removeFromCart(item.productId)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {cartItems.length > 0 && (
            <div className="cart-summary card">
              <h3 style={{ marginBottom: 16, fontSize: '1rem' }}>Order Summary</h3>
              <div className="flex flex-col gap-10 mb-16">
                {cartItems.map((i) => (
                  <div key={i.productId} className="flex justify-between text-sm">
                    <span className="text-muted">{i.product.name} ×{i.quantity}</span>
                    <span>{formatCurrency(i.product.price * i.quantity)}</span>
                  </div>
                ))}
                <hr className="divider" />
                <div className="flex justify-between" style={{ fontWeight: 700 }}>
                  <span>Total</span>
                  <span className="text-gold" style={{ fontSize: '1.1rem' }}>{formatCurrency(total)}</span>
                </div>
              </div>
              <div className="delivery-address">
                <div className="flex items-center gap-8 mb-4">
                  <MapPin size={14} className="text-gold" />
                  <span className="text-sm font-weight-600">Delivery Address</span>
                </div>
                {selectedGym ? (
                  <div className="text-sm text-muted">{selectedGym.name}, {selectedGym.address}</div>
                ) : (
                  <div className="text-sm" style={{ color: 'var(--warning)' }}>
                    ⚠️ No gym selected. <a href="/gym" style={{ color: 'var(--gold-primary)' }}>Select a gym</a> first.
                  </div>
                )}
              </div>
              <button
                className="btn btn-primary btn-full btn-lg mt-16"
                onClick={handleCheckout}
                disabled={!selectedGym}
              >
                Place Order
              </button>
              <button className="btn btn-ghost btn-full btn-sm mt-8" onClick={() => { clearCart(); toast('Cart cleared.', 'info'); }}>
                Clear Cart
              </button>
            </div>
          )}
        </div>
      )}

      {tab === 'orders' && (
        <div className="flex flex-col gap-16" style={{ maxWidth: 700 }}>
          {orders.length === 0 ? (
            <div className="empty-state card">
              <div className="empty-state-icon">📦</div>
              <div className="empty-state-title">No orders yet</div>
            </div>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="card order-card">
                <div className="flex items-center justify-between mb-12">
                  <div>
                    <div className="order-id">{order.id}</div>
                    <div className="text-xs text-muted">{new Date(order.placedAt).toLocaleString('en-IN')}</div>
                  </div>
                  <span className="badge badge-green">{order.status}</span>
                </div>
                <div className="flex flex-col gap-6 mb-12">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-muted">{item.name} ×{item.qty}</span>
                      <span>{formatCurrency(item.price * item.qty)}</span>
                    </div>
                  ))}
                </div>
                <hr className="divider" />
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-6 text-sm text-muted">
                    <MapPin size={12} />
                    {order.deliveryGym?.name}
                  </div>
                  <div style={{ fontWeight: 700, color: 'var(--gold-primary)' }}>
                    {formatCurrency(order.total)}
                  </div>
                </div>
                <div className="text-xs text-muted mt-8">
                  Est. delivery: {formatDate(order.estimatedDelivery)}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {confirmedOrder && (
        <OrderConfirmModal
          order={confirmedOrder}
          gym={selectedGym}
          onClose={() => setConfirmedOrder(null)}
        />
      )}
    </div>
  );
}
