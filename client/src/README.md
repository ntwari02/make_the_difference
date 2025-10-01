# Client Side Folder Structure

This directory contains the organized folder structure for the React/TypeScript client application.

## Folder Organization

### `/components`
Organized by feature modules:
- `admin/` - Admin panel components
- `advertising/` - Advertising management components
- `ai/` - AI-related components (chatbot, analytics, personalization, pricing)
- `auth/` - Authentication components
- `competitive-features/` - Competitive features components
- `dealer/` - Dealer management components
- `ecommerce/` - E-commerce components (cars, payments, recommendations, search, spare-parts)
- `elearning/` - E-learning components (certificates, courses, lessons, modules, online-classes, organizations, quiz)
- `moderator/` - Moderation components
- `scholarships/` - Scholarship management components
- `shared/` - Shared components (common, forms, layout, navigation, ui)
- `visa/` - Visa management components

### `/pages`
Page components organized by feature modules (mirrors component structure)

### `/services`
API service files organized by feature modules

### `/store`
State management (Redux/Zustand)

### `/types`
TypeScript type definitions

### `/utils`
Utility functions and helpers

### `/hooks`
Custom React hooks

### `/context`
React context providers

### `/constants`
Application constants

### `/assets`
Static assets (images, icons, etc.)

## Configuration Files
- `package.json` - Dependencies and scripts
- `tsconfig.*.json` - TypeScript configuration
- `vite.config.ts` - Vite build configuration
- `eslint.config.js` - ESLint configuration
- `index.html` - HTML template

## Next Steps
When ready to start coding:
1. Create main entry files (`main.tsx`, `App.tsx`)
2. Add CSS/styling files
3. Implement components in their respective folders
4. Set up routing and state management
5. Add API service implementations
