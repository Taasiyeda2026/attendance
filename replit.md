# Taasiyeda Attendance System (מערכת נוכחות - תעשיידע)

## Overview

This is a Hebrew-language attendance management system built as a Progressive Web App (PWA). The application provides a login-based interface for tracking attendance, designed for right-to-left (RTL) display. It follows a full-stack architecture with a React frontend and Express backend, using Azure Logic Apps as an external authentication and data processing service.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite with HMR support
- **Styling**: Tailwind CSS with Heebo Hebrew font
- **UI Components**: Radix UI primitives for accessible components
- **State Management**: React Query for server state
- **PWA Support**: Service worker (sw.js) with offline caching, manifest.json for installability

The frontend is located in `/client` with the entry point at `client/src/main.tsx`. The app uses RTL direction throughout for Hebrew language support.

### Backend Architecture
- **Framework**: Express 5 with TypeScript
- **Runtime**: Node.js with tsx for TypeScript execution
- **API Pattern**: REST endpoints proxying to Azure Logic Apps
- **Development**: Vite middleware integration for HMR during development

Key endpoints:
- `POST /api/auth` - Authentication proxy to Azure Logic Apps
- `POST /api/submit` - Form submission proxy to Azure Logic Apps
- `GET /api/chat/health` - Health check endpoint

### Data Storage
- **Primary Storage**: SharePoint Lists via Azure Logic Apps (no localStorage)
- **Data Flow**: All records are sent directly to SharePoint and loaded on each login
- **Sync Behavior**: When logging in, data is fetched from SharePoint and replaces local state
- **Cross-Device Sync**: Data is synchronized across all devices via SharePoint

Note: The application does NOT use localStorage for attendance records. All data is stored in SharePoint Lists to ensure synchronization between mobile and desktop devices.

### Build System
- Development: `npm run dev` runs tsx with Vite middleware
- Production: `npm run build` compiles to `dist/` directory
- Database: `npm run db:push` for Drizzle schema migrations

## External Dependencies

### Azure Logic Apps Integration
The core authentication and data processing is handled by an Azure Logic App workflow:
- URL configured in `server/routes.ts` as `LOGIC_APP_URL`
- Handles login authentication and form submissions
- Backend acts as a proxy, forwarding requests and responses

### Third-Party Services
- **Fonts**: Google Fonts (Heebo) for Hebrew typography
- **Icons**: Font Awesome 6.4.0 via CDN

### Key NPM Dependencies
- `drizzle-orm` + `drizzle-zod` - Database ORM and validation
- `@tanstack/react-query` - Server state management
- `@radix-ui/*` - Accessible UI component primitives
- `connect-pg-simple` - PostgreSQL session store (available if needed)
- `express` v5 - Web server framework

### Environment Variables Required
- `DATABASE_URL` - PostgreSQL connection string (required for database operations)