export { };

declare global {
    interface Window {
        Telegram?: {
            WebApp: {
                ready: () => void;
                expand: () => void;
                openLink: (url: string) => void;
                initData: string;
            };
        };
    }
}
