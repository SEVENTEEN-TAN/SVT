# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SVT (Seventeen) is an enterprise-grade risk management system built with Spring Boot 3.3.2 (Java 21) backend and React 19.1.0 (TypeScript) frontend. It features JWT authentication, AES-256 encryption, Redis caching, and comprehensive permission management.

## Essential Commands

### Backend (SVT-Server)
```bash
# Development
cd SVT-Server
mvn clean install                    # Build and run tests
mvn spring-boot:run                  # Start development server (http://localhost:8080)

# Testing
mvn test                             # Run unit tests
mvn test -Dtest=ClassName           # Run specific test class

# Packaging
mvn clean package -Dmaven.test.skip=true  # Build without tests
```

### Frontend (SVT-Web)
```bash
# Development
cd SVT-Web
npm install                          # Install dependencies
npm run dev                          # Start development server (http://localhost:5173)
npm run dev:uat                      # Start UAT mode
npm run dev:prod                     # Start production mode

# Building
npm run build                        # Build for production
npm run build:dev                    # Build for development
npm run build:uat                    # Build for UAT

# Code Quality
npm run lint                         # Run ESLint
npm run preview                      # Preview production build
```

### Database Setup
```bash
# 1. Create database named 'svt_db'
# 2. Execute DDL: SVT-Server/src/main/resources/db/init/ddl.sql
# 3. Execute DML: SVT-Server/src/main/resources/db/init/dml.sql
```

## Architecture Overview

### Core Technology Stack
**Backend**: Spring Boot 3.3.2 + Java 21 + MyBatis-Flex 1.10.9 + SQL Server + Redis  
**Frontend**: React 19.1.0 + TypeScript 5.8.3 + Ant Design 5.25.4 + Zustand 5.0.5 + Vite 6.3.5

### Frontend Architecture Deep Dive

#### **Modern Technology Stack**
- **React 19.1.0** - Latest React with concurrent features
- **TypeScript 5.8.3** - Strict type checking, 100% type coverage
- **Vite 6.3.5** - Lightning-fast build tool and HMR
- **Ant Design 5.25.4** - Enterprise-class UI components
- **Zustand 5.0.5** - Lightweight state management without boilerplate
- **React Router DOM 7.6.2** - Declarative routing with nested routes
- **TanStack React Query 5.80.6** - Server state management and caching
- **UnoCSS** - Atomic CSS framework for utility-first styling

#### **State Management Architecture**
```typescript
// Separated Store Design
├── authStore.ts      # Pure authentication (token, login state, expiry)
├── userStore.ts      # User info, org-role selection, session state  
└── useAuth.ts        # Composite hook coordinating store interactions
```

**Key Features:**
- **Persistence Strategy**: Native localStorage with encryption migration
- **State Recovery**: Automatic state restoration after page refresh
- **Security**: Token management with smart renewal and validation
- **Type Safety**: Complete TypeScript interfaces with Zod validation

#### **Layout System Design**
```typescript
// Modular Layout Components
├── LayoutProvider.tsx     # Unified state management and context
├── LayoutStructure.tsx    # Pure presentation component
└── modules/
    ├── Header/           # Breadcrumb, user dropdown, notifications
    ├── Sidebar/          # Logo, menu tree with permissions
    └── TabSystem/        # Multi-tab with context menu and persistence
```

**Design Principles:**
- **Separation of Concerns**: Each module manages its own state via hooks
- **Context Pattern**: Shared layout state via React Context
- **Responsive Design**: Automatic sidebar collapse, mobile adaptation
- **Performance**: Memoized styles, optimized re-renders

#### **Smart Tab System**
- **Multi-tab Management**: Open, close, switch between pages
- **Context Menu**: Close left/right/other tabs functionality  
- **State Persistence**: Tab list and active state saved to localStorage
- **Page Refresh**: Individual tab refresh without affecting others
- **Route Integration**: Automatic tab creation from menu navigation

#### **Dynamic Routing System**
```typescript
// Dynamic Page Loading Flow
URL: /System/Menu
├── 1. Matches wildcard route (*) → DynamicPage
├── 2. Checks user permissions via menu tree
├── 3. Converts path: /System/Menu → ../../pages/System/Menu/index.tsx
├── 4. Loads component via import.meta.glob
└── 5. Renders with error boundary protection
```

**Security Features:**
- **Four-Layer Protection**: Auth → Role Selection → Status Validation → Permission Check
- **Strict Matching**: Case-sensitive route permissions
- **Permission Validation**: Based on user's menu tree from backend
- **Error Boundaries**: Graceful handling of component loading failures

## Project Structure

```
SVT/
├── SVT-Server/                          # Spring Boot Backend
│   ├── src/main/java/com/seventeen/svt/
│   │   ├── common/                      # Global configs, annotations, utilities
│   │   │   ├── annotation/              # Custom annotations (@Audit, @RequiresPermission, etc.)
│   │   │   ├── config/                  # AES, Redis, Security, Transaction configs
│   │   │   ├── filter/                  # AES crypto filter, request wrapper
│   │   │   └── util/                    # Encryption, Redis, JWT utilities
│   │   ├── frame/                       # Framework layer (AOP, cache, security)
│   │   │   ├── aspect/                  # AOP aspects (audit, permission, transaction)
│   │   │   ├── cache/                   # Cache management (Redis + Caffeine)
│   │   │   ├── security/                # JWT authentication, Spring Security
│   │   │   └── dbkey/                   # Distributed ID generator
│   │   └── modules/system/              # System management module
│   │       ├── controller/              # REST controllers
│   │       ├── entity/                  # JPA entities with annotations
│   │       ├── service/                 # Business logic
│   │       └── dto/                     # Data transfer objects
│   └── src/main/resources/
│       ├── application*.yml             # Multi-environment configurations
│       └── db/init/                     # Database DDL/DML scripts
│
├── SVT-Web/                             # React Frontend
│   ├── src/
│   │   ├── api/                         # API service layer with encryption
│   │   │   ├── auth.ts                  # Authentication APIs
│   │   │   └── system/                  # System module APIs (menu, role, user)
│   │   ├── components/
│   │   │   ├── Layout/                  # Modular layout system
│   │   │   │   ├── core/                # LayoutProvider, LayoutStructure
│   │   │   │   ├── modules/             # Independent layout modules
│   │   │   │   │   ├── Header/          # Breadcrumb, user dropdown, hooks
│   │   │   │   │   ├── Sidebar/         # Logo, menu tree, hooks
│   │   │   │   │   └── TabSystem/       # Multi-tab, context menu, hooks
│   │   │   │   └── shared/              # Common layout types and utils
│   │   │   ├── DynamicPage/             # Dynamic page loader with error boundary
│   │   │   ├── Common/                  # Reusable components
│   │   │   └── Loading/                 # Loading states and spinners
│   │   ├── pages/                       # Page components by business domain
│   │   │   ├── Auth/                    # Login page with encryption
│   │   │   ├── System/                  # System management (Menu, Role, User)
│   │   │   ├── Business/                # Business modules
│   │   │   ├── Home/                    # Dashboard and homepage
│   │   │   └── Error/                   # Error pages (404, etc)
│   │   ├── stores/                      # Zustand state management
│   │   │   ├── authStore.ts             # Authentication state
│   │   │   ├── userStore.ts             # User info and session
│   │   │   └── useAuth.ts               # Composite authentication hook
│   │   ├── hooks/                       # Custom React hooks
│   │   │   ├── useUserStatus.ts         # User status validation
│   │   │   ├── useMobile.ts             # Mobile responsiveness
│   │   │   └── useTable*.ts             # Table utilities
│   │   ├── utils/                       # Utility functions
│   │   │   ├── tokenManager.ts          # JWT token management
│   │   │   ├── crypto.ts                # AES encryption/decryption
│   │   │   ├── debugManager.ts          # Debug logging system
│   │   │   ├── sessionManager.ts        # Session state management
│   │   │   ├── messageManager.ts        # Global message handling
│   │   │   └── request.ts               # HTTP client with encryption
│   │   ├── router/                      # Routing configuration
│   │   │   ├── index.tsx                # Main router setup
│   │   │   └── ProtectedRoute.tsx       # Four-layer route protection
│   │   ├── types/                       # TypeScript type definitions
│   │   │   ├── user.ts                  # User and authentication types
│   │   │   ├── api.ts                   # API response types
│   │   │   └── session.ts               # Session management types
│   │   └── styles/                      # Theme and styling
│   │       ├── theme.ts                 # Ant Design theme configuration
│   │       └── *.css                    # Component-specific styles
│   └── docs/                            # Frontend documentation
```

## Key Architecture Patterns

### Backend Patterns
- **Annotation-Driven Development**: Custom annotations for audit logging, permissions, auto-filling, distributed IDs
- **AOP Cross-Cutting Concerns**: Aspect-oriented programming for audit, transaction, and permission handling
- **Multi-Level Caching**: Redis (distributed) + Caffeine (local) with automatic cache management
- **Layered Security**: AES-256 API encryption + JWT authentication + Argon2 password hashing
- **Distributed ID Generation**: Snowflake-based IDs with prefix support and date reset capability

### Frontend Patterns
- **Modular Layout Architecture**: Independent Header, Sidebar, TabSystem modules with shared context
- **Smart State Management**: Zustand stores with persistence, encryption, and automatic cleanup  
- **Type-Safe API Layer**: TypeScript interfaces with Zod validation and automatic encryption
- **Dynamic Component Loading**: Route-based component loading with import.meta.glob and error boundaries
- **Four-Layer Security**: Auth → Role Selection → Status Validation → Permission Check
- **Smart Tab Management**: Multi-tab system with context menus and persistent state
- **Responsive Design**: Mobile-first approach with automatic layout adaptation
- **Performance Optimization**: Lazy loading, memoization, and optimized re-renders

#### **Frontend Development Patterns**

**Component Structure:**
```typescript
// Modular component design with TypeScript
interface ComponentProps {
  data: DataType[];
  loading?: boolean;
  onAction?: (item: DataType) => void;
}

const Component: React.FC<ComponentProps> = ({ data, loading, onAction }) => {
  const { state, actions } = useCustomHook();
  
  return (
    <div className="component-container">
      {/* Component JSX with proper typing */}
    </div>
  );
};
```

**Hook-Based State Management:**
```typescript
// Custom hooks for component logic separation
const useComponentLogic = () => {
  const [state, setState] = useState<StateType>(initialState);
  
  const handleAction = useCallback((data: DataType) => {
    // Business logic
  }, []);
  
  return { state, handleAction };
};
```

**Store Integration Pattern:**
```typescript
// Zustand store with TypeScript and persistence
interface StoreState {
  data: DataType[];
  loading: boolean;
  actions: {
    fetchData: () => Promise<void>;
    updateData: (item: DataType) => void;
  };
}

export const useDataStore = create<StoreState>()(
  persist(
    (set, get) => ({
      data: [],
      loading: false,
      actions: {
        fetchData: async () => {
          set({ loading: true });
          try {
            const data = await api.fetchData();
            set({ data, loading: false });
          } catch (error) {
            set({ loading: false });
            throw error;
          }
        },
        updateData: (item) => {
          const { data } = get();
          set({ data: data.map(d => d.id === item.id ? item : d) });
        }
      }
    }),
    { name: 'data-storage' }
  )
);
```

## Development Guidelines

### Backend Entity Pattern
```java
@DistributedId(prefix = "U")                                    // Auto-generate distributed ID
@Column(value = "user_id", comment = "User ID")
private String userId;

@AutoFill(type = FillType.TIME, operation = OperationType.INSERT)  // Auto-fill timestamp
@Column(value = "create_time", comment = "Create Time")
private String createTime;

@SensitiveLog(strategy = SensitiveStrategy.MOBILE)              // Sensitive data masking
@Column(value = "phone", comment = "Phone Number")
private String phone;
```

### Backend Controller Pattern
```java
@PostMapping("/create")
@Operation(summary = "Create Record")
@Audit(module = "Business Module", operation = "Create")       // Audit logging
@RequiresPermission("module:create")                           // Permission check
@AutoTransaction(type = TransactionType.REQUIRED)              // Auto transaction
public Result<String> create(@RequestBody @Valid CreateDTO dto) {
    String id = service.create(dto);
    return Result.success("Success", id);
}
```

### Frontend Component Pattern
```typescript
interface Props {
  data: DataType[];
  loading?: boolean;
  onUpdate?: (item: DataType) => void;
}

const YourComponent: React.FC<Props> = ({ data, loading, onUpdate }) => {
  // Component logic with hooks
};
```

### Frontend State Management Pattern
```typescript
export const useYourStore = create<YourState>()(
  persist(
    (set) => ({
      // State definition with persistence
    }),
    { name: 'your-storage' }
  )
);
```

## Environment Setup

### Required Environment Variables
```bash
# Backend
JASYPT_ENCRYPTOR_PASSWORD=your_jasypt_password           # Config encryption
SVT_AES_KEY=your_32_char_aes_key_1234567890123456       # API encryption (32 chars)
SENSITIVE_ENABLED=true                                   # Enable data masking

# Frontend
VITE_API_BASE_URL=http://localhost:8080                 # Backend API URL
VITE_AES_KEY=your_32_char_aes_key_1234567890123456     # Must match backend key
VITE_DEBUG_MODE=true                                    # Enable debug logging
```

### Important Files and Locations
- **API Documentation**: http://localhost:8080/doc.html (Knife4j interface)
- **Configuration Files**: `SVT-Server/src/main/resources/application*.yml`
- **Database Scripts**: `SVT-Server/src/main/resources/db/init/`
- **Custom Annotations**: `SVT-Server/src/main/java/com/seventeen/svt/common/annotation/`
- **Security Configuration**: `SVT-Server/src/main/java/com/seventeen/svt/frame/security/`
- **Frontend Stores**: `SVT-Web/src/stores/`
- **Layout Components**: `SVT-Web/src/components/Layout/modules/`

## API Contract

### Key Authentication Endpoints
- **Login**: `POST /api/auth/login` - Returns JWT token with expiry
- **Logout**: `GET /api/auth/logout` - Invalidates current session
- **Token Refresh**: Automatic via smart renewal mechanism

### System Management APIs
- **Menu Tree**: `POST /api/system/menu/get-all-menu-tree` - Get complete menu structure
- **Menu Status**: `POST /api/system/menu/update-menu-status` - Enable/disable menus
- **Role/User Management**: Various endpoints under `/api/system/role/*` and `/api/system/user/*`

## Common Development Tasks

### Adding New Business Modules
1. Create entity classes with appropriate annotations (`@DistributedId`, `@AutoFill`, `@SensitiveLog`)
2. Implement controllers with security annotations (`@Audit`, `@RequiresPermission`)
3. Add corresponding frontend pages in the appropriate modules directory
4. Register routes in the router configuration
5. Update menu configuration in the database

### Working with the Security System
- All API endpoints are automatically encrypted/decrypted via `AESCryptoFilter`
- JWT tokens are managed by `JwtCacheUtils` with Redis backing
- Permissions are checked via `@RequiresPermission` annotation
- Audit logs are automatically generated via `@Audit` annotation

### Frontend Layout System
- Use `LayoutProvider` context for accessing layout state
- Header, Sidebar, and TabSystem are independent modules with their own hooks
- Tab state is automatically persisted and managed
- All pages should use the `BasicLayout` wrapper

### Frontend Development Best Practices
- **TypeScript First**: All components and hooks must have proper TypeScript interfaces
- **Separation of Concerns**: Use custom hooks to separate business logic from UI components
- **Performance**: Leverage useMemo, useCallback, and React.memo for optimization
- **Error Handling**: Implement error boundaries for robust component error handling
- **Accessibility**: Follow WCAG guidelines and use semantic HTML elements
- **Testing**: Write unit tests for custom hooks and integration tests for complex components

### Frontend Security Considerations
- **Data Encryption**: All API requests/responses are automatically encrypted via AES-256
- **Token Management**: JWT tokens are securely stored and automatically renewed
- **Permission Validation**: Route access is validated against user's menu permissions
- **XSS Prevention**: All user inputs are properly sanitized and validated
- **CSRF Protection**: Implemented via JWT token validation and same-origin policies

### Frontend Performance Optimization
- **Code Splitting**: Routes and components are lazy-loaded using React.lazy
- **Bundle Optimization**: Vendor libraries are split into separate chunks
- **Caching Strategy**: API responses cached via TanStack Query with smart invalidation
- **Image Optimization**: Images are optimized and served with proper formats
- **Tree Shaking**: Unused code is automatically removed during build process

## Debugging and Troubleshooting

### Backend Issues
- Check application logs in `logs/` directory
- Verify Redis connection and JWT cache status
- Check database connection pool status via Druid monitoring
- Review audit logs for permission-related issues

### Frontend Issues
- Use browser DevTools for debugging API encryption/decryption
- Check Zustand store state via Redux DevTools extension
- Monitor tab system state persistence in localStorage
- Review debug manager output for detailed logging

## Dependencies and Services
- **Required**: Redis (JWT cache, distributed locks), SQL Server 2019+
- **Optional**: External API services for notifications, file storage