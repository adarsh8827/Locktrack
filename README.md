# LockTrack Pro - Multi-Vendor Lock Tracking System

A comprehensive cross-platform mobile application for excise lock tracking and management operations with complete multi-vendor support and system-level administration.

## 🚀 Features

### 🏢 Multi-Vendor Architecture
- **Complete Data Isolation** - Each vendor has separate data silos
- **Vendor-Specific User Management** - Users belong to specific vendors
- **Independent Lock Numbering** - Same lock numbers can exist across vendors
- **Separate Analytics** - Vendor-specific performance metrics
- **Role-Based Access Control** - Admin, Super Admin, and Tracking roles per vendor

### 👑 System Administration
- **System Super Admin** - Platform-wide management across all vendors
- **Vendor Management** - Add, edit, and deactivate vendors
- **User Overview** - System-wide user management and monitoring
- **Global Analytics** - Aggregated performance metrics across all vendors
- **Platform Oversight** - Complete visibility into all vendor operations

### 🔐 Authentication System
- **Multi-level Access Control** - System, Vendor, and User level permissions
- **Role-based Access** - Super Admin, Admin, Tracking Team roles
- **Secure Authentication** - Email/password with persistent sessions
- **Vendor Context** - All operations scoped to appropriate vendor

### 📅 Schedule Management
- Create, view, and delete schedule entries
- Calendar-based interface
- Date-specific scheduling with optional notes
- Admin-only schedule creation

### 🔒 Lock Management & Tracking
- Complete lock lifecycle management
- Status tracking: Available → In Transit → On Reverse Transit → Reached
- Real-time status updates
- Lock assignment to tracking team members
- Vendor-scoped lock operations

### 💬 Remarks System
- Add contextual remarks linked to specific locks
- User attribution with timestamps
- Real-time collaboration between team members
- Historical remark tracking

### 📊 Analytics Dashboard
- Comprehensive analytics for lock performance
- Interactive charts and visualizations
- Vendor-specific metrics and comparisons
- System-wide analytics for platform administrators

## 🏗️ Technical Architecture

### Frontend Stack
- **React Native** with **TypeScript** - Type-safe cross-platform development
- **Expo Router** - File-based navigation system
- **Expo SDK 52** - Comprehensive development platform
- **React Native Reanimated** - High-performance animations
- **Lucide React Native** - Beautiful, consistent iconography

### Backend Options
- **Spring Boot Backend** - Production-ready Java backend with JWT authentication
- **Dummy Data Service** - Development environment with realistic multi-vendor data

### State Management
- **React Context API** - Global application state
- **AsyncStorage** - Local data persistence
- **Custom Hooks** - Reusable state logic

## 📁 Project Structure

```
app/
├── _layout.tsx                 # Root layout with authentication
├── index.tsx                   # Landing/login screen
├── (tabs)/                     # Tab-based navigation
│   ├── _layout.tsx            # Tab navigation configuration
│   ├── index.tsx              # Dashboard screen
│   ├── vendors.tsx            # Vendor management (System Admin)
│   ├── users.tsx              # User management (System Admin)
│   ├── locks.tsx              # Lock management
│   ├── schedules.tsx          # Schedule management
│   ├── analytics.tsx          # Analytics dashboard
│   ├── remarks.tsx            # Remarks system
│   └── settings.tsx           # User settings
└── +not-found.tsx             # 404 error page

backend/                        # Spring Boot backend
├── src/main/java/com/excisemia/
│   ├── controller/            # REST controllers
│   ├── service/               # Business logic
│   ├── model/                 # JPA entities
│   ├── repository/            # Data repositories
│   ├── security/              # Security configuration
│   └── dto/                   # Data Transfer Objects

services/
├── dummyAuthService.ts        # Multi-vendor dummy authentication
├── dummyDataService.ts        # Vendor-specific dummy data
├── dummyFirestore.ts          # Dummy database operations
├── springBootService.ts       # Spring Boot integration
└── api.ts                     # API configuration

types/
└── index.ts                   # TypeScript type definitions
```

## 🗄️ Multi-Vendor Database Schema

### System Hierarchy
```
System Super Admin
├── Vendor A
│   ├── Vendor Super Admin
│   ├── Vendor Admin
│   └── Tracking Users
├── Vendor B
│   ├── Vendor Super Admin
│   ├── Vendor Admin
│   └── Tracking Users
└── Vendor C
    ├── Vendor Super Admin
    ├── Vendor Admin
    └── Tracking Users
```

### Users Table (Multi-Level)
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  role: 'superadmin' | 'admin' | 'tracking';
  vendorId: string;        // 'system' for System Super Admins
  vendorName: string;      // Denormalized for UI
  createdAt: Date;
}
```

### Vendors Table
```typescript
interface Vendor {
  id: string;
  vendorName: string;
  vendorCode: string;
  description?: string;
  contactEmail: string;
  contactPhone?: string;
  isActive: boolean;
  createdAt: Date;
}
```

### Locks Table (Vendor-Scoped)
```typescript
interface Lock {
  id: string;
  lockNumber: string;      // Can be same across vendors
  status: 'available' | 'in_transit' | 'on_reverse_transit' | 'reached';
  assignedTo?: string;
  vendorId: string;        // Vendor isolation
  lastUpdated: Date;
}
```

All other entities (Schedules, Trips, Remarks) follow the same vendor-scoped pattern.

## 🔧 Development Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Expo CLI
- Java 17+ (for Spring Boot backend)
- Maven 3.6+ (for Spring Boot backend)

### Quick Start (Dummy Data)
```bash
# Clone and install
git clone <repository-url>
cd locktrack-pro
npm install

# Start with dummy data
npm run dev
```

### Demo Accounts

#### System Administration
- **System Super Admin**: `superadmin@excisemia.com` / `demo123`
- **Platform Admin**: `admin@excisemia.com` / `demo123`

#### ABC Transport Co.
- **Admin**: `admin@abctransport.com` / `demo123`
- **Super Admin**: `super@abctransport.com` / `demo123`
- **Tracking**: `tracking@abctransport.com` / `demo123`

#### XYZ Logistics Ltd.
- **Admin**: `admin@xyzlogistics.com` / `demo123`
- **Super Admin**: `super@xyzlogistics.com` / `demo123`
- **Tracking**: `tracking@xyzlogistics.com` / `demo123`

#### Global Freight Services
- **Admin**: `admin@globalfreight.com` / `demo123`
- **Super Admin**: `super@globalfreight.com` / `demo123`
- **Tracking**: `tracking@globalfreight.com` / `demo123`

### Spring Boot Backend Setup
```bash
# Start Spring Boot backend
cd backend
./mvnw spring-boot:run

# Update API configuration
# Edit services/api.ts with your IP address

# Switch to Spring Boot service
# Edit services/firestore.ts:
# export * from './springBootService';
```

## 🏢 Multi-Vendor Features

### System-Level Administration
- **Platform Management** - System Super Admins manage the entire platform
- **Vendor Onboarding** - Add new vendors with complete setup
- **User Oversight** - View and manage users across all vendors
- **Global Analytics** - Platform-wide performance metrics
- **Vendor Status Control** - Activate/deactivate vendor accounts

### Vendor-Level Operations
- **Isolated Operations** - Each vendor operates independently
- **Lock Management** - Vendor-specific lock tracking and management
- **Team Management** - Vendor admins manage their team members
- **Performance Tracking** - Vendor-specific analytics and reporting

### Security & Access Control
- **Multi-Level Permissions** - System, Vendor, and User level access
- **Data Isolation** - Complete separation between vendors
- **Role Enforcement** - Strict role-based access control
- **Audit Trail** - Complete tracking of all operations

## 🚀 Deployment

### Development Mode
The app currently runs in development mode with comprehensive dummy data for easy testing and demonstration of multi-vendor capabilities.

### Production Deployment
1. **Backend**: Deploy Spring Boot application to your preferred cloud provider
2. **Frontend**: Build and deploy using Expo EAS Build
3. **Database**: Configure PostgreSQL for production
4. **Environment**: Update API endpoints and configuration

## 🔒 Security Features

- **Multi-tenant architecture** with complete vendor isolation
- **JWT-based authentication** with vendor and system context
- **Role-based access control** at system and vendor levels
- **Data validation** and sanitization at all levels
- **Secure API endpoints** with context-aware filtering

## 📱 Platform Support

- **iOS** - Native iOS app
- **Android** - Native Android app  
- **Web** - Progressive Web App
- **Cross-platform** - Shared codebase with complete isolation

## 🎨 Design System

- **Multi-level UI** - System and vendor-specific interfaces
- **Professional theme** - Clean, modern interface
- **Responsive design** - Adaptive layouts for all screen sizes
- **Consistent iconography** - Lucide icon library
- **Smooth animations** - Purposeful micro-interactions

## 🔄 Data Flow

### System Administration Flow
1. System Super Admin manages platform-wide operations
2. Vendor management with complete CRUD operations
3. User oversight across all vendors
4. Global analytics and reporting

### Vendor Operations Flow
1. Vendor users authenticate with vendor context
2. All operations scoped to vendor boundaries
3. Complete data isolation maintained
4. Vendor-specific analytics and reporting

## 🔮 Future Enhancements

- **Advanced Vendor Management** - Vendor-specific branding and customization
- **API Integration** - Vendor-specific API endpoints
- **Advanced Analytics** - Cross-vendor performance comparisons
- **Automated Onboarding** - Self-service vendor registration
- **Multi-language Support** - Localization per vendor
- **Advanced Reporting** - Custom report generation

## 📊 Development vs Production

### Current State (Development)
- ✅ Complete multi-vendor dummy data system
- ✅ System-level administration
- ✅ Vendor isolation simulation
- ✅ All features working with realistic data
- ✅ Easy account switching for testing

### Production Ready
- ✅ Spring Boot backend with multi-vendor support
- ✅ PostgreSQL database with complete isolation
- ✅ JWT authentication with system and vendor context
- ✅ Complete API documentation
- ✅ Security best practices implemented

Switch between development and production modes by updating the service imports in `services/firestore.ts`.