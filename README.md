# ApexDraft

A retro-themed Formula 1 fantasy draft picker that displays real-time driver stats from the OpenF1 API to help you build the ultimate team.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/dauble/f1-fantasy-generator)

ApexDraft is a Formula 1 fantasy draft assistant with a unique retro-futuristic aesthetic. It leverages the OpenF1.org API to provide users with up-to-date driver statistics, helping them make informed decisions for their fantasy league. The application features a main dashboard displaying all current drivers in visually distinct cards, a personal 'Draft Board' to manage selections, and a 90s hacker-inspired visual theme.

## ✨ Key Features

-   **Retro-Futuristic UI:** A unique interface inspired by 90s hacker terminals, featuring neon colors, pixelated fonts, and grainy textures.
-   **Real-Time Driver Stats:** Fetches and displays the latest driver statistics from the public OpenF1 API.
-   **Interactive Driver Dashboard:** A responsive grid of all current F1 drivers, with key performance indicators on each card.
-   **Personal Draft Board:** Select drivers and add them to a persistent draft board to manage your fantasy picks.
-   **Modern & Responsive:** Built with modern web technologies to be fast, intuitive, and flawless across all device sizes.

## 🚀 Technology Stack

-   **Frontend:** React, Vite, TypeScript
-   **Backend:** Cloudflare Workers, Hono
-   **Styling:** Tailwind CSS, shadcn/ui
-   **State Management:** Zustand
-   **Data Fetching:** TanStack Query (React Query)
-   **Animation:** Framer Motion
-   **Icons:** Lucide React

## 🏁 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Make sure you have the following software installed on your machine:

-   [Node.js](https://nodejs.org/) (v18 or later recommended)
-   [Bun](https://bun.sh/)
-   [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/apexdraft_f1_picker.git
    cd apexdraft_f1_picker
    ```

2.  **Install dependencies:**
    This project uses Bun for package management.
    ```bash
    bun install
    ```

## 💻 Development

To start the local development server, which includes both the Vite frontend and the Hono backend on Cloudflare Workers, run the following command:

```bash
bun dev
```

This will start the development server, typically on `http://localhost:3000`. The frontend will automatically reload on changes, and the worker backend will be available for API requests.

-   **Frontend code** is located in the `src` directory.
-   **Backend worker code** is in the `worker` directory.
-   **Shared types** between the frontend and backend are in the `shared` directory.

## ☁️ Deployment

This application is designed to be deployed to Cloudflare's global network.

1.  **Login to Wrangler:**
    If you haven't already, authenticate the Wrangler CLI with your Cloudflare account.
    ```bash
    wrangler login
    ```

2.  **Deploy the application:**
    Run the deploy script, which will build the application and deploy it to your Cloudflare account.
    ```bash
    bun deploy
    ```

Alternatively, you can deploy your own version of this project with a single click.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/dauble/f1-fantasy-generator)