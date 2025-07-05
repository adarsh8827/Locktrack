package com.excisemia.controller;

import com.excisemia.dto.JwtResponse;
import com.excisemia.dto.LoginRequest;
import com.excisemia.dto.SignUpRequest;
import com.excisemia.dto.MessageResponse;
import com.excisemia.model.User;
import com.excisemia.model.Vendor;
import com.excisemia.repository.UserRepository;
import com.excisemia.repository.VendorRepository;
import com.excisemia.security.JwtUtils;
import com.excisemia.security.UserPrincipal;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    VendorRepository vendorRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;

    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            logger.info("Attempting to authenticate user: {}", loginRequest.getEmail());
            
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = jwtUtils.generateJwtToken(authentication);

            UserPrincipal userDetails = (UserPrincipal) authentication.getPrincipal();
            
            // Get vendor information
            Vendor vendor = vendorRepository.findById(userDetails.getVendorId())
                    .orElse(null);
            String vendorName = vendor != null ? vendor.getVendorName() : "Unknown";

            logger.info("User authenticated successfully: {}", loginRequest.getEmail());

            return ResponseEntity.ok(new JwtResponse(jwt,
                    userDetails.getId(),
                    userDetails.getName(),
                    userDetails.getEmail(),
                    userDetails.getRole(),
                    userDetails.getVendorId(),
                    vendorName));
        } catch (Exception e) {
        	e.printStackTrace();
            logger.error("Authentication failed for user: {}, error: {}", loginRequest.getEmail(), e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: Invalid credentials!"));
        }
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignUpRequest signUpRequest) {
        try {
            logger.info("Attempting to register user: {}", signUpRequest.getEmail());
            
            // Check if email already exists
            if (userRepository.existsByEmail(signUpRequest.getEmail())) {
                logger.warn("Registration failed - email already exists: {}", signUpRequest.getEmail());
                return ResponseEntity.badRequest()
                        .body(new MessageResponse("Error: Email is already in use!"));
            }

            // Validate vendor exists and is active
            Vendor vendor = vendorRepository.findById(signUpRequest.getVendorId())
                    .orElse(null);
            
            if (vendor == null || !vendor.getIsActive()) {
                logger.warn("Registration failed - invalid vendor: {}", signUpRequest.getVendorId());
                return ResponseEntity.badRequest()
                        .body(new MessageResponse("Error: Invalid or inactive vendor!"));
            }

            // Create new user account
            User user = new User();
            user.setName(signUpRequest.getName());
            user.setEmail(signUpRequest.getEmail());
            user.setPassword(encoder.encode(signUpRequest.getPassword()));
            user.setVendorId(signUpRequest.getVendorId());
            
            // Default role is TRACKING - only superadmin can change roles
            user.setRole(User.Role.TRACKING);
            user.setIsActive(true); // Inactive by default, superadmin must activate

            // Set additional fields if provided
            if (signUpRequest.getPhone() != null && !signUpRequest.getPhone().trim().isEmpty()) {
                user.setPhone(signUpRequest.getPhone().trim());
            }
            if (signUpRequest.getDepartment() != null && !signUpRequest.getDepartment().trim().isEmpty()) {
                user.setDepartment(signUpRequest.getDepartment().trim());
            }

            userRepository.save(user);
            
            logger.info("User registered successfully: {}", signUpRequest.getEmail());

            return ResponseEntity.ok(new MessageResponse("User registered successfully! Please wait for admin approval."));
        } catch (Exception e) {
            logger.error("Registration failed for user: {}, error: {}", signUpRequest.getEmail(), e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: Registration failed - " + e.getMessage()));
        }
    }

    @PostMapping("/validate-token")
    public ResponseEntity<?> validateToken(@RequestHeader("Authorization") String token) {
        try {
            String jwt = token.substring(7); // Remove "Bearer " prefix
            if (jwtUtils.validateJwtToken(jwt)) {
                String email = jwtUtils.getEmailFromJwtToken(jwt);
                User user = userRepository.findByEmail(email).orElse(null);
                
                if (user != null && user.getIsActive()) {
                    Vendor vendor = vendorRepository.findById(user.getVendorId()).orElse(null);
                    String vendorName = vendor != null ? vendor.getVendorName() : "Unknown";
                    
                    return ResponseEntity.ok(new JwtResponse(jwt,
                            user.getId(),
                            user.getName(),
                            user.getEmail(),
                            user.getRole(),
                            user.getVendorId(),
                            vendorName));
                }
            }
            return ResponseEntity.badRequest().body(new MessageResponse("Invalid or inactive user"));
        } catch (Exception e) {
            logger.error("Token validation failed: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new MessageResponse("Token validation failed"));
        }
    }

    @PostMapping("/signout")
    public ResponseEntity<?> signOut() {
        logger.info("User signed out successfully");
        return ResponseEntity.ok(new MessageResponse("User signed out successfully!"));
    }
}