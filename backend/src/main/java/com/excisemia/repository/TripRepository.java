package com.excisemia.repository;

import com.excisemia.model.Trip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TripRepository extends JpaRepository<Trip, Long> {
    List<Trip> findByLockIdAndVendorId(Long lockId, Long vendorId);
    List<Trip> findByScheduleIdAndVendorId(Long scheduleId, Long vendorId);
    List<Trip> findByStatusAndVendorId(Trip.Status status, Long vendorId);
    List<Trip> findByVendorId(Long vendorId);
    Optional<Trip> findByIdAndVendorId(Long id, Long vendorId);
}