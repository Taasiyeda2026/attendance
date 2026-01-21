# Taasiyeda Attendance System (מערכת נוכחות - תעשיידע)

## Overview

This is a Hebrew-language attendance management system built as a Progressive Web App (PWA). The application provides a login-based interface for tracking attendance, designed for right-to-left (RTL) display. It uses an Express backend with Azure Logic Apps for authentication and SharePoint List synchronization.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: Static HTML with vanilla JavaScript
- **Styling**: Tailwind CSS via CDN with Heebo Hebrew font
- **PWA Support**: Service worker (sw.js) with offline caching, manifest.json for installability
- **UI Features**: Loading overlay for mobile feedback, gradient buttons, responsive design

The frontend is located in `/public/index.html` as a self-contained static file. The app uses RTL direction throughout for Hebrew language support.

### Key Files
- `public/index.html` - Main application (login, dashboard, forms)
- `public/manifest.json` - PWA manifest
- `public/sw.js` - Service worker for offline support
- `public/logo.png` - Application logo

### Backend Architecture
- **Framework**: Express 5 with TypeScript
- **Runtime**: Node.js with tsx for TypeScript execution
- **API Pattern**: REST endpoints proxying to Azure Logic Apps
- **Development**: Vite middleware integration for HMR during development

Key endpoints:
- `POST /api/auth` - Authentication proxy to Azure Logic Apps
- `POST /api/submit` - Form submission proxy to Azure Logic Apps
- `POST /api/sync` - Sync records from SharePoint (action=sync)
- `GET /api/chat/health` - Health check endpoint

### Data Storage
- **ORM**: Drizzle ORM with PostgreSQL adapter
- **Schema Location**: `shared/schema.ts`
- **Current Schema**: Basic users table with id, username, password
- **In-Memory Fallback**: MemStorage class in `server/storage.ts` for development

Note: The application is configured for PostgreSQL but the actual authentication is delegated to Azure Logic Apps. The database schema exists but may be extended for local data needs.

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