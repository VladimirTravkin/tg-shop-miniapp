import { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import { ProductCard, type Product } from '../components/ProductCard';

export function CatalogPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const response = await apiClient.get('/catalog/products');
                setProducts(response.data.items);
            } catch (err) {
                console.error(err);
                setError('Не удалось загрузить каталог.');
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}>Загрузка...</div>;
    if (error) return <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>{error}</div>;
    if (products.length === 0) return <div style={{ padding: '20px', textAlign: 'center' }}>Товары пока не добавлены.</div>;

    return (
        // Max-width limits the app size on desktop
        <div style={{ padding: '16px', maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '24px', marginBottom: '16px', fontWeight: 'bold' }}>Каталог</h1>

            {/* Adaptive Grid: auto-fill creates as many columns as fit, minimum 160px each */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                gap: '16px'
            }}>
                {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </div>
    );
}
