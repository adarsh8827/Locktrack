package com.excisemia.controller;

import com.excisemia.model.User;
import com.excisemia.security.UserPrincipal;
import com.excisemia.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping
    @PreAuthorize("hasRole('SUPERADMIN')")
    public ResponseEntity<List<User>> getAllUsers(Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        
        // System super admin can see all users, vendor super admin can see their vendor users
        List<User> users;
        if (userPrincipal.getVendorId().equals(1L)) { // System vendor ID
            users = userService.getAllUsers();
        } else {
            users = userService.getUsersByVendor(userPrincipal.getVendorId());
        }
        
        return ResponseEntity.ok(users);
    }

    @GetMapping("/vendor/{vendorId}")
    @PreAuthorize("hasRole('SUPERADMIN')")
    public ResponseEntity<List<User>> getUsersByVendor(@PathVariable Long vendorId, Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        
        // Only system super admin can access users from any vendor
        if (!userPrincipal.getVendorId().equals(1L)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        List<User> users = userService.getUsersByVendor(vendorId);
        return ResponseEntity.ok(users);
    }

    @GetMapping("/profile")
    public ResponseEntity<User> getCurrentUserProfile(Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        User user = userService.getUserById(userPrincipal.getId());
        return ResponseEntity.ok(user);
    }

    @PutMapping("/{userId}/role")
    @PreAuthorize("hasRole('SUPERADMIN')")
    public ResponseEntity<?> updateUserRole(@PathVariable Long userId, @RequestBody Map<String, String> request, Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        
        // Only system super admin can update roles
        if (!userPrincipal.getVendorId().equals(1L)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        String role = request.get("role");
        userService.updateUserRole(userId, role);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{userId}/activate")
    @PreAuthorize("hasRole('SUPERADMIN')")
    public ResponseEntity<?> activateUser(@PathVariable Long userId, Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        
        // Only system super admin can activate users
        if (!userPrincipal.getVendorId().equals(1L)) {
        	return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        userService.activateUser(userId);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{userId}/deactivate")
    @PreAuthorize("hasRole('SUPERADMIN')")
    public ResponseEntity<?> deactivateUser(@PathVariable Long userId, Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        
        // Only system super admin can deactivate users
        if (!userPrincipal.getVendorId().equals(1L)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        userService.deactivateUser(userId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{userId}")
    @PreAuthorize("hasRole('SUPERADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable Long userId, Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        
        // Only system super admin can delete users
        if (!userPrincipal.getVendorId().equals(1L)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        userService.deleteUser(userId);
        return ResponseEntity.ok().build();
    }
}