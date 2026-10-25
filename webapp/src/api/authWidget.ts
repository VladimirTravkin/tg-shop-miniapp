import { apiClient } from './client';

// Interface for the data returned by Telegram Login Widget
export interface TelegramWidgetData {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    photo_url?: string;
    auth_date: number;
    hash: string;
}

export const authenticateWidget = async (userData: TelegramWidgetData): Promise<boolean> => {
    try {
        // Send the widget data to our new backend endpoint
        const response = await apiClient.post<{ access_token: string }>('/auth/widget', userData);

        // Save the JWT token
        localStorage.setItem('access_token', response.data.access_token);
        console.log('Successfully authenticated via Widget');
        return true;
    } catch (error) {
        console.error('Widget authentication failed:', error);
        return false;
    }
};
