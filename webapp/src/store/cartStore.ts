import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
    id: number;
    name: string;
    price: number;
    size: string; // Added size
    quantity: number;
    image_url?: string;
}

interface CartState {
    items: CartItem[];
    addItem: (item: CartItem) => void;
    removeItem: (id: number, size: string) => void;
    updateQuantity: (id: number, size: string, quantity: number) => void;
    clearCart: () => void;
    getTotalPrice: () => number;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],

            addItem: (item) => {
                const { items } = get();
                // Find by id AND size
                const existing = items.find((i) => i.id === item.id && i.size === item.size);

                if (existing) {
                    set({
                        items: items.map((i) =>
                            (i.id === item.id && i.size === item.size)
                                ? { ...i, quantity: i.quantity + item.quantity }
                                : i
                        ),
                    });
                } else {
                    set({ items: [...items, item] });
                }
            },

            removeItem: (id, size) => {
                set({ items: get().items.filter((i) => !(i.id === id && i.size === size)) });
            },

            updateQuantity: (id, size, quantity) => {
                if (quantity <= 0) {
                    get().removeItem(id, size);
                    return;
                }
                set({
                    items: get().items.map((i) =>
                        (i.id === id && i.size === size) ? { ...i, quantity } : i
                    ),
                });
            },

            clearCart: () => set({ items: [] }),

            getTotalPrice: () => {
                return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
            },
        }),
        {
            name: 'cart-storage', // key in localStorage
        }
    )
);
