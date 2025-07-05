package com.excisemia.repository;

import com.excisemia.model.User;
import com.excisemia.model.Vendor;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    List<User> findByVendorId(Long vendorId);
    Boolean existsByEmail(String email);
    List<User> findByRole(User.Role role);
    List<User> findByVendorIdAndRole(Long vendorId, User.Role role);
    Optional<Vendor> findByEmailAndVendorId(String email, Long vendorId);
}