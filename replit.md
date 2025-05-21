# Potential.CRM - Modern Customer Relationship Management

## Overview
Potential.CRM is a lightweight CRM platform with contact management, deal tracking, and marketing capabilities. The application is built using a modern tech stack with a React frontend and an Express backend, using Drizzle ORM for database access. The system is designed to help businesses manage their customer relationships efficiently.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture
The application follows a client-server architecture with the following key components:

1. **Frontend**: A React application that uses modern React patterns including hooks and context. The UI is built with shadcn/ui components, which are pre-styled using TailwindCSS.

2. **Backend**: An Express.js server that provides API endpoints for the frontend to consume. These endpoints handle CRUD operations for contacts, companies, deals, tasks, etc.

3. **Database**: Uses Drizzle ORM with a PostgreSQL database. The schema is defined in `shared/schema.ts` and includes tables for users, contacts, companies, deals, tasks, and other CRM-related entities.

4. **Authentication**: The application has user authentication capabilities with user accounts stored in the database.

5. **Routing**: The frontend uses Wouter for client-side routing, with routes defined in the App component.

## Key Components

### Frontend Components
1. **Pages**: Organized by feature (dashboard, contacts, companies, deals, lists, forms) with each page handling its specific functionality.

2. **UI Components**: Extensive use of shadcn/ui components (Button, Dialog, Form, etc.) for consistent styling and behavior.

3. **Layout**: A main layout component that includes a responsive sidebar and header.

4. **Data Fetching**: Uses TanStack Query (React Query) for managing server state, caching, and synchronization.

5. **Forms**: Utilizes React Hook Form with Zod validation for form handling and validation.

### Backend Components
1. **API Routes**: RESTful routes for managing CRM data organized by resource type.

2. **Storage Layer**: Abstracts database operations through a clean interface in storage.ts.

3. **Database Connection**: Configured to use Neon Serverless PostgreSQL.

4. **Schema**: Well-defined schema using Drizzle ORM with appropriate relationships between tables.

## Data Flow

1. **User Interaction**: User interacts with the UI, triggering events (e.g., submitting a form, clicking a button).

2. **API Requests**: Frontend components use React Query to make API requests to the backend.

3. **Server Processing**: Express routes handle requests, using the storage layer to interact with the database.

4. **Database Operations**: Drizzle ORM executes database operations based on the request.

5. **Response**: The server sends back JSON responses which are consumed by React Query and rendered in the UI.

6. **State Updates**: React Query updates its cache and triggers re-renders as needed.

## External Dependencies

### Frontend
- **UI Framework**: shadcn/ui with TailwindCSS
- **State Management**: TanStack Query (React Query)
- **Routing**: Wouter
- **Forms**: React Hook Form with Zod validation
- **Date Handling**: date-fns
- **Icons**: Lucide React
- **Data Tables**: TanStack Table

### Backend
- **Server**: Express.js
- **Database ORM**: Drizzle ORM
- **Database Client**: @neondatabase/serverless
- **WebSockets**: ws (for Neon database connection)

## Deployment Strategy

The application is configured to be deployed on Replit, with the following workflow:

1. **Development**: Run `npm run dev` which starts the Express server and configures Vite for frontend development.

2. **Build**: The build process uses Vite to build the frontend and esbuild to bundle the server code.

3. **Production**: The production server serves static assets from the built frontend and handles API requests.

4. **Database**: The database connection is configured using environment variables, specifically `DATABASE_URL`.

## Development Workflow

1. **Setting Up**: Ensure the environment has a PostgreSQL database configured and `DATABASE_URL` is set.

2. **Running Locally**: Use `npm run dev` to start the development server.

3. **Database Schema Changes**: Update `shared/schema.ts` and run `npm run db:push` to update the database schema.

4. **Adding Features**:
   - Add new API endpoints in `server/routes.ts`
   - Add corresponding storage methods in `server/storage.ts`
   - Create UI components and pages in the `client/src` directory
   - Update routes in `client/src/App.tsx` if needed

5. **Building for Production**: Run `npm run build` to create production-ready files.

## Project Organization

- **client/**: Contains all frontend code
  - **src/**: React components, hooks, and utilities
    - **components/**: Reusable UI components
    - **pages/**: Page components corresponding to routes
    - **hooks/**: Custom React hooks
    - **lib/**: Utility functions and configuration
    - **layout/**: Layout components like sidebar and header

- **server/**: Contains all backend code
  - **routes.ts**: API endpoint definitions
  - **db.ts**: Database connection setup
  - **storage.ts**: Data access layer
  - **index.ts**: Main server entry point

- **shared/**: Contains code shared between frontend and backend
  - **schema.ts**: Database schema definitions using Drizzle

This architecture allows for clean separation of concerns while enabling type sharing between frontend and backend through the shared directory.