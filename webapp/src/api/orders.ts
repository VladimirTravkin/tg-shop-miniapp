import { apiClient } from './client';

export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled';

export interface OrderItem {
    product_id: number;
    product_name: string;
    variant_size: string;
    variant_color: string;
    price_at_purchase: string; // Decimal serialized as string by backend
    quantity: number;
    subtotal: string;          // Decimal serialized as string by backend
}

export interface Order {
    id: number;
    status: OrderStatus;
    total_amount: string;      // Decimal serialized as string by backend
    delivery_address: string;
    customer_name: string;
    customer_phone: string;
    created_at: string;        // ISO datetime
    paid_at: string | null;
    items: OrderItem[];
}

/**
 * Fetch order history for the current authenticated user.
 */
export const fetchUserOrders = async (): Promise<Order[]> => {
    const response = await apiClient.get<Order[]>('/orders/');
    return response.data;
};
