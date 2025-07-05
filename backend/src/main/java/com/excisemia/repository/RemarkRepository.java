package com.excisemia.repository;

import com.excisemia.model.Remark;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RemarkRepository extends JpaRepository<Remark, Long> {
    List<Remark> findByLockIdAndVendorIdOrderByTimestampDesc(Long lockId, Long vendorId);
    List<Remark> findByUserIdAndVendorIdOrderByTimestampDesc(Long userId, Long vendorId);
    List<Remark> findByVendorIdOrderByTimestampDesc(Long vendorId);
}