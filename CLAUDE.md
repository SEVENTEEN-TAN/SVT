# SVT Enterprise Risk Management System - Claude Project Guide

## Project Overview

SVT (Seventeen) is an enterprise-grade risk management system built with modern technology stack, featuring a Spring Boot backend and React frontend with complete user authentication, permission management, and organization management capabilities.

## Technology Stack

### Backend (SVT-Server)
- **Core Framework**: Spring Boot 3.3.2 + Java 21
- **ORM**: MyBatis-Flex 1.10.9 (modern type-safe ORM)
- **Database**: Microsoft SQL Server + Druid 1.2.24 connection pool
- **Cache**: Redis (distributed) + Caffeine 3.1.8 (local)
- **Security**: Spring Security + JWT (jjwt 0.11.5) + Argon2
- **Encryption**: AES-256-CBC + Jasypt 3.0.5 (config encryption)
- **Documentation**: Knife4j 4.5.0 (OpenAPI 3.0)
- **Logging**: Log4j2 + Disruptor 3.4.4 (async)
- **Build Tool**: Maven 3.6+

### Frontend (SVT-Web)
- **Core Framework**: React 19.1.0 + TypeScript 5.8.3
- **UI Library**: Ant Design 5.25.4
- **State Management**: Zustand 5.0.5
- **Routing**: React Router DOM 7.6.2
- **Build Tool**: Vite 6.3.5
- **HTTP Client**: Axios 1.9.0
- **Form Management**: React Hook Form 7.57.0
- **Data Fetching**: TanStack React Query 5.80.6
- **Validation**: Zod 3.25.57
- **Encryption**: crypto-js 4.2.0
- **Package Manager**: npm/yarn/pnpm

## Project Structure

```
SVT/
├── SVT-Server/                # Backend Service
│   ├── src/main/java/com/seventeen/svt/
│   │   ├── common/           # Common utilities, configs, annotations
│   │   ├── frame/            # Framework layer (AOP, cache, security)
│   │   └── modules/          # Business modules
│   ├── src/main/resources/
│   │   ├── application*.yml  # Environment configs
│   │   └── db/init/         # Database scripts
│   └── docs/                # Backend documentation
│
├── SVT-Web/                 # Frontend Application
│   ├── src/
│   │   ├── api/            # API service layer
│   │   ├── components/     # Reusable components
│   │   ├── config/         # App configuration
│   │   ├── hooks/          # Custom React hooks
│   │   ├── pages/          # Page components
│   │   ├── router/         # Route configuration
│   │   ├── stores/         # Zustand state stores
│   │   ├── types/          # TypeScript definitions
│   │   └── utils/          # Utility functions
│   └── docs/               # Frontend documentation
│
└── docs/                    # Project documentation
```

## Key Features

### Security Features
- **JWT Smart Renewal**: Automatic token renewal based on user activity
- **Single Sign-On**: Automatic invalidation of old tokens
- **AES-256 Encryption**: End-to-end API data encryption
- **Argon2 Password Hashing**: Industry-standard secure password storage
- **Audit Logging**: Complete operation tracking with sensitive data masking
- **Distributed ID Generation**: Snowflake-based ID generation with date reset

### System Management
- **Menu Management**: Full CRUD, tree structure, drag-and-drop sorting
- **User Management**: User information, status, role assignment
- **Role Management**: Role definition, permission assignment, user association
- **Organization Management**: 4-level hierarchy (HQ/Division/Branch/Group)

### Frontend Features
- **Modular Layout System**: Header, Sidebar, TabSystem as independent modules
- **Smart Tab System**: Multi-tab management, context menu, state persistence
- **Responsive Design**: Desktop and mobile support
- **Type Safety**: TypeScript strict mode with full type coverage
- **Debug Manager**: Graded logging for development/production

## Development Guidelines

### Backend Development

1. **Entity Class Example**:
```java
@DistributedId(prefix = "U")
@Column(value = "user_id", comment = "User ID")
private String userId;

@AutoFill(type = FillType.TIME, operation = OperationType.INSERT)
@Column(value = "create_time", comment = "Create Time")
private String createTime;

@SensitiveLog(strategy = SensitiveStrategy.MOBILE)
@Column(value = "phone", comment = "Phone Number")
private String phone;
```

2. **Controller Example**:
```java
@PostMapping("/create")
@Operation(summary = "Create Record")
@Audit(module = "Business Module", operation = "Create")
@RequiresPermission("module:create")
public Result<String> create(@RequestBody @Valid CreateDTO dto) {
    String id = service.create(dto);
    return Result.success("Success", id);
}
```

### Frontend Development

1. **Component Structure**:
```typescript
interface Props {
  data: DataType[];
  loading?: boolean;
  onUpdate?: (item: DataType) => void;
}

const YourComponent: React.FC<Props> = ({ data, loading, onUpdate }) => {
  // Component logic
};
```

2. **State Management**:
```typescript
export const useYourStore = create<YourState>()(
  persist(
    (set) => ({
      // State definition
    }),
    { name: 'your-storage' }
  )
);
```

## Environment Setup

### Required Environment Variables

**Backend**:
```bash
JASYPT_ENCRYPTOR_PASSWORD=your_jasypt_password
SVT_AES_KEY=your_32_char_aes_key_1234567890123456
SENSITIVE_ENABLED=true
```

**Frontend**:
```bash
VITE_API_BASE_URL=http://localhost:8080
VITE_APP_TITLE=SVT Risk Management System
VITE_AES_KEY=your_32_char_aes_key_1234567890123456
VITE_DEBUG_MODE=true
```

### Database Initialization
1. Create database: `svt_db`
2. Execute DDL script: `SVT-Server/src/main/resources/db/init/ddl.sql`
3. Execute DML script: `SVT-Server/src/main/resources/db/init/dml.sql`

### Running the Application

**Backend**:
```bash
cd SVT-Server
mvn clean install
mvn spring-boot:run
# API: http://localhost:8080/api
# Docs: http://localhost:8080/doc.html
```

**Frontend**:
```bash
cd SVT-Web
npm install
npm run dev
# App: http://localhost:5173
```

## Security Considerations

1. **Production Checklist**:
   - Change all default passwords and keys
   - Use strong password policies
   - Rotate encryption keys regularly
   - Enable HTTPS with TLS 1.2+
   - Configure proper CORS policies
   - Enable SQL injection protection
   - Set API rate limiting

2. **Required Services**:
   - Redis (for JWT cache and distributed locks)
   - SQL Server 2019+ (main database)

## API Contract

### Authentication
- **Login**: `POST /api/auth/login`
  - Request: `{ "username": "admin", "password": "password" }`
  - Response: `{ "token": "jwt.token.here", "expiryDate": "2025-01-01T00:00:00" }`

- **Logout**: `GET /api/auth/logout`

### System Management
- **Menu Tree**: `POST /api/system/menu/get-all-menu-tree`
- **Update Menu Status**: `POST /api/system/menu/update-menu-status`
- **Role Management**: Various endpoints under `/api/system/role/*`
- **User Management**: Various endpoints under `/api/system/user/*`

## Code Quality

### Linting & Testing
- **Backend**: Maven test framework, 80% coverage target
- **Frontend**: ESLint with TypeScript rules, strict mode enabled

### Commit Convention
```
feat: Add new feature
fix: Fix bug
docs: Update documentation
style: Code formatting
refactor: Code refactoring
test: Add tests
chore: Update dependencies
```

## Documentation

### Backend Documentation
- [API Encryption](./SVT-Server/docs/API-Encryption-AES.md)
- [Password Security](./SVT-Server/docs/Argon2-Password-Hashing.md)
- [Audit System](./SVT-Server/docs/Audit-Logging.md)
- [Authentication](./SVT-Server/docs/Authentication-and-Security.md)
- [Transaction Management](./SVT-Server/docs/Automated-Transaction-Management.md)
- [ID Generation](./SVT-Server/docs/Distributed-ID-Generation.md)

### Frontend Documentation
- [Component Structure](./SVT-Web/docs/Component-Structure.md)
- [State Management](./SVT-Web/docs/State-Management.md)
- [Layout System](./SVT-Web/docs/Responsive-Layout-System.md)
- [Tab System](./SVT-Web/docs/Tab-System-Design.md)
- [Development Guide](./SVT-Web/docs/开发指南.md)

## Performance Targets
- API response time < 100ms (90th percentile)
- Page load time < 1s
- Memory usage < 80%
- CPU usage < 70%

## Project Status
- **Version**: 1.0.1-SNAPSHOT
- **Status**: Production Ready ✅
- **Last Updated**: July 2025
- **Team**: SVT Development Team

---

**Note**: This is a comprehensive enterprise system with strong security features. Always ensure proper environment configuration and follow security best practices when deploying to production.