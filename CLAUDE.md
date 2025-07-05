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
│   │   ├── components/Layout/           # Modular layout system
│   │   │   ├── modules/Header/          # Header with breadcrumb, user dropdown
│   │   │   ├── modules/Sidebar/         # Sidebar with menu tree
│   │   │   └── modules/TabSystem/       # Multi-tab management
│   │   ├── pages/                       # Page components
│   │   │   ├── Auth/                    # Login page
│   │   │   ├── System/                  # System management pages
│   │   │   └── Home/                    # Dashboard
│   │   ├── stores/                      # Zustand state management
│   │   ├── utils/                       # Crypto, token, session managers
│   │   └── router/                      # Protected routes
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
- **Responsive Component System**: Ant Design components with custom hooks and utilities
- **Session Management**: JWT token management with automatic renewal and security monitoring

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