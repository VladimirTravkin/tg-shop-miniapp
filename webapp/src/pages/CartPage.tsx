import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';

export function CartPage() {
    const { items, updateQuantity, removeItem, getTotalPrice } = useCartStore();
    const navigate = useNavigate();

    if (items.length === 0) {
        return (
            <div style={{ padding: '40px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🛒</div>
                <h2 style={{ marginBottom: '8px' }}>Ваша корзина пуста</h2>
                <p style={{ color: 'var(--tg-theme-hint-color, #666)', marginBottom: '24px' }}>
                    Добавьте товары из каталога, чтобы сделать заказ.
                </p>
                <Link
                    to="/"
                    style={{
                        padding: '12px 24px',
                        backgroundColor: 'var(--tg-theme-button-color, #2481cc)',
                        color: 'var(--tg-theme-button-text-color, #ffffff)',
                        textDecoration: 'none',
                        borderRadius: '8px',
                        fontWeight: '600'
                    }}
                >
                    Перейти в каталог
                </Link>
            </div>
        );
    }

    return (
        <div style={{ padding: '16px', maxWidth: '800px', margin: '0 auto', paddingBottom: '80px' }}>
            <h1 style={{ fontSize: '24px', marginBottom: '16px', fontWeight: 'bold' }}>Корзина</h1>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                {items.map((item) => (
                    <div
                        key={`${item.id}-${item.size}-${item.color}`}
                        style={{
                            display: 'flex',
                            backgroundColor: 'var(--tg-theme-secondary-bg-color, #ffffff)',
                            borderRadius: '12px',
                            padding: '12px',
                            gap: '12px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                        }}
                    >
                        {/* Image */}
                        <div style={{ width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#f0f0f0', flexShrink: 0 }}>
                            {item.image_url ? (
                                <img src={item.image_url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : null}
                        </div>

                        {/* Details */}
                        <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'space-between' }}>
                            <div>
                                <h3 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: '600' }}>{item.name}</h3>
                                <div style={{ fontSize: '12px', color: 'var(--tg-theme-hint-color, #666)' }}>
                                    {item.color}, {item.size}
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                                {/* Quantity Controls */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--tg-theme-bg-color, #fff)', borderRadius: '8px', padding: '4px' }}>
                                    <button
                                        onClick={() => updateQuantity(item.id, item.size, item.color, item.quantity - 1)}
                                        style={{ width: '28px', height: '28px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                    >
                                        -
                                    </button>
                                    <span style={{ fontSize: '14px', fontWeight: '600', minWidth: '20px', textAlign: 'center' }}>{item.quantity}</span>
                                    <button
                                        onClick={() => updateQuantity(item.id, item.size, item.color, item.quantity + 1)}
                                        style={{ width: '28px', height: '28px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                    >
                                        +
                                    </button>
                                </div>

                                {/* Price */}
                                <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
                                    {(item.price * item.quantity).toLocaleString('ru-RU')} ₽
                                </div>
                            </div>
                        </div>

                        {/* Remove Button */}
                        <button
                            onClick={() => removeItem(item.id, item.size, item.color)}
                            style={{
                                background: 'transparent', border: 'none', cursor: 'pointer',
                                color: 'red', fontSize: '20px', alignSelf: 'flex-start', padding: '4px'
                            }}
                            title="Удалить"
                        >
                            ×
                        </button>
                    </div>
                ))}
            </div>

            {/* Checkout Summary */}
            <div style={{
                backgroundColor: 'var(--tg-theme-secondary-bg-color, #ffffff)',
                padding: '16px',
                borderRadius: '12px',
                boxShadow: '0 -2px 10px rgba(0,0,0,0.05)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '18px', fontWeight: 'bold' }}>
                    <span>Итого:</span>
                    <span>{getTotalPrice().toLocaleString('ru-RU')} ₽</span>
                </div>
                <Link
                    to="/"
                    style={{
                        display: 'block',
                        textAlign: 'center',
                        width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--tg-theme-button-color, #2481cc)',
                        backgroundColor: 'transparent',
                        color: 'var(--tg-theme-button-color, #2481cc)',
                        fontWeight: '600', fontSize: '16px', cursor: 'pointer', marginBottom: '12px',
                        textDecoration: 'none'
                    }}
                >
                    Продолжить покупки
                </Link>
                <button
                    onClick={() => navigate('/checkout')}
                    style={{
                        width: '100%', padding: '14px', borderRadius: '8px', border: 'none',
                        backgroundColor: 'var(--tg-theme-button-color, #2481cc)',
                        color: 'var(--tg-theme-button-text-color, #ffffff)',
                        fontWeight: '600', fontSize: '16px', cursor: 'pointer'
                    }}
                >
                    Оформить заказ
                </button>
            </div>
        </div>
    );
}
