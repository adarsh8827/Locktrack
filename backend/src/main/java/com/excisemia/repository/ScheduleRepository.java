package com.excisemia.repository;

import com.excisemia.model.Schedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ScheduleRepository extends JpaRepository<Schedule, Long> {
    List<Schedule> findByVendorIdOrderByDateDesc(Long vendorId);
    List<Schedule> findByDateAndVendorIdOrderByCreatedAtDesc(LocalDate date, Long vendorId);
    List<Schedule> findByCreatedByAndVendorIdOrderByDateDesc(Long createdBy, Long vendorId);
    Optional<Schedule> findByIdAndVendorId(Long id, Long vendorId);
}