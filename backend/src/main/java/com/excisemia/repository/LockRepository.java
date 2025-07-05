package com.excisemia.repository;

import com.excisemia.model.Lock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LockRepository extends JpaRepository<Lock, Long> {
    List<Lock> findByVendorId(Long vendorId);
    Optional<Lock> findByLockNumberAndVendorId(String lockNumber, Long vendorId);
    List<Lock> findByAssignedToAndVendorId(Long assignedTo, Long vendorId);
    List<Lock> findByStatusAndVendorId(Lock.Status status, Long vendorId);
    Boolean existsByLockNumberAndVendorId(String lockNumber, Long vendorId);
    Optional<Lock> findByIdAndVendorId(Long id, Long vendorId);
}