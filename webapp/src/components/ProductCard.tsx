import { useState } from 'react';
import { useCartStore } from '../store/cartStore';

// Interface matching the backend response
export interface ProductVariant {
    id: number;
    size: string;
    color: string;
    image_url: string | null;
    stock: number;
}

export interface Product {
    id: number;
    category_id: number;
    name: string;
    description: string | null;
    price: string;
    image_url: string | null;
    variants: ProductVariant[];
}

interface ProductCardProps {
    product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
    const [selectedColor, setSelectedColor] = useState<string>('');
    const [selectedSize, setSelectedSize] = useState<string>('');
    const [cardError, setCardError] = useState<string | null>(null);
    const addItem = useCartStore((state) => state.addItem);

    // Get unique colors that have at least one variant in stock
    const availableColors = Array.from(
        new Set(product.variants.filter(v => v.stock > 0).map(v => v.color))
    );

    // Get available sizes for the selected color
    const availableSizes = product.variants
        .filter(v => v.color === selectedColor && v.stock > 0)
        .map(v => v.size);

    // Determine current image based on selected color
    const currentVariant = product.variants.find(v => v.color === selectedColor);
    const displayImage = currentVariant?.image_url || product.image_url;

    const handleAddToCart = () => {
        if (availableColors.length > 0 && !selectedColor) {
            setCardError('Пожалуйста, выберите цвет');
            return;
        }
        if (availableSizes.length > 0 && !selectedSize) {
            setCardError('Пожалуйста, выберите размер');
            return;
        }

        addItem({
            id: product.id,
            name: product.name,
            price: Number(product.price),
            color: selectedColor || 'Стандарт',
            size: selectedSize || 'Единый размер',
            quantity: 1,
            image_url: displayImage || undefined,
        });

        // Reset selections after adding
        setSelectedColor('');
        setSelectedSize('');
        setCardError(null);
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
                {displayImage ? (
                    <img
                        src={displayImage}
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

                {/* Color Selector */}
                {availableColors.length > 0 && (
                    <select
                        value={selectedColor}
                        onChange={(e) => {
                            setSelectedColor(e.target.value);
                            setSelectedSize('');
                        }}
                        style={{
                            width: '100%', padding: '8px', marginBottom: '8px', borderRadius: '8px',
                            border: '1px solid #ccc', backgroundColor: 'var(--tg-theme-bg-color, #fff)',
                            color: 'var(--tg-theme-text-color, #000)', fontSize: '14px'
                        }}
                    >
                        <option value="" disabled>Выберите цвет</option>
                        {availableColors.map(color => (
                            <option key={color} value={color}>{color}</option>
                        ))}
                    </select>
                )}

                {/* Size Selector (only shown if color is selected or if no colors exist) */}
                {(selectedColor || availableColors.length === 0) && availableSizes.length > 0 && (
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
                        {availableSizes.map(size => (
                            <option key={size} value={size}>{size}</option>
                        ))}
                    </select>
                )}

                {/* Error message */}
                {cardError && (
                    <div style={{ color: '#d8000c', fontSize: '12px', marginBottom: '8px', textAlign: 'center' }}>
                        {cardError}
                    </div>
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
