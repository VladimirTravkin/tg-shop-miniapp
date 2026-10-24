import { useEffect, useState } from 'react';
import { fetchUserOrders, type Order, type OrderStatus } from '../api/orders';
import { TelegramLogin } from '../components/TelegramLogin';
import { authenticateWidget, type TelegramWidgetData } from '../api/authWidget';

const STATUS_LABELS: Record<OrderStatus, string> = {
    pending: 'Ожидает оплаты',
    paid: 'Оплачен',
    shipped: 'Отправлен',
    completed: 'Выполнен',
    cancelled: 'Отменён',
};

const STATUS_COLORS: Record<OrderStatus, { bg: string; color: string }> = {
    pending:   { bg: '#fff4e5', color: '#b26a00' },
    paid:      { bg: '#e6f4ea', color: '#1e7e34' },
    shipped:   { bg: '#e6f0ff', color: '#0b5ed7' },
    completed: { bg: '#e6f4ea', color: '#1e7e34' },
    cancelled: { bg: '#ffe6e6', color: '#d8000c' },
};

const formatDate = (iso: string): string => {
    const d = new Date(iso);
    return d.toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const formatPrice = (value: string): string => {
    return Number(value).toLocaleString('ru-RU', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }) + ' ₽';
};

function StatusBadge({ status }: { status: OrderStatus }) {
    const palette = STATUS_COLORS[status];
    return (
        <span
            style={{
                display: 'inline-block',
                padding: '4px 10px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 600,
                backgroundColor: palette.bg,
                color: palette.color,
            }}
        >
            {STATUS_LABELS[status]}
        </span>
    );
}

function OrderCard({ order }: { order: Order }) {
    const [expanded, setExpanded] = useState(false);

    return (
        <div
            style={{
                border: '1px solid rgba(0,0,0,0.1)',
                borderRadius: '12px',
                padding: '16px',
                backgroundColor: 'var(--tg-theme-secondary-bg-color, #f9f9f9)',
                marginBottom: '12px',
            }}
        >
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: '12px',
                    marginBottom: '8px',
                }}
            >
                <div>
                    <div style={{ fontWeight: 700, fontSize: '16px' }}>
                        Заказ №{order.id}
                    </div>
                    <div style={{ fontSize: '13px', color: '#666', marginTop: '2px' }}>
                        {formatDate(order.created_at)}
                    </div>
                </div>
                <StatusBadge status={order.status} />
            </div>

            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '8px',
                }}
            >
                <span style={{ fontSize: '14px', color: '#666' }}>
                    {order.items.length} {order.items.length === 1 ? 'товар' : 'товаров'} на сумму
                </span>
                <span style={{ fontWeight: 700, fontSize: '16px' }}>
                    {formatPrice(order.total_amount)}
                </span>
            </div>

            <button
                onClick={() => setExpanded((v) => !v)}
                style={{
                    marginTop: '12px',
                    width: '100%',
                    padding: '8px',
                    borderRadius: '8px',
                    border: '1px solid rgba(0,0,0,0.15)',
                    backgroundColor: 'transparent',
                    color: 'var(--tg-theme-text-color, #000)',
                    fontSize: '14px',
                    cursor: 'pointer',
                }}
            >
                {expanded ? 'Скрыть детали' : 'Показать детали'}
            </button>

            {expanded && (
                <div style={{ marginTop: '12px', borderTop: '1px solid rgba(0,0,0,0.1)', paddingTop: '12px' }}>
                    {order.items.map((item, idx) => (
                        <div
                            key={idx}
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                gap: '12px',
                                padding: '6px 0',
                                fontSize: '14px',
                            }}
                        >
                            <div>
                                <div style={{ fontWeight: 500 }}>{item.product_name}</div>
                                <div style={{ fontSize: '12px', color: '#666' }}>
                                    {item.variant_color}, {item.variant_size} × {item.quantity}
                                </div>
                            </div>
                            <div style={{ whiteSpace: 'nowrap' }}>
                                {formatPrice(item.subtotal)}
                            </div>
                        </div>
                    ))}

                    <div
                        style={{
                            marginTop: '12px',
                            paddingTop: '12px',
                            borderTop: '1px dashed rgba(0,0,0,0.15)',
                            fontSize: '13px',
                            color: '#666',
                            lineHeight: 1.5,
                        }}
                    >
                        <div><b>Получатель:</b> {order.customer_name}</div>
                        <div><b>Телефон:</b> {order.customer_phone}</div>
                        <div><b>Адрес:</b> {order.delivery_address}</div>
                        {order.paid_at && (
                            <div><b>Оплачен:</b> {formatDate(order.paid_at)}</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export function ProfilePage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [needsDesktopAuth, setNeedsDesktopAuth] = useState(false);

    const loadOrders = async (silent = false) => {
        if (!silent) setLoading(true);
        setError(null);
        try {
            const data = await fetchUserOrders();
            setOrders(data);
            setNeedsDesktopAuth(false);
        } catch (err: any) {
            console.error(err);
            if (err.response?.status === 401) {
                if (!window.Telegram?.WebApp?.initData) {
                    setNeedsDesktopAuth(true);
                } else {
                    setError('Требуется авторизация через Telegram.');
                }
            } else {
                if (!silent) setError('Не удалось загрузить историю заказов. Попробуйте позже.');
            }
        } finally {
            if (!silent) setLoading(false);
        }
    };

    useEffect(() => {
        loadOrders();
    }, []);

    useEffect(() => {
        // Проверяем, есть ли заказы, ожидающие оплаты
        const hasPending = orders.some((o) => o.status === 'pending');
        if (!hasPending) return;

        // Если есть, запускаем тихое обновление каждые 5 секунд
        const interval = setInterval(() => {
            loadOrders(true);
        }, 5000);

        return () => clearInterval(interval);
    }, [orders]);

    const handleWidgetAuth = async (userData: TelegramWidgetData) => {
        const success = await authenticateWidget(userData);
        if (success) {
            // После успешного входа виджета перезагружаем заказы
            loadOrders();
        } else {
            setError('Ошибка авторизации через виджет.');
        }
    };

    if (loading) {
        return (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: '#666' }}>
                Загрузка заказов...
            </div>
        );
    }

    if (needsDesktopAuth) {
        return (
            <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                <h2 style={{ fontSize: '20px', marginBottom: '10px' }}>Вход в личный кабинет</h2>
                <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>
                    Вы открыли приложение с компьютера. Войдите через Telegram, чтобы увидеть историю заказов.
                </p>
                <TelegramLogin botName="VM13TgShopBot" onAuth={handleWidgetAuth} />
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ padding: '20px' }}>
                <div style={{
                    padding: '12px',
                    backgroundColor: '#ffe6e6',
                    color: '#d8000c',
                    borderRadius: '8px',
                    fontSize: '14px',
                }}>
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div style={{ padding: '16px', maxWidth: '600px', margin: '0 auto', paddingBottom: '80px' }}>
            <h1 style={{ fontSize: '24px', marginBottom: '16px', fontWeight: 'bold' }}>
                Мои заказы
            </h1>

            {orders.length === 0 ? (
                <div style={{ padding: '40px 20px', textAlign: 'center', color: '#666' }}>
                    У вас пока нет заказов.
                </div>
            ) : (
                orders.map((order) => <OrderCard key={order.id} order={order} />)
            )}
        </div>
    );
}
