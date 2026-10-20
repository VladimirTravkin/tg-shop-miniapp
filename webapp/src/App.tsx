import { BrowserRouter, Routes, Route, Link, Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { CatalogPage } from './pages/CatalogPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { ProfilePage } from './pages/ProfilePage';
import { authenticateTelegram } from './api/auth'; // Import auth function

// Layout with Bottom Navigation
function Layout() {
  const location = useLocation();

  useEffect(() => {
    // Initialize Telegram WebApp
    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
    }

    // Authenticate user on app load
    authenticateTelegram();
  }, []);

  const navItems = [
    { path: '/', label: 'Каталог', icon: '🛍️' },
    { path: '/cart', label: 'Корзина', icon: '🛒' },
    { path: '/profile', label: 'Профиль', icon: '👤' },
  ];

  return (
    <div style={{
      paddingBottom: '60px',
      minHeight: '100vh',
      backgroundColor: 'var(--tg-theme-bg-color, #ffffff)',
      color: 'var(--tg-theme-text-color, #000000)'
    }}>
      <main>
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, height: '60px',
        display: 'flex', justifyContent: 'space-around', alignItems: 'center',
        backgroundColor: 'var(--tg-theme-secondary-bg-color, #f0f0f0)',
        borderTop: '1px solid rgba(0,0,0,0.1)',
        zIndex: 10
      }}>
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            style={{
              textDecoration: 'none',
              color: location.pathname === item.path ? '#2481cc' : '#000000',
              fontWeight: location.pathname === item.path ? '600' : '500',
              display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '12px'
            }}
          >
            <span style={{ fontSize: '20px' }}>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}

// Main App Component
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<CatalogPage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
