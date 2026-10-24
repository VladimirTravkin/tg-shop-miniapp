import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { apiClient } from '../api/client';

export function CheckoutPage() {
    const { items, getTotalPrice, clearCart } = useCartStore();
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // If cart is empty, redirect back
    if (items.length === 0 && !loading) {
        return (
            <div style={{ padding: '20px', textAlign: 'center' }}>
                <h2>Корзина пуста</h2>
                <button onClick={() => navigate('/')} style={{ marginTop: '16px', padding: '10px 20px' }}>
                    Вернуться в каталог
                </button>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // 1. Create the order
            const orderPayload = {
                items: items.map((item) => ({
                    product_id: item.id,
                    size: item.size,
                    color: item.color,
                    quantity: item.quantity,
                })),
                delivery_address: address,
                customer_name: name,
                customer_phone: phone,
            };

            const orderResponse = await apiClient.post('/orders/', orderPayload);
            const orderId = orderResponse.data.id;

            // 2. Create the payment
            const paymentResponse = await apiClient.post('/payments/', {
                order_id: orderId,
            });

            // 3. Clear cart and redirect to YooKassa
            clearCart();

            const confirmationUrl = paymentResponse.data.confirmation_url;

            // In Telegram Mini App, it's better to use openLink, but for web testing we use location.href
            const tg = window.Telegram?.WebApp;
            if (tg) {
                tg.openLink(confirmationUrl);
                // Перенаправляем в профиль, чтобы при возврате из ЮKassa не видеть застывшую форму
                navigate('/profile');
            } else {
                window.location.href = confirmationUrl;
            }

        } catch (err: unknown) {
            console.error(err);
            // Safely extract error message from backend if available
            const axiosError = err as { response?: { data?: { detail?: string } } };
            const message = axiosError.response?.data?.detail || 'Произошла ошибка при оформлении заказа. Попробуйте позже.';
            setError(message);
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '16px', maxWidth: '600px', margin: '0 auto', paddingBottom: '80px' }}>
            <h1 style={{ fontSize: '24px', marginBottom: '16px', fontWeight: 'bold' }}>Оформление заказа</h1>

            {error && (
                <div style={{ padding: '12px', backgroundColor: '#ffe6e6', color: '#d8000c', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>Имя и фамилия</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        placeholder="Иван Иванов"
                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '16px' }}
                    />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>Телефон</label>
                    <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                        placeholder="+7 (999) 000-00-00"
                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '16px' }}
                    />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>Адрес доставки</label>
                    <textarea
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        required
                        placeholder="Город, улица, дом, квартира"
                        rows={3}
                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '16px', resize: 'vertical' }}
                    />
                </div>

                <div style={{ marginTop: '16px', padding: '16px', backgroundColor: 'var(--tg-theme-secondary-bg-color, #f9f9f9)', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '18px', fontWeight: 'bold' }}>
                        <span>К оплате:</span>
                        <span>{getTotalPrice().toLocaleString('ru-RU')} ₽</span>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%', padding: '14px', borderRadius: '8px', border: 'none',
                            backgroundColor: loading ? '#999' : 'var(--tg-theme-button-color, #2481cc)',
                            color: 'var(--tg-theme-button-text-color, #ffffff)',
                            fontWeight: '600', fontSize: '16px', cursor: loading ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {loading ? 'Обработка...' : 'Перейти к оплате'}
                    </button>
                </div>
            </form>
        </div>
    );
}
