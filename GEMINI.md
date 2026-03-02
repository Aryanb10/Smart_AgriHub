# Agri-Insight-Hub (AgriAI)

A full-stack Agriculture AI application designed to provide data-driven insights for farmers, including crop prediction, fertilizer recommendation, plant disease detection, and smart irrigation scheduling.

## Project Overview

- **Frontend**: React (TypeScript) with Vite, Tailwind CSS, and Shadcn UI components.
- **Backend**: Node.js with Express.
- **Database**: PostgreSQL managed via Drizzle ORM.
- **AI/ML**: Python-based machine learning models (Scikit-Learn, Pandas, NumPy) invoked via child processes.
- **Authentication**: Replit Auth integration with local development fallback.
- **Architecture**:
  - `client/`: Frontend source code.
  - `server/`: Backend source code, including ML script runners and API routes.
  - `server/ml/`: Python scripts for model prediction and training.
  - `shared/`: Shared TypeScript types, Zod schemas, and database definitions.

## Building and Running

### Prerequisites
- Node.js (v20+ recommended)
- Python 3.10+
- PostgreSQL database

### Environment Variables
- `DATABASE_URL`: Connection string for the PostgreSQL database.
- `REPL_ID`: (Optional) Used for Replit Auth integration.
- `PORT`: (Optional) Defaults to `5000`.

### Setup Commands
1. **Install JavaScript dependencies**:
   ```bash
   npm install
   ```
2. **Install Python dependencies**:
   ```bash
   pip install -r requirements.txt
   ```
3. **Setup Database**:
   ```bash
   npm run db:push
   ```

### Development
Start the development server (runs both frontend and backend):
```bash
npm run dev
```

### Production
Build and start the production application:
```bash
npm run build
npm start
```

## Development Conventions

### ML Integration
- Python scripts in `server/ml/` are executed as standalone processes.
- Input data is passed as a Base64 encoded JSON string via command-line arguments.
- Scripts must output a JSON object to `stdout` for the Node.js backend to parse.

### Database & Types
- All database schemas are defined in `shared/schema.ts` using Drizzle ORM.
- Use `npm run db:push` to synchronize schema changes with the database.
- Shared Zod schemas are used for request validation on both frontend and backend.

### UI Components
- Components are built using Shadcn UI (Radix UI primitives).
- Use `client/src/components/ui/` for base components and `client/src/components/` for feature-specific components.
- Styling is strictly Tailwind CSS.

### API Routes
- Routes are registered in `server/routes.ts`.
- API contracts are defined in `shared/routes.ts` to ensure type safety across the stack.
