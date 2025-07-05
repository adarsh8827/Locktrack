package com.excisemia.controller;

import com.excisemia.dto.LockRequest;
import com.excisemia.model.Lock;
import com.excisemia.security.UserPrincipal;
import com.excisemia.service.LockService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/locks")
public class LockController {

    @Autowired
    private LockService lockService;

    @GetMapping
    public ResponseEntity<List<Lock>> getAllLocks(Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        List<Lock> locks = lockService.getLocksByVendor(userPrincipal.getVendorId());
        return ResponseEntity.ok(locks);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPERADMIN')")
    public ResponseEntity<Lock> createLock(@Valid @RequestBody LockRequest lockRequest, Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        Lock lock = lockService.createLock(lockRequest.getLockNumber(), userPrincipal.getVendorId());
        return ResponseEntity.ok(lock);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Lock> updateLockStatus(@PathVariable Long id, @RequestParam Lock.Status status, Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        Lock updatedLock = lockService.updateLockStatus(id, status, userPrincipal.getVendorId());
        return ResponseEntity.ok(updatedLock);
    }

    @PutMapping("/{id}/assign")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPERADMIN')")
    public ResponseEntity<Lock> assignLock(@PathVariable Long id, @RequestParam Long userId, Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        Lock updatedLock = lockService.assignLock(id, userId, userPrincipal.getVendorId());
        return ResponseEntity.ok(updatedLock);
    }
}