# 💸 Cashflow Management System

Welcome to the **Cashflow Management System** - a comprehensive, double-entry style financial tracking monorepo engineered to manage cash disbursements, field-level expense requests, and transaction audits for multi-site construction projects.

Designed with modern UI aesthetics, responsive visual analytics, and an enterprise-grade modular backend, the application is ready for serverless scaling on **Vercel** with a serverless **PostgreSQL** backend.

---

## 🚀 Key Features

*   **👥 Multi-Role Authorization**: Rigid division of capabilities between **Owners** (system administrators) and **Supervisors** (field operatives).
*   **🏢 Site Balance Tracking**: Real-time balance updates for each construction site based on validated transactions.
*   **💸 Controlled Cash Dispatches**: Tracking cash transit from the central office with confirmation receipts and automatic discrepancy checks.
*   **📥 Field Expense Reports**: Supervisors submit digital receipts in the field; Owners approve or reject expenditures from a central hub.
*   **📖 Immutable Double-Entry Ledger**: Clear audit trails with credits, debits, and historical balance snapshots.
*   **📊 Rich Analytical Reporting**: Dynamic area, bar, and pie charts reflecting spending trends, cash flows, and category allocations.
*   **🔔 Background Notifications**: Interval polling for real-time alert updates.
*   **📁 Serverless In-Memory Media Upload**: Robust Base64 storage strategy bypassing physical disk constraints on serverless runtimes.
*   **🌓 Unified Dark & Light Mode**: Tailored premium theme selector persisting user preferences seamlessly.

---

## 🗺️ Project Structure

This project is organized as an **npm monorepo Workspace** containing both the client and server applications:

```
cashflow/
├── api/                  # Vercel serverless function entrypoint wrapper
├── client/               # React 19 / Vite / Tailwind CSS 4 frontend
│   ├── src/components/   # Shared Layout & routing controls
│   ├── src/pages/        # Owner & Supervisor interfaces
│   └── src/stores/       # Zustand auth and notification hooks
├── server/               # NestJS enterprise API engine
│   ├── prisma/           # PostgreSQL database schema & seed scripts
│   └── src/modules/      # Autcontained API modules
├── ARCHITECTURE.md       # 📖 Comprehensive Technical Reference
└── vercel.json           # Unified production deployment configuration
```

---

## 📖 Deep Technical Architecture

For an in-depth breakdown of database tables, service models, authentication decorators, routing pipelines, state management strategies, and API registries, please read the:

👉 [**Technical Architecture & Documentation (ARCHITECTURE.md)**](file:///d:/cashflow/ARCHITECTURE.md)

---

## 🛠️ Quick Start

### 1. Prerequisites
Ensure you have the following installed:
*   [Node.js](https://nodejs.org/) (Version 20.x recommended)
*   [PostgreSQL Database](https://www.postgresql.org/) (or serverless provider like Neon)

### 2. Local Installation
Clone the repository and install all dependencies in the monorepo root:
```bash
npm install
```

### 3. Setup Environment Variables
Create a `.env` file in the `/server` directory:
```env
DATABASE_URL="postgresql://<username>:<password>@<host>:<port>/<dbname>?sslmode=require"
JWT_SECRET="your-custom-jwt-secret-string"
JWT_EXPIRATION="24h"
PORT=3000
```

### 4. Database Initialization
Generate the Prisma client and push the schema structure into your database:
```bash
cd server
npx prisma generate
npx prisma db push
```

**(Optional) Seed Test Accounts**:
```bash
npm run prisma:seed
```
*Seeding creates standard Owner and Supervisor accounts to test local execution.*

### 5. Running the Application
From the root directory, launch both development servers:

*   **Backend API** (`http://localhost:3000`):
    ```bash
    cd server
    npm run start:dev
    ```
*   **Frontend Client** (`http://localhost:5173`):
    ```bash
    cd client
    npm run dev
    ```

---

## 📦 Production Deployment

This monorepo is fully optimized to deploy directly on **Vercel**:
1. Connect this repository to your Vercel Account.
2. Inject your production environment variables (`DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRATION`) in Vercel Project Settings.
3. Deploy! Vercel uses [vercel.json](file:///d:/cashflow/vercel.json) to automatically execute the build commands and spin up the serverless backend under `/api` and the static React static client.
