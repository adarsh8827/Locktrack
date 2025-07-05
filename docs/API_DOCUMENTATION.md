# API Documentation - Excise MIA

## Authentication Service

### Mock Authentication (Development)

The app uses a mock authentication service for development that simulates Firebase Auth behavior.

#### Available Demo Accounts

```typescript
const DEMO_ACCOUNTS = {
  superadmin: {
    email: 'superadmin@excisemia.com',
    password: 'super123',
    role: 'superadmin',
    name: 'Super Admin'
  },
  admin: {
    email: 'admin@excisemia.com', 
    password: 'admin123',
    role: 'admin',
    name: 'Admin User'
  },
  tracking: {
    email: 'tracking@excisemia.com',
    password: 'track123', 
    role: 'tracking',
    name: 'Tracking Team'
  }
};
```

#### Authentication Methods

```typescript
// Sign in user
await mockAuthService.signIn(email: string, password: string): Promise<MockUser>

// Sign out current user  
await mockAuthService.signOut(): Promise<void>

// Get current user
mockAuthService.getCurrentUser(): MockUser | null

// Listen to auth state changes
const unsubscribe = mockAuthService.onAuthStateChanged(
  (user: MockUser | null) => void
): () => void
```

## Database Service (Firestore)

### Lock Operations

```typescript
// Add new lock
await addLock(lockData: Omit<Lock, 'id'>): Promise<string>

// Update lock status
await updateLockStatus(lockId: string, status: Lock['status']): Promise<void>

// Get all locks
await getLocks(): Promise<Lock[]>
```

### Schedule Operations

```typescript
// Add new schedule
await addSchedule(scheduleData: Omit<Schedule, 'id'>): Promise<string>

// Get all schedules
await getSchedules(): Promise<Schedule[]>

// Delete schedule
await deleteSchedule(scheduleId: string): Promise<void>
```

### Trip Operations

```typescript
// Add new trip
await addTrip(tripData: Omit<Trip, 'id'>): Promise<string>

// Update existing trip
await updateTrip(tripId: string, tripData: Partial<Trip>): Promise<void>
```

### Remarks Operations

```typescript
// Add new remark
await addRemark(remarkData: Omit<Remark, 'id'>): Promise<string>

// Get remarks for specific lock
await getRemarksByLock(lockId: string): Promise<Remark[]>
```

### Analytics Operations

```typescript
// Get analytics data for all locks
await getAnalytics(): Promise<Analytics[]>
```

## Utility Functions

### ETA Calculator

```typescript
// Calculate estimated time of arrival
calculateETA(
  distanceKm: number, 
  averageSpeedKmh: number = 50
): ETACalculation

// Calculate required number of locks
calculateLocksRequired(
  numberOfTrips: number, 
  safetyBuffer: number = 0.2
): number

// Format ETA for display
formatETA(estimatedArrival: Date): string

// Get speed recommendation
getSpeedRecommendation(
  distanceKm: number, 
  targetTimeMinutes: number
): number
```

## Error Handling

All API calls include proper error handling:

```typescript
try {
  const result = await apiCall();
  // Handle success
} catch (error) {
  // Handle error appropriately
  console.error('API Error:', error);
  // Show user-friendly error message
}
```

## Data Validation

All input data is validated before processing:

- Email format validation
- Required field checks
- Data type validation
- Business logic validation

## Response Formats

### Success Response
```typescript
{
  success: true,
  data: any,
  message?: string
}
```

### Error Response  
```typescript
{
  success: false,
  error: string,
  code?: string
}
```