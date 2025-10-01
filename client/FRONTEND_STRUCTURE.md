# Frontend Folder Structure Documentation

This document describes the frontend folder structure that mirrors the backend's modular architecture.

## 📁 **Folder Structure Overview**

```
client/src/
├── core/                    # Core application logic
│   ├── config/             # Configuration files
│   ├── store/              # State management
│   ├── services/           # Core services
│   ├── hooks/              # Custom React hooks
│   ├── middleware/         # Application middleware
│   └── types/              # TypeScript type definitions
│
├── modules/                # Feature modules (mirrors backend)
│   ├── auth/               # Authentication module
│   ├── admin/              # Admin dashboard module
│   ├── ecommerce/          # E-commerce module
│   ├── elearning/          # E-learning module
│   ├── ai/                 # AI features module
│   ├── scholarships/       # Scholarships module
│   ├── visa/               # Visa management module
│   └── advertising/        # Advertising module
│
├── shared/                 # Shared components & utilities
│   ├── components/         # Reusable UI components
│   ├── hooks/              # Shared custom hooks
│   ├── utils/              # Utility functions
│   ├── types/              # Shared TypeScript types
│   └── styles/             # Shared styles
│
├── assets/                 # Static assets
│   ├── images/             # Images
│   ├── fonts/              # Font files
│   └── data/               # Static data files
│
└── tests/                  # Test files
    ├── __mocks__/          # Mock files
    ├── utils/              # Test utilities
    └── fixtures/           # Test data
```

## 🏗️ **Core Directory**

### **config/**
Contains all configuration files:
- `api.config.ts` - API endpoints and configuration
- `app.config.ts` - Application-wide settings
- `theme.config.ts` - Theme and styling configuration
- `constants.ts` - Application constants

### **store/**
Redux store configuration:
- `auth/` - Authentication state management
- `ui/` - UI state (modals, notifications, etc.)
- `app/` - Application-wide state

### **services/**
Core services:
- `api/` - API client configuration
- `auth/` - Authentication services
- `storage/` - Local/session storage utilities
- `utils/` - Core utility functions

### **hooks/**
Custom React hooks:
- `useAuth.ts` - Authentication hook
- `useApi.ts` - API call hook
- `useLocalStorage.ts` - Local storage hook
- `useDebounce.ts` - Debounce hook
- `usePermissions.ts` - Permission checking hook

### **middleware/**
Application middleware:
- `authMiddleware.ts` - Authentication middleware
- `errorMiddleware.ts` - Error handling middleware
- `loggingMiddleware.ts` - Logging middleware

### **types/**
Core TypeScript types:
- `api.types.ts` - API response types
- `auth.types.ts` - Authentication types
- `common.types.ts` - Common types used across the app

## 🧩 **Modules Directory**

Each module follows the same structure:

```
modules/[module-name]/
├── components/             # Module-specific components
│   ├── [feature]/          # Feature-specific components
│   └── index.ts           # Component exports
├── pages/                 # Page components
├── services/              # Module-specific API services
├── hooks/                 # Module-specific hooks
├── types/                 # Module-specific types
└── index.ts              # Module exports
```

### **Module Examples:**

#### **Admin Module**
```
modules/admin/
├── components/
│   ├── dashboard/         # Dashboard components
│   ├── users/            # User management components
│   ├── content/          # Content moderation components
│   ├── settings/         # System settings components
│   └── analytics/        # Analytics components
├── pages/                # Admin pages
├── services/             # Admin API services
├── hooks/                # Admin-specific hooks
└── types/                # Admin types
```

#### **E-commerce Module**
```
modules/ecommerce/
├── components/
│   ├── cars/             # Car listing components
│   ├── payments/          # Payment components
│   ├── search/            # Search components
│   └── spare-parts/       # Spare parts components
├── pages/                # E-commerce pages
├── services/             # E-commerce API services
├── hooks/                # E-commerce hooks
└── types/                # E-commerce types
```

## 🔧 **Shared Directory**

### **components/**
Reusable UI components:
- `ui/` - Basic UI components (Button, Input, Modal, etc.)
- `forms/` - Form components
- `layout/` - Layout components
- `charts/` - Chart components

### **hooks/**
Shared custom hooks:
- `useApi.ts` - Generic API hook
- `useLocalStorage.ts` - Local storage hook
- `useDebounce.ts` - Debounce hook
- `usePagination.ts` - Pagination hook
- `useForm.ts` - Form handling hook
- `usePermissions.ts` - Permission checking hook

### **utils/**
Utility functions:
- Date formatting
- Number formatting
- String manipulation
- Validation functions
- Array/Object utilities
- File handling utilities
- Color utilities
- Storage utilities

### **types/**
Shared TypeScript types:
- Common interfaces
- Generic types
- Utility types

## 🎨 **Styling Architecture**

### **Theme Configuration**
- Material-UI theme setup
- Light/Dark mode support
- Custom color palette
- Typography settings
- Component overrides

### **CSS Organization**
- Global styles
- Component-specific styles
- Utility classes
- Responsive breakpoints

## 🔄 **State Management**

### **Redux Toolkit**
- Store configuration
- Slices for different features
- RTK Query for API calls
- DevTools integration

### **State Structure**
```typescript
interface RootState {
  auth: AuthState;
  ui: UIState;
  app: AppState;
  // Module-specific states
  admin: AdminState;
  ecommerce: EcommerceState;
  elearning: ElearningState;
  // ... other modules
}
```

## 🌐 **API Integration**

### **API Client**
- Axios configuration
- Request/Response interceptors
- Error handling
- Token management

### **API Services**
Each module has its own API service:
- `authApi.ts` - Authentication endpoints
- `adminApi.ts` - Admin endpoints
- `ecommerceApi.ts` - E-commerce endpoints
- `elearningApi.ts` - E-learning endpoints

## 🧪 **Testing Structure**

### **Test Organization**
- Unit tests for components
- Integration tests for modules
- E2E tests for user flows
- Mock data and fixtures

### **Testing Tools**
- Jest for unit testing
- React Testing Library for component testing
- Playwright for E2E testing

## 📦 **Build Configuration**

### **Vite Configuration**
- Development server setup
- Build optimization
- Environment variables
- Plugin configuration

### **TypeScript Configuration**
- Strict type checking
- Path mapping
- Module resolution
- Compiler options

## 🚀 **Development Workflow**

### **Module Development**
1. Create module directory structure
2. Define types and interfaces
3. Implement API services
4. Create components and pages
5. Add custom hooks
6. Write tests
7. Export from module index

### **Component Development**
1. Create component file
2. Define props interface
3. Implement component logic
4. Add styling
5. Write tests
6. Export from appropriate index

### **API Integration**
1. Define API types
2. Create service functions
3. Implement error handling
4. Add loading states
5. Test API calls

## 🔒 **Security Considerations**

### **Authentication**
- JWT token management
- Role-based access control
- Permission checking
- Session management

### **Data Protection**
- Input validation
- XSS prevention
- CSRF protection
- Secure storage

## 📱 **Responsive Design**

### **Breakpoints**
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

### **Mobile-First Approach**
- Responsive components
- Touch-friendly interfaces
- Optimized performance
- Progressive enhancement

## 🎯 **Performance Optimization**

### **Code Splitting**
- Route-based splitting
- Component lazy loading
- Dynamic imports

### **Caching**
- API response caching
- Component memoization
- Image optimization
- Bundle optimization

## 📚 **Documentation**

### **Component Documentation**
- Props documentation
- Usage examples
- Storybook integration

### **API Documentation**
- Endpoint documentation
- Request/Response examples
- Error handling

This structure ensures:
- **Scalability** - Easy to add new modules
- **Maintainability** - Clear separation of concerns
- **Reusability** - Shared components and utilities
- **Type Safety** - Full TypeScript support
- **Testing** - Isolated module testing
- **Performance** - Optimized bundle size
