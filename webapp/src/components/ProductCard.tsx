import { useState } from 'react';
import { useCartStore } from '../store/cartStore';

// Interface matching the backend response
export interface ProductVariant {
    id: number;
    size: string;
    stock: number;
}

export interface Product {
    id: number;
    category_id: number;
    name: string;
    description: string | null;
    price: string; // Decimal comes as string from FastAPI
    image_url: string | null;
    variants: ProductVariant[];
}

interface ProductCardProps {
    product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
    const [selectedSize, setSelectedSize] = useState<string>('');
    const addItem = useCartStore((state) => state.addItem);

    // Filter out sizes that are out of stock
    const availableVariants = product.variants.filter(v => v.stock > 0);

    const handleAddToCart = () => {
        if (availableVariants.length > 0 && !selectedSize) {
            alert('Пожалуйста, выберите размер');
            return;
        }

        addItem({
            id: product.id,
            name: product.name,
            price: Number(product.price),
            size: selectedSize || 'OS', // Default to One Size if no variants
            quantity: 1,
            image_url: product.image_url || undefined,
        });

        // Optional: Add some visual feedback here later
        setSelectedSize('');
    };

    return (
        <div style={{
            backgroundColor: 'var(--tg-theme-secondary-bg-color, #ffffff)',
            borderRadius: '12px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        }}>
            {/* Image */}
            <div style={{ height: '180px', backgroundColor: '#f0f0f0' }}>
                {product.image_url ? (
                    <img
                        src={product.image_url}
                        alt={product.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#999' }}>
                        Нет фото
                    </div>
                )}
            </div>

            {/* Content */}
            <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600' }}>{product.name}</h3>

                {product.description && (
                    <p style={{ margin: '0 0 12px 0', fontSize: '12px', color: 'var(--tg-theme-hint-color, #666)', flexGrow: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {product.description}
                    </p>
                )}

                <div style={{ fontWeight: 'bold', fontSize: '18px', marginBottom: '12px' }}>
                    {Number(product.price).toLocaleString('ru-RU')} ₽
                </div>

                {/* Size Selector */}
                {availableVariants.length > 0 && (
                    <select
                        value={selectedSize}
                        onChange={(e) => setSelectedSize(e.target.value)}
                        style={{
                            width: '100%', padding: '8px', marginBottom: '12px', borderRadius: '8px',
                            border: '1px solid #ccc', backgroundColor: 'var(--tg-theme-bg-color, #fff)',
                            color: 'var(--tg-theme-text-color, #000)', fontSize: '14px'
                        }}
                    >
                        <option value="" disabled>Выберите размер</option>
                        {availableVariants.map(v => (
                            <option key={v.id} value={v.size}>{v.size}</option>
                        ))}
                    </select>
                )}

                {/* Add Button */}
                <button
                    onClick={handleAddToCart}
                    style={{
                        width: '100%', padding: '10px', borderRadius: '8px', border: 'none',
                        backgroundColor: 'var(--tg-theme-button-color, #2481cc)',
                        color: 'var(--tg-theme-button-text-color, #ffffff)',
                        fontWeight: '600', fontSize: '14px', cursor: 'pointer',
                        transition: 'opacity 0.2s'
                    }}
                >
                    В корзину
                </button>
            </div>
        </div>
    );
}
