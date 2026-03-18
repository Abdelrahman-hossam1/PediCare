# Clinic Management System

A robust, full-stack Next.js web application designed to manage clinic operations, including patient records, appointment scheduling, billing, and role-based access control (Admin, Doctor, Receptionist).

## 🚀 Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router format)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI/Styling**: [Tailwind CSS v4](https://tailwindcss.com/) & [Radix UI](https://www.radix-ui.com/)
- **Forms & Validation**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Database**: [PostgreSQL](https://www.postgresql.org/) (via Docker)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Authentication**: JWT-based custom auth (`jose`, `jsonwebtoken`, `bcrypt`)

## ✨ Key Features

- **Role-Based Access Control**: Secure portals tailored for Admins, Doctors, and Receptionists.
- **Patient Management**: Centralized records of patient demographics, blood types, allergies, and medical history.
- **Appointment Scheduling**: Real-time appointment tracking, allowing status updates (Scheduled, Confirmed, Completed, Canceled, No-Show).
- **Medical Records**: Doctors can document diagnoses, symptoms, notes, and treatment plans directly tied to appointments.
- **Financial & Billing Workflow**: Fully structured invoicing subsystem supporting custom invoice items, discounts, and tracking of payments (Cash, Instapay, Card, Wallet).
- **Inventory & Services**: Tracking for standardized medical services and vaccine stocks.

## 🛠️ Getting Started

### Prerequisites
Make sure you have the following installed on your local machine:
- [Node.js](https://nodejs.org/) (v18+)
- [Docker](https://www.docker.com/) & Docker Compose (for the PostgreSQL database)

### Installation & Setup

1. **Clone the repository** (if not already done) and navigate into the project directory:
   ```bash
   cd clinic-test
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up Environment Variables**:
   Create a `.env` file in the root directory (you can copy `.env.example` if it exists) and add your database configurations and JWT strings.
   *(Note: By default, Prisma connects to the Dockerized local DB setup via `DATABASE_URL`)*.

4. **Spin up the Database**:
   The project includes a Docker compose setup for PostgreSQL.
   ```bash
   npm run db:up
   ```

5. **Run Database Migrations**:
   Synchronize your Prisma schema with the Postgres database:
   ```bash
   npm run prisma:migrate
   ```

6. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   > **Pro Tip**: You can use `npm run dev:all` to spin up both the database and the Next.js development server simultaneously!

The application will now be running on `http://localhost:3000`.

## 📦 Available Scripts

- `npm run dev` - Starts the Next.js development server.
- `npm run db:up` - Starts the PostgreSQL container in the background.
- `npm run db:down` - Stops and removes the database container.
- `npm run db:reset` - Drops the database container/volumes and restarts it fresh.
- `npm run dev:all` - Runs both the database container and the dev server.
- `npm run prisma:migrate` - Applies outstanding database migrations.
- `npm run prisma:studio` - Opens a visual database browser on `http://localhost:5555`.
- `npm run build` - Builds the application for production.
- `npm run lint` - Lints the codebase using ESLint.

## 🐳 Docker Deployment
If you intend to test or deploy via Docker containers fully, see the [README.Docker.md](./README.Docker.md) for detailed instructions on building and serving the production image.

## 📄 License
This project is private and intended for specific commercial or educational deployment.