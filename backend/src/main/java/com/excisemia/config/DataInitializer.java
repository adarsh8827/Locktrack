package com.excisemia.config;

import com.excisemia.model.User;
import com.excisemia.model.Vendor;
import com.excisemia.model.Lock;
import com.excisemia.model.Schedule;
import com.excisemia.model.Trip;
import com.excisemia.model.Remark;
import com.excisemia.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    @Autowired
    private VendorRepository vendorRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LockRepository lockRepository;

    @Autowired
    private ScheduleRepository scheduleRepository;

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private RemarkRepository remarkRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        logger.info("Starting database initialization...");

        // Check if data already exists
        if (vendorRepository.count() > 0) {
            logger.info("Database already initialized. Skipping data creation.");
            return;
        }

        try {
            createVendors();
            createUsers();
            createLocks();
            createSchedules();
            createTrips();
            createRemarks();
            logger.info("Database initialization completed successfully!");
        } catch (Exception e) {
            logger.error("Error during database initialization: ", e);
            throw e;
        }
    }

    private void createVendors() {
        logger.info("Creating vendors...");

        // System vendor for system super admins
        Vendor systemVendor = new Vendor();
        systemVendor.setVendorName("LockTrack Pro System");
        systemVendor.setVendorCode("SYSTEM");
        systemVendor.setDescription("System administration vendor");
        systemVendor.setContactEmail("system@locktrackpro.com");
        systemVendor.setContactPhone("+1-800-SYSTEM");
        systemVendor.setIsActive(true);
        vendorRepository.save(systemVendor);

        // ABC Transport Co.
        Vendor abcTransport = new Vendor();
        abcTransport.setVendorName("ABC Transport Co.");
        abcTransport.setVendorCode("ABC001");
        abcTransport.setDescription("Leading transport and logistics company");
        abcTransport.setContactEmail("admin@abctransport.com");
        abcTransport.setContactPhone("+1-555-0101");
        abcTransport.setIsActive(true);
        vendorRepository.save(abcTransport);

        // XYZ Logistics Ltd.
        Vendor xyzLogistics = new Vendor();
        xyzLogistics.setVendorName("XYZ Logistics Ltd.");
        xyzLogistics.setVendorCode("XYZ002");
        xyzLogistics.setDescription("Premium logistics and supply chain solutions");
        xyzLogistics.setContactEmail("contact@xyzlogistics.com");
        xyzLogistics.setContactPhone("+1-555-0202");
        xyzLogistics.setIsActive(true);
        vendorRepository.save(xyzLogistics);

        // Global Freight Services
        Vendor globalFreight = new Vendor();
        globalFreight.setVendorName("Global Freight Services");
        globalFreight.setVendorCode("GFS003");
        globalFreight.setDescription("International freight and cargo services");
        globalFreight.setContactEmail("info@globalfreight.com");
        globalFreight.setContactPhone("+1-555-0303");
        globalFreight.setIsActive(true);
        vendorRepository.save(globalFreight);

        logger.info("Created {} vendors", vendorRepository.count());
    }

    private void createUsers() {
        logger.info("Creating users...");

        Vendor systemVendor = vendorRepository.findByVendorCode("SYSTEM").orElseThrow();
        Vendor abcTransport = vendorRepository.findByVendorCode("ABC001").orElseThrow();
        Vendor xyzLogistics = vendorRepository.findByVendorCode("XYZ002").orElseThrow();
        Vendor globalFreight = vendorRepository.findByVendorCode("GFS003").orElseThrow();

        // System Super Admins
        createUser("System Administrator", "superadmin@locktrackpro.com", "demo123", User.Role.SUPERADMIN, systemVendor.getId());
        createUser("Platform Admin", "admin@locktrackpro.com", "demo123", User.Role.SUPERADMIN, systemVendor.getId());

        // ABC Transport Co. Users
        createUser("John Smith", "admin@abctransport.com", "demo123", User.Role.ADMIN, abcTransport.getId());
        createUser("Sarah Johnson", "super@abctransport.com", "demo123", User.Role.SUPERADMIN, abcTransport.getId());
        createUser("Mike Wilson", "tracking@abctransport.com", "demo123", User.Role.TRACKING, abcTransport.getId());
        createUser("David Brown", "driver1@abctransport.com", "demo123", User.Role.TRACKING, abcTransport.getId());

        // XYZ Logistics Users
        createUser("Emily Davis", "admin@xyzlogistics.com", "demo123", User.Role.ADMIN, xyzLogistics.getId());
        createUser("Robert Chen", "super@xyzlogistics.com", "demo123", User.Role.SUPERADMIN, xyzLogistics.getId());
        createUser("Lisa Garcia", "tracking@xyzlogistics.com", "demo123", User.Role.TRACKING, xyzLogistics.getId());
        createUser("James Rodriguez", "driver1@xyzlogistics.com", "demo123", User.Role.TRACKING, xyzLogistics.getId());

        // Global Freight Services Users
        createUser("Amanda Taylor", "admin@globalfreight.com", "demo123", User.Role.ADMIN, globalFreight.getId());
        createUser("Kevin Lee", "super@globalfreight.com", "demo123", User.Role.SUPERADMIN, globalFreight.getId());
        createUser("Maria Martinez", "tracking@globalfreight.com", "demo123", User.Role.TRACKING, globalFreight.getId());
        createUser("Thomas Anderson", "driver1@globalfreight.com", "demo123", User.Role.TRACKING, globalFreight.getId());

        logger.info("Created {} users", userRepository.count());
    }

    private void createUser(String name, String email, String password, User.Role role, Long vendorId) {
        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setRole(role);
        user.setVendorId(vendorId);
        userRepository.save(user);
    }

    private void createLocks() {
        logger.info("Creating locks...");

        Vendor abcTransport = vendorRepository.findByVendorCode("ABC001").orElseThrow();
        Vendor xyzLogistics = vendorRepository.findByVendorCode("XYZ002").orElseThrow();
        Vendor globalFreight = vendorRepository.findByVendorCode("GFS003").orElseThrow();

        User abcTracking = userRepository.findByEmailAndVendorId("tracking@abctransport.com", abcTransport.getId()).orElseThrow();
        User abcDriver = userRepository.findByEmailAndVendorId("driver1@abctransport.com", abcTransport.getId()).orElseThrow();
        User xyzTracking = userRepository.findByEmailAndVendorId("tracking@xyzlogistics.com", xyzLogistics.getId()).orElseThrow();
        User xyzDriver = userRepository.findByEmailAndVendorId("driver1@xyzlogistics.com", xyzLogistics.getId()).orElseThrow();
        User gfsTracking = userRepository.findByEmailAndVendorId("tracking@globalfreight.com", globalFreight.getId()).orElseThrow();

        // ABC Transport Co. Locks
        createLock("ABC-L001", Lock.Status.AVAILABLE, null, abcTransport.getId());
        createLock("ABC-L002", Lock.Status.IN_TRANSIT, abcTracking.getId(), abcTransport.getId());
        createLock("ABC-L003", Lock.Status.ON_REVERSE_TRANSIT, abcDriver.getId(), abcTransport.getId());
        createLock("ABC-L004", Lock.Status.REACHED, null, abcTransport.getId());
        createLock("ABC-L005", Lock.Status.AVAILABLE, null, abcTransport.getId());

        // XYZ Logistics Locks
        createLock("XYZ-L001", Lock.Status.AVAILABLE, null, xyzLogistics.getId());
        createLock("XYZ-L002", Lock.Status.IN_TRANSIT, xyzTracking.getId(), xyzLogistics.getId());
        createLock("XYZ-L003", Lock.Status.AVAILABLE, null, xyzLogistics.getId());
        createLock("XYZ-L004", Lock.Status.REACHED, null, xyzLogistics.getId());
        createLock("XYZ-L005", Lock.Status.ON_REVERSE_TRANSIT, xyzDriver.getId(), xyzLogistics.getId());
        createLock("XYZ-L006", Lock.Status.IN_TRANSIT, xyzTracking.getId(), xyzLogistics.getId());

        // Global Freight Services Locks
        createLock("GFS-L001", Lock.Status.AVAILABLE, null, globalFreight.getId());
        createLock("GFS-L002", Lock.Status.IN_TRANSIT, gfsTracking.getId(), globalFreight.getId());
        createLock("GFS-L003", Lock.Status.AVAILABLE, null, globalFreight.getId());
        createLock("GFS-L004", Lock.Status.REACHED, null, globalFreight.getId());

        logger.info("Created {} locks", lockRepository.count());
    }

    private void createLock(String lockNumber, Lock.Status status, Long assignedTo, Long vendorId) {
        Lock lock = new Lock();
        lock.setLockNumber(lockNumber);
        lock.setStatus(status);
        lock.setAssignedTo(assignedTo);
        lock.setVendorId(vendorId);
        lockRepository.save(lock);
    }

    private void createSchedules() {
        logger.info("Creating schedules...");

        Vendor abcTransport = vendorRepository.findByVendorCode("ABC001").orElseThrow();
        Vendor xyzLogistics = vendorRepository.findByVendorCode("XYZ002").orElseThrow();
        Vendor globalFreight = vendorRepository.findByVendorCode("GFS003").orElseThrow();

        User abcAdmin = userRepository.findByEmailAndVendorId("admin@abctransport.com", abcTransport.getId()).orElseThrow();
        User abcSuper = userRepository.findByEmailAndVendorId("super@abctransport.com", abcTransport.getId()).orElseThrow();
        User xyzAdmin = userRepository.findByEmailAndVendorId("admin@xyzlogistics.com", xyzLogistics.getId()).orElseThrow();
        User gfsAdmin = userRepository.findByEmailAndVendorId("admin@globalfreight.com", globalFreight.getId()).orElseThrow();
        User gfsSuper = userRepository.findByEmailAndVendorId("super@globalfreight.com", globalFreight.getId()).orElseThrow();

        // ABC Transport Schedules
        createSchedule(LocalDate.now().plusDays(1), "ABC Transport - Regular delivery route", abcAdmin.getId(), abcTransport.getId());
        createSchedule(LocalDate.now().plusDays(2), "ABC Transport - Priority shipment", abcAdmin.getId(), abcTransport.getId());
        createSchedule(LocalDate.now().plusDays(3), "ABC Transport - Weekend operations", abcSuper.getId(), abcTransport.getId());

        // XYZ Logistics Schedules
        createSchedule(LocalDate.now().plusDays(1), "XYZ Logistics - Express delivery service", xyzAdmin.getId(), xyzLogistics.getId());
        createSchedule(LocalDate.now().plusDays(2), "XYZ Logistics - International shipment", xyzAdmin.getId(), xyzLogistics.getId());

        // Global Freight Schedules
        createSchedule(LocalDate.now().plusDays(1), "Global Freight - International cargo route", gfsAdmin.getId(), globalFreight.getId());
        createSchedule(LocalDate.now().plusDays(4), "Global Freight - Holiday special delivery", gfsSuper.getId(), globalFreight.getId());

        logger.info("Created {} schedules", scheduleRepository.count());
    }

    private void createSchedule(LocalDate date, String note, Long createdBy, Long vendorId) {
        Schedule schedule = new Schedule();
        schedule.setDate(date);
        schedule.setNote(note);
        schedule.setCreatedBy(createdBy);
        schedule.setVendorId(vendorId);
        scheduleRepository.save(schedule);
    }

    private void createTrips() {
        logger.info("Creating trips...");

        // Get some locks and schedules for trip creation
        Lock abcLock2 = lockRepository.findByLockNumberAndVendorId("ABC-L002", 
            vendorRepository.findByVendorCode("ABC001").orElseThrow().getId()).orElseThrow();
        Lock abcLock3 = lockRepository.findByLockNumberAndVendorId("ABC-L003", 
            vendorRepository.findByVendorCode("ABC001").orElseThrow().getId()).orElseThrow();
        Lock xyzLock2 = lockRepository.findByLockNumberAndVendorId("XYZ-L002", 
            vendorRepository.findByVendorCode("XYZ002").orElseThrow().getId()).orElseThrow();

        Schedule abcSchedule = scheduleRepository.findByVendorIdOrderByDateDesc(
            vendorRepository.findByVendorCode("ABC001").orElseThrow().getId()).get(0);
        Schedule xyzSchedule = scheduleRepository.findByVendorIdOrderByDateDesc(
            vendorRepository.findByVendorCode("XYZ002").orElseThrow().getId()).get(0);

        // Create active trips
        createTrip(abcLock2.getId(), abcSchedule.getId(), abcLock2.getVendorId(), 28.5, 45, Trip.Status.ACTIVE);
        createTrip(abcLock3.getId(), abcSchedule.getId(), abcLock3.getVendorId(), 18.2, 30, Trip.Status.ACTIVE);
        createTrip(xyzLock2.getId(), xyzSchedule.getId(), xyzLock2.getVendorId(), 42.1, 60, Trip.Status.ACTIVE);

        // Create completed trip
        Trip completedTrip = new Trip();
        completedTrip.setLockId(lockRepository.findByLockNumberAndVendorId("ABC-L004", 
            vendorRepository.findByVendorCode("ABC001").orElseThrow().getId()).orElseThrow().getId());
        completedTrip.setScheduleId(abcSchedule.getId());
        completedTrip.setVendorId(vendorRepository.findByVendorCode("ABC001").orElseThrow().getId());
        completedTrip.setStartTime(LocalDateTime.now().minusHours(3));
        completedTrip.setEndTime(LocalDateTime.now().minusHours(1));
        completedTrip.setDistanceKm(35.7);
        completedTrip.setDetentionMins(25);
        completedTrip.setStatus(Trip.Status.COMPLETED);
        tripRepository.save(completedTrip);

        logger.info("Created {} trips", tripRepository.count());
    }

    private void createTrip(Long lockId, Long scheduleId, Long vendorId, Double distanceKm, Integer detentionMins, Trip.Status status) {
        Trip trip = new Trip();
        trip.setLockId(lockId);
        trip.setScheduleId(scheduleId);
        trip.setVendorId(vendorId);
        trip.setStartTime(LocalDateTime.now().minusHours(2));
        trip.setDistanceKm(distanceKm);
        trip.setDetentionMins(detentionMins);
        trip.setStatus(status);
        tripRepository.save(trip);
    }

    private void createRemarks() {
        logger.info("Creating remarks...");

        Vendor abcTransport = vendorRepository.findByVendorCode("ABC001").orElseThrow();
        Vendor xyzLogistics = vendorRepository.findByVendorCode("XYZ002").orElseThrow();
        Vendor globalFreight = vendorRepository.findByVendorCode("GFS003").orElseThrow();

        User abcAdmin = userRepository.findByEmailAndVendorId("admin@abctransport.com", abcTransport.getId()).orElseThrow();
        User abcTracking = userRepository.findByEmailAndVendorId("tracking@abctransport.com", abcTransport.getId()).orElseThrow();
        User abcDriver = userRepository.findByEmailAndVendorId("driver1@abctransport.com", abcTransport.getId()).orElseThrow();
        User xyzTracking = userRepository.findByEmailAndVendorId("tracking@xyzlogistics.com", xyzLogistics.getId()).orElseThrow();
        User xyzDriver = userRepository.findByEmailAndVendorId("driver1@xyzlogistics.com", xyzLogistics.getId()).orElseThrow();
        User gfsTracking = userRepository.findByEmailAndVendorId("tracking@globalfreight.com", globalFreight.getId()).orElseThrow();
        User gfsAdmin = userRepository.findByEmailAndVendorId("admin@globalfreight.com", globalFreight.getId()).orElseThrow();

        Lock abcLock1 = lockRepository.findByLockNumberAndVendorId("ABC-L001", abcTransport.getId()).orElseThrow();
        Lock abcLock2 = lockRepository.findByLockNumberAndVendorId("ABC-L002", abcTransport.getId()).orElseThrow();
        Lock abcLock3 = lockRepository.findByLockNumberAndVendorId("ABC-L003", abcTransport.getId()).orElseThrow();
        Lock xyzLock2 = lockRepository.findByLockNumberAndVendorId("XYZ-L002", xyzLogistics.getId()).orElseThrow();
        Lock xyzLock5 = lockRepository.findByLockNumberAndVendorId("XYZ-L005", xyzLogistics.getId()).orElseThrow();
        Lock gfsLock2 = lockRepository.findByLockNumberAndVendorId("GFS-L002", globalFreight.getId()).orElseThrow();
        Lock gfsLock4 = lockRepository.findByLockNumberAndVendorId("GFS-L004", globalFreight.getId()).orElseThrow();

        // ABC Transport remarks
        createRemark(abcLock1.getId(), abcAdmin.getId(), abcAdmin.getName(), 
            "ABC Lock inspected and ready for deployment", abcTransport.getId(), LocalDateTime.now().minusHours(1));
        createRemark(abcLock2.getId(), abcTracking.getId(), abcTracking.getName(), 
            "ABC Transport - Started transit to downtown warehouse", abcTransport.getId(), LocalDateTime.now().minusMinutes(30));
        createRemark(abcLock3.getId(), abcDriver.getId(), abcDriver.getName(), 
            "ABC Transport - On reverse route, ETA 1.5 hours", abcTransport.getId(), LocalDateTime.now().minusMinutes(15));

        // XYZ Logistics remarks
        createRemark(xyzLock2.getId(), xyzTracking.getId(), xyzTracking.getName(), 
            "XYZ Logistics - Express route initiated", xyzLogistics.getId(), LocalDateTime.now().minusMinutes(45));
        createRemark(xyzLock5.getId(), xyzDriver.getId(), xyzDriver.getName(), 
            "XYZ Logistics - Return journey in progress", xyzLogistics.getId(), LocalDateTime.now().minusMinutes(20));

        // Global Freight remarks
        createRemark(gfsLock2.getId(), gfsTracking.getId(), gfsTracking.getName(), 
            "Global Freight - International shipment en route", globalFreight.getId(), LocalDateTime.now().minusMinutes(30));
        createRemark(gfsLock4.getId(), gfsAdmin.getId(), gfsAdmin.getName(), 
            "Global Freight - Delivery completed successfully", globalFreight.getId(), LocalDateTime.now().minusMinutes(10));

        logger.info("Created {} remarks", remarkRepository.count());
    }

    private void createRemark(Long lockId, Long userId, String userName, String message, Long vendorId, LocalDateTime timestamp) {
        Remark remark = new Remark();
        remark.setLockId(lockId);
        remark.setUserId(userId);
        remark.setUserName(userName);
        remark.setMessage(message);
        remark.setVendorId(vendorId);
        remark.setTimestamp(timestamp);
        remarkRepository.save(remark);
    }
}