# TG Shop MiniApp 🛍️

**English** | [Русский](README.ru.md)

[![Telegram Bot](https://img.shields.io/badge/Telegram-Open_Shop-blue?logo=telegram)](https://t.me/VM13TgShopBot)
![Python](https://img.shields.io/badge/Python-3.11-blue?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?logo=postgresql&logoColor=white)

> 🚀 **Live Demo:** [Open Shop in Telegram](https://t.me/VM13TgShopBot)

A full-stack E-commerce Telegram Mini App. The project features a product catalog, shopping cart, checkout process, secure YooKassa payment integration, and a user profile with order history.

## 📖 About The Project

The project is built with a focus on security and modern development standards. Authentication is handled via Telegram WebApp `initData` validation using HMAC-SHA256. For the desktop version, a secure login via Telegram Login Widget is implemented. The backend is fully asynchronous, and the infrastructure is containerized with Docker for easy deployment.

## 🎥 Demo

![Demo](docs/images/demo.gif)

## 📸 Screenshots

| Catalog | Cart |
| :---: | :---: |
| ![Catalog](docs/images/catalog.jpg) | ![Cart](docs/images/cart.jpg) |

| Checkout | Profile |
| :---: | :---: |
| ![Checkout](docs/images/checkout.jpg) | ![Profile](docs/images/profile.jpg) |

## 📂 Project Structure

```text
tg-shop-miniapp/
├── .github/workflows/   # CI/CD pipelines (GitHub Actions)
├── docs/                # Documentation and screenshots
├── migrations/          # Database migrations (Alembic)
├── src/                 # Backend source code (FastAPI)
│   └── app/
├── tests/               # Unit tests (Pytest)
├── webapp/              # Frontend source code (React, Vite)
│   ├── public/
│   └── src/
├── docker-compose.yml   # Docker configuration
├── Dockerfile           # Backend Dockerfile
├── pyproject.toml       # Python dependencies (uv)
└── README.md            # Documentation
```

## 🚀 Tech Stack

- **Backend:** Python 3.11, FastAPI, SQLAlchemy 2.0 (async), Alembic, PostgreSQL.
- **Frontend:** React 19, TypeScript, Vite, Zustand (state management), Axios.
- **Infrastructure:** Docker, Docker Compose, Nginx (reverse proxy & static serving), Certbot.
- **Testing & CI:** Pytest, Ruff (linter), GitHub Actions.

## ✨ Features

- [x] **Authentication:** Secure login via Telegram `initData` (HMAC) and Login Widget.
- [x] **Catalog:** Product display with variants (colors, sizes).
- [x] **Cart:** Add, update quantity, persist in `localStorage`.
- [x] **Checkout:** User data validation, order creation.
- [x] **Payments:** YooKassa integration (payment creation, webhooks).
- [x] **Profile:** Order history with status auto-refresh.
- [x] **Infrastructure:** Docker-compose environment, Nginx reverse-proxy, SSL.
- [x] **CI/CD:** GitHub Actions configured (linters, build, tests).

## ⚙️ Environment Variables

To run the application, you need to create a `.env` file in the root directory (based on `.env.example`).

| Variable | Description | Example |
| :--- | :--- | :--- |
| `POSTGRES_USER` | Database user name | `postgres` |
| `POSTGRES_PASSWORD` | Database password | `mysecretpassword` |
| `POSTGRES_DB` | Database name | `tg_shop` |
| `JWT_SECRET` | Secret key for JWT signing | `super_secret_random_string` |
| `TELEGRAM_BOT_TOKEN` | Your bot token from BotFather | `123456:ABC-DEF...` |
| `YUKASSA_SHOP_ID` | YooKassa Shop ID | `123456` |
| `YUKASSA_SECRET_KEY` | YooKassa Secret Key | `test_abc123...` |

## 🛠️ Quick Start (Docker)

1. Copy the environment variables file:
   ```bash
   cp .env.example .env
   ```
2. Build and start the containers:
   ```bash
   docker compose up --build -d
   ```
3. Access the application:
   - Frontend: `http://localhost:3000`
   - API (Swagger): `http://localhost:8000/docs`

## 💻 Local Development

### Backend
```bash
uv sync
uv run alembic upgrade head
make run
```

### Frontend
```bash
cd webapp
npm install
npm run dev
```

### Testing
```bash
uv run pytest -v
```

## 📚 Documentation

- [Project Architecture & DB Schema (RU)](docs/ARCHITECTURE.ru.md)

## 🤝 Contact

If you have any questions or suggestions, feel free to reach out:
- **Telegram:** [@TravkinVladimir](https://t.me/TravkinVladimir)
- **GitHub:** [@VladimirTravkin](https://github.com/VladimirTravkin)
- **Email:** [vpro68@mail.ru](mailto:vpro68@mail.ru)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
