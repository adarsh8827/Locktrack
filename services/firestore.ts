// Switch to Spring Boot backend service
export {
  addLock,
  updateLockStatus,
  getLocks,
  addSchedule,
  getSchedules,
  deleteSchedule,
  addTrip,
  updateTrip,
  addRemark,
  getRemarksByLock,
  getAnalytics,
} from './springBootService';

// Also export the Spring Boot auth service
export { springAuthService as authService } from './springBootService';