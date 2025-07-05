package com.excisemia.controller;

import com.excisemia.dto.VendorRequest;
import com.excisemia.model.Vendor;
import com.excisemia.service.VendorService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/vendors")
public class VendorController {

    @Autowired
    private VendorService vendorService;

    @GetMapping
    public ResponseEntity<List<Vendor>> getAllVendors() {
        List<Vendor> vendors = vendorService.getAllActiveVendors();
        return ResponseEntity.ok(vendors);
    }

    @PostMapping
    @PreAuthorize("hasRole('SUPERADMIN')")
    public ResponseEntity<Vendor> createVendor(@Valid @RequestBody VendorRequest vendorRequest) {
        Vendor vendor = vendorService.createVendor(vendorRequest);
        return ResponseEntity.ok(vendor);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('SUPERADMIN')")
    public ResponseEntity<Vendor> updateVendor(@PathVariable Long id, @Valid @RequestBody VendorRequest vendorRequest) {
        Vendor vendor = vendorService.updateVendor(id, vendorRequest);
        return ResponseEntity.ok(vendor);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SUPERADMIN')")
    public ResponseEntity<?> deactivateVendor(@PathVariable Long id) {
        vendorService.deactivateVendor(id);
        return ResponseEntity.ok().build();
    }
}