import { apiClient } from './client';

interface AuthResponse {
    access_token: string;
    token_type: string;
    user_id: number;
}

export const authenticateTelegram = async (): Promise<boolean> => {
    try {
        // 1. Get initData from Telegram WebApp SDK
        const tg = window.Telegram?.WebApp;
        const initData = tg?.initData;

        if (!initData) {
            console.warn('Telegram initData is not available. Are you running inside Telegram?');
            // For local development in a browser, we might mock this or skip.
            return false;
        }

        // 2. Send initData to our backend
        const response = await apiClient.post<AuthResponse>('/auth/', {
            init_data: initData,
        });

        // 3. Save JWT token to localStorage
        localStorage.setItem('access_token', response.data.access_token);

        console.log('Successfully authenticated with Telegram');
        return true;
    } catch (error) {
        console.error('Authentication failed:', error);
        return false;
    }
};
