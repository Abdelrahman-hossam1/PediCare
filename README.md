# PediCare - Modern Clinic Management System

PediCare is a professional, full-stack clinic management platform built with **Next.js 15**, **TypeScript**, and **Prisma**. It provides a seamless experience for managing patients, appointments, medical records, and financial workflows with a focus on ease of use and data integrity.

---

## 🌟 Key Features

### 🔐 Multi-Role Access Control
Tailored dashboards and permissions for different clinic staff:
- **Admin**: Full system control, service/vaccine management, and deep visibility.
- **Doctor**: Streamlined patient history, real-time diagnosis tracking, and treatment planning.
- **Receptionist**: Efficient patient registration, quick appointment booking, and instant invoicing.

### 📋 Patient & Medical Records (EMR)
- **Centralized Registry**: Searchable database of patient demographics, blood types, and allergies.
- **Treatment History**: Chronological view of symptoms, diagnoses, and previous consults.
- **Digital Records**: Paperless documentation tied directly to patient encounters.

### 🗓️ Smart Scheduling
- **Real-time Tracking**: Manage appointment statuses from `SCHEDULED` to `COMPLETED` or `NO_SHOW`.
- **Conflict Detection**: Prevent double-bookings through database-level constraints.

### 💰 Financial & Billing System
- **Structured Invoicing**: Automated calculation of services and vaccines.
- **Customizable Items**: Support for discounts, custom prices, and multiple line items.
- **Payment Tracking**: Track payments via Cash, Instapay, Card, or Digital Wallets.

### 🛡️ Automated Data Cleanup (Session Rollback)
A unique feature designed for clean development and testing:
- **Change Tracking**: Every database action (CREATE, UPDATE, DELETE) is recorded within a user session.
- **Auto-Revert**: Optional automatic rollback of session data on logout or expiration to keep the database tidy.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/) & [Lucide Icons](https://lucide.dev/)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Validation**: [Zod](https://zod.dev/) & [React Hook Form](https://react-hook-form.com/)
- **Auth**: Custom Session-Based Auth with `jose` and `bcrypt`.

---

## 📁 Project Structure

```text
├── app/                  # Next.js App Router (Pages, API, Layouts)
│   ├── admin/           # Admin-only portals
│   ├── appointments/    # Shared scheduling modules
│   ├── doctor/          # Medical professional interfaces
│   └── receptionist/    # Front-desk operations
├── components/           # Reusable UI components (shadcn/ui style)
├── lib/                  # Shared utilities (DB, Auth, CurrentUser)
├── prisma/               # Database schema and migration files
├── public/               # Static assets (Logos, Icons)
└── assets/               # Brand raw materials
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18.17+
- Docker & Docker Compose (for Postgres)

### Installation

1. **Clone & Install**:
   ```bash
   git clone <repository-url>
   cd clinic-test
   npm install
   ```

2. **Environment Variables**:
   Create a `.env` file in the root:
   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/pedicare"
   JWT_SECRET="your-super-secret-key"
   SESSION_DURATION="3600" # in seconds
   ```

3. **Database Setup**:
   ```bash
   # Spin up PostgreSQL
   npm run db:up

   # Apply migrations
   npm run prisma:migrate
   ```

4. **Run Development Server**:
   ```bash
   # Start DB and Next.js together
   npm run dev:all
   ```

---

## 📦 Available Scripts

| Script | Detail |
| :--- | :--- |
| `npm run dev` | Start Next.js development server |
| `npm run dev:all` | Start Docker PostgreSQL + Next.js together |
| `npm run db:up` | Start the Postgres container |
| `npm run db:down` | Stop the Postgres container |
| `npm run prisma:migrate` | Sync schema and update client |
| `npm run prisma:studio` | GUI for browsing your database |
| `npm run build` | Production build |

---

## 📄 License
This project is private and intended for specific deployment.

---
*Developed by Abdelrahman Hossam*