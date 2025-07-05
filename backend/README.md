# LockTrack Pro Spring Boot Backend

A comprehensive Spring Boot backend for the LockTrack Pro multi-vendor lock tracking system.

## 🚀 Features

- **Multi-Vendor Architecture** - Complete vendor isolation with system-level administration
- **JWT Authentication** - Secure token-based authentication with role-based access
- **Auto Database Initialization** - Automatically creates database schema and demo data on startup
- **RESTful APIs** - Complete CRUD operations for all entities
- **Security** - Spring Security with CORS configuration and vendor-scoped data access
- **Data Validation** - Input validation and comprehensive error handling

## 🏗️ Architecture

### Technology Stack
- **Spring Boot 3.2.1** - Main framework
- **Spring Security** - Authentication and authorization
- **Spring Data JPA** - Database operations
- **H2 Database** - Development database (auto-creates on startup)
- **PostgreSQL** - Production database
- **JWT** - Token-based authentication
- **Maven** - Dependency management

### Multi-Vendor Data Model
```
System Level (Vendor ID: 1)
├── System Super Admins
└── Platform Management

Vendor Level (Vendor ID: 2, 3, 4...)
├── Vendor Super Admins
├── Vendor Admins
└── Tracking Users
```

## 🔧 Setup & Installation

### Prerequisites
- Java 17 or higher
- Maven 3.6+
- PostgreSQL (for production)

### Quick Start

1. **Clone and navigate to backend**
```bash
cd backend
```

2. **Install dependencies**
```bash
./mvnw clean install
```

3. **Run the application**
```bash
./mvnw spring-boot:run
```

The server will start on `http://localhost:8080` and automatically:
- Create the database schema
- Initialize with demo vendors, users, locks, schedules, trips, and remarks
- Set up proper vendor isolation and relationships

## 🗄️ Auto Database Initialization

The backend automatically creates a complete database with realistic demo data:

### System Vendor
- **LockTrack Pro System** (SYSTEM)
- System Super Admins for platform management

### Demo Vendors
1. **ABC Transport Co.** (ABC001) - Leading transport company
2. **XYZ Logistics Ltd.** (XYZ002) - Premium logistics solutions  
3. **Global Freight Services** (GFS003) - International freight services

### Demo Users (Password: demo123)
- **System Level**: `superadmin@locktrackpro.com`, `admin@locktrackpro.com`
- **ABC Transport**: `admin@abctransport.com`, `super@abctransport.com`, `tracking@abctransport.com`, `driver1@abctransport.com`
- **XYZ Logistics**: `admin@xyzlogistics.com`, `super@xyzlogistics.com`, `tracking@xyzlogistics.com`, `driver1@xyzlogistics.com`
- **Global Freight**: `admin@globalfreight.com`, `super@globalfreight.com`, `tracking@globalfreight.com`, `driver1@globalfreight.com`

### Demo Data Includes
- **Locks** - Vendor-specific locks with different statuses
- **Schedules** - Upcoming delivery and transport schedules
- **Trips** - Active and completed trips with distance/detention data
- **Remarks** - User comments and status updates

## 📚 API Documentation

### Authentication Endpoints

#### POST /api/auth/signin
Login with email and password.

**Request:**
```json
{
  "email": "admin@abctransport.com",
  "password": "demo123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzUxMiJ9...",
  "type": "Bearer",
  "id": 3,
  "name": "John Smith",
  "email": "admin@abctransport.com",
  "role": "ADMIN",
  "vendorId": 2,
  "vendorName": "ABC Transport Co."
}
```

### Vendor Management (System Super Admin Only)

#### GET /api/vendors
Get all active vendors.

#### POST /api/vendors
Create a new vendor.

#### PUT /api/vendors/{id}
Update vendor information.

#### DELETE /api/vendors/{id}
Deactivate a vendor.

### User Management

#### GET /api/users
Get users (system super admin sees all, vendor super admin sees their vendor).

#### GET /api/users/vendor/{vendorId}
Get users for specific vendor (system super admin only).

#### GET /api/users/profile
Get current user profile.

### Lock Management (Vendor-Scoped)

#### GET /api/locks
Get locks for current user's vendor.

#### POST /api/locks
Create a new lock (Admin/Super Admin only).

#### PUT /api/locks/{id}/status
Update lock status.

#### PUT /api/locks/{id}/assign
Assign lock to user (Admin/Super Admin only).

### Schedule Management (Vendor-Scoped)

#### GET /api/schedules
Get schedules for current user's vendor.

#### POST /api/schedules
Create a new schedule (Admin/Super Admin only).

#### DELETE /api/schedules/{id}
Delete a schedule (Admin/Super Admin only).

### Remarks System (Vendor-Scoped)

#### GET /api/remarks
Get all remarks for current user's vendor.

#### GET /api/remarks/lock/{lockId}
Get remarks for specific lock.

#### POST /api/remarks
Create a new remark.

### Analytics (Vendor-Scoped)

#### GET /api/analytics
Get analytics data for current user's vendor.

## 🔐 Security & Access Control

### Authentication
- JWT tokens with configurable expiration
- BCrypt password encoding
- Multi-vendor context in tokens

### Authorization Roles
- **SYSTEM SUPERADMIN** - Platform-wide access, vendor management
- **VENDOR SUPERADMIN** - Full access within their vendor
- **VENDOR ADMIN** - Manage locks, schedules, view analytics within their vendor
- **TRACKING** - View assigned locks, add remarks within their vendor

### Data Isolation
- All data operations are vendor-scoped
- System super admins can access cross-vendor data
- Complete separation between vendor data

## 🗄️ Database Configuration

### Development (H2 - Auto-Created)
- **URL**: `http://localhost:8080/h2-console`
- **JDBC URL**: `jdbc:h2:mem:locktrackpro`
- **Username**: `sa`
- **Password**: `password`

### Production (PostgreSQL)
Set environment variables:
```bash
export DATABASE_URL=jdbc:postgresql://localhost:5432/locktrackpro
export DATABASE_USERNAME=locktrackpro
export DATABASE_PASSWORD=your_password
export JWT_SECRET=your_jwt_secret
```

## 🚀 Deployment

### Development
```bash
./mvnw spring-boot:run
```

### Production
```bash
# Build JAR
./mvnw clean package

# Run with production profile
java -jar target/excise-mia-backend-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod
```

### Environment Variables
```bash
# Database
DATABASE_URL=jdbc:postgresql://localhost:5432/locktrackpro
DATABASE_USERNAME=locktrackpro
DATABASE_PASSWORD=your_password

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRATION=86400000

# CORS
ALLOWED_ORIGINS=https://your-frontend-domain.com
```

## 🧪 Testing

### Run Tests
```bash
./mvnw test
```

### API Testing with curl
```bash
# Login
curl -X POST http://localhost:8080/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@abctransport.com","password":"demo123"}'

# Get locks (with token)
curl -X GET http://localhost:8080/api/locks \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 📊 Monitoring

### Health Check
```bash
curl http://localhost:8080/actuator/health
```

### Database Console (Development)
Access H2 console at `http://localhost:8080/h2-console` to view and query the auto-created database.

## 🔄 Data Initialization

The `DataInitializer` component automatically runs on startup and:

1. **Checks for existing data** - Skips initialization if data already exists
2. **Creates vendors** - System vendor + 3 demo vendors
3. **Creates users** - System admins + vendor-specific users with proper roles
4. **Creates locks** - Vendor-specific locks with realistic statuses and assignments
5. **Creates schedules** - Upcoming schedules for each vendor
6. **Creates trips** - Active and completed trips with distance/detention data
7. **Creates remarks** - User comments and status updates

All data is properly isolated by vendor and includes realistic relationships and timestamps.

## 🤝 Integration with React Native

### Mobile Development Setup
1. Start Spring Boot backend: `./mvnw spring-boot:run`
2. Update API base URL in React Native app with your computer's IP
3. Switch React Native app to use Spring Boot service
4. Test with demo accounts

### API Integration
The React Native app connects via REST APIs with JWT authentication and automatic vendor context.

## 📝 License

This project is part of the LockTrack Pro system for multi-vendor lock tracking and management.