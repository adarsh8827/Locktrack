package com.excisemia.service;

import com.excisemia.model.Lock;
import com.excisemia.repository.LockRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LockService {

    @Autowired
    private LockRepository lockRepository;

    public List<Lock> getLocksByVendor(Long vendorId) {
        return lockRepository.findByVendorId(vendorId);
    }

    public Lock createLock(String lockNumber, Long vendorId) {
        if (lockRepository.existsByLockNumberAndVendorId(lockNumber, vendorId)) {
            throw new RuntimeException("Lock number already exists for this vendor");
        }
        
        Lock lock = new Lock(lockNumber, vendorId);
        return lockRepository.save(lock);
    }

    public Lock updateLockStatus(Long id, Lock.Status status, Long vendorId) {
        Lock lock = lockRepository.findByIdAndVendorId(id, vendorId)
                .orElseThrow(() -> new RuntimeException("Lock not found or access denied"));
        
        lock.setStatus(status);
        return lockRepository.save(lock);
    }

    public Lock assignLock(Long lockId, Long userId, Long vendorId) {
        Lock lock = lockRepository.findByIdAndVendorId(lockId, vendorId)
                .orElseThrow(() -> new RuntimeException("Lock not found or access denied"));
        
        lock.setAssignedTo(userId);
        return lockRepository.save(lock);
    }

    public List<Lock> getLocksByUserAndVendor(Long userId, Long vendorId) {
        return lockRepository.findByAssignedToAndVendorId(userId, vendorId);
    }
}