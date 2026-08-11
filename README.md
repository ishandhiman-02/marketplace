# Imagine.bo - Full Stack Application

Welcome to the **Imagine.bo** frontend repository! This project is a modern, responsive, and aesthetically rich web application built to deliver a seamless farm-to-table restaurant and events experience. It serves as the client-side of the broader Imagine.bo full-stack ecosystem.

## 🌟 Overview

Imagine.bo provides an elegant interface for users to:
- View seasonal menus and farm stories.
- Book reservations seamlessly.
- Explore upcoming events and farm experiences.
- Browse rich image galleries of farm-to-table offerings.

## Features

- **Modern UI/UX:** Smooth animations and parallax botanical backgrounds using Framer Motion.
- **Responsive Design:** Fully mobile-responsive interface utilizing Tailwind CSS.
- **Dynamic Content:** Showcasing seasonal dishes, upcoming events, and farm details.
- **Reservation System:** Integrated frontend forms with built-in validation for easy table booking.
- **Performance Optimized:** Fast builds and hot-module replacement powered by Vite.

## Tech Stack

**Frontend Framework & Tooling:**
- [React 19](https://react.dev/) - UI Library
- [Tailwind CSS v4](https://tailwindcss.com/) - Utility-first CSS Framework
- [React Router](https://reactrouter.com/) - Client-side Routing

**UI Components & Animations:**
- [Framer Motion](https://www.framer.com/motion/) - Animation Library
- [Lucide React](https://lucide.dev/) & [Heroicons](https://heroicons.com/) - Iconography

**Utilities & Testing:**
- [Axios](https://axios-http.com/) - HTTP Client
- [Date-fns](https://date-fns.org/) - Date Formatting
- [ESLint](https://eslint.org/) - Code Linting

## Getting Started

### Prerequisites

Ensure you have the following installed on your local machine:
- **Node.js** (v18 or higher)
- **npm** (v9 or higher)

### Installation

1. Clone the repository and navigate into the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Running Locally

This is a monorepo: a React frontend and a Go backend. Both need to be running —
Vite proxies `/api` to the Go server, so the frontend alone has no data.

```bash
# terminal 1 — API on :8080 (see backend/.env.example for the variables)
cd backend && go run ./cmd/migration   # creates the schema, seeds, prints the first admin password
cd backend && go run ./cmd/server

# terminal 2 — app on :8084
cd frontend && npm install && npm run dev
```

The application will be available at `http://localhost:8084`.

### Deploying

The Go binary serves the built SPA from `//go:embed all:dist`, reading
`backend/internal/dist/` **out of the git checkout** — the frontend is never built
at deploy time. So rebuilding and committing it is part of every frontend change:

```bash
cd frontend && npm run build
rm -rf ../backend/internal/dist && cp -r dist ../backend/internal/dist
cd .. && git add -A backend/internal/dist
```

Skip this and the deploy keeps serving the previous build.

## 📜 Available Scripts

- `npm run dev`: Starts the local development server.
- `npm run build`: Builds the application for production.
- `npm run preview`: Locally preview the production build.
- `npm run lint`: Runs ESLint to identify code issues.
- `npm run lint:fix`: Automatically fixes linting issues (including unused imports/variables).
- `npm run check-logic`: Runs TypeScript compiler logic checks.

## 📁 Project Structure

```text
frontend/
├── public/               # Static assets (SVGs, favicon)
├── src/                  # Application source code
│   ├── components/       # Reusable React components (Header, HeroSection, etc.)
│   ├── lib/api.ts        # The one HTTP client. `BASE` is a plain literal on purpose.
│   ├── services/         # One module per entity, wrapping lib/api
│   ├── pages/            # Page-level components (LandingPage, admin screens)
│   ├── App.jsx           # Root application component
│   ├── index.css         # Global Tailwind CSS styles
│   └── main.jsx          # Application entry point
├── eslint.config.js      # ESLint configuration
├── vite.config.js        # Vite configuration (proxies /api to :8080)
└── package.json          # Project dependencies and scripts

backend/                  # Go API + embedded SPA (module imagine_backend)
├── cmd/migration/        # Creates the schema, migrates, seeds — runs before the server
├── cmd/server/           # HTTP entrypoint
├── internal/
│   ├── dist/             # The built SPA, git-TRACKED and embedded in the binary
│   ├── handler/          # HTTP layer  ─┐
│   ├── services/         # business    ─┤ handler → services → repositary → db/model
│   ├── repositary/       # GORM queries ┘ (only this layer may import internal/db)
│   ├── dto/ model/       # request/response shapes, GORM structs
│   └── middleware/       # CORS, auth, rate limiting, error handling
├── Dockerfile            # Builds BOTH binaries — the deploy pins this, not railpack
└── start.sh              # migration, then exec the server
```

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---
*Powered by Imagine.bo*
