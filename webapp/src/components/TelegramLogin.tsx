import { useEffect } from 'react';
import { type TelegramWidgetData } from '../api/authWidget';

interface TelegramLoginProps {
    botName: string;
    onAuth: (user: TelegramWidgetData) => void;
}

export function TelegramLogin({ botName, onAuth }: TelegramLoginProps) {
    useEffect(() => {
        // Telegram widget requires a global callback function
        (window as unknown as { onTelegramAuth: (user: TelegramWidgetData) => void }).onTelegramAuth = onAuth;

        const script = document.createElement('script');
        script.src = 'https://telegram.org/js/telegram-widget.js?22';
        script.async = true;
        script.setAttribute('data-telegram-login', botName);
        script.setAttribute('data-size', 'large');
        script.setAttribute('data-onauth', 'onTelegramAuth(user)');
        script.setAttribute('data-request-access', 'write');

        const container = document.getElementById('tg-login-container');
        if (container) {
            container.innerHTML = ''; // Clear previous script if any
            container.appendChild(script);
        }
    }, [botName, onAuth]);

    return (
        <div
            id="tg-login-container"
            style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}
        />
    );
}
