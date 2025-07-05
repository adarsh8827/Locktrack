package com.excisemia.repository;

import com.excisemia.model.Vendor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VendorRepository extends JpaRepository<Vendor, Long> {
    Optional<Vendor> findByVendorCode(String vendorCode);
    Optional<Vendor> findByVendorName(String vendorName);
    List<Vendor> findByIsActiveTrue();
    Boolean existsByVendorCode(String vendorCode);
    Boolean existsByVendorName(String vendorName);
}