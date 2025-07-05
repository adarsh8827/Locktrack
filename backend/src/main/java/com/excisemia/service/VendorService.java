package com.excisemia.service;

import com.excisemia.dto.VendorRequest;
import com.excisemia.model.Vendor;
import com.excisemia.repository.VendorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class VendorService {

    @Autowired
    private VendorRepository vendorRepository;

    public List<Vendor> getAllActiveVendors() {
        return vendorRepository.findByIsActiveTrue();
    }

    public Vendor createVendor(VendorRequest vendorRequest) {
        if (vendorRepository.existsByVendorCode(vendorRequest.getVendorCode())) {
            throw new RuntimeException("Vendor code already exists");
        }
        
        if (vendorRepository.existsByVendorName(vendorRequest.getVendorName())) {
            throw new RuntimeException("Vendor name already exists");
        }

        Vendor vendor = new Vendor(
            vendorRequest.getVendorName(),
            vendorRequest.getVendorCode(),
            vendorRequest.getContactEmail()
        );
        vendor.setDescription(vendorRequest.getDescription());
        vendor.setContactPhone(vendorRequest.getContactPhone());

        return vendorRepository.save(vendor);
    }

    public Vendor getVendorById(Long id) {
        return vendorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vendor not found"));
    }

    public Vendor updateVendor(Long id, VendorRequest vendorRequest) {
        Vendor vendor = getVendorById(id);
        
        vendor.setVendorName(vendorRequest.getVendorName());
        vendor.setDescription(vendorRequest.getDescription());
        vendor.setContactEmail(vendorRequest.getContactEmail());
        vendor.setContactPhone(vendorRequest.getContactPhone());
        
        return vendorRepository.save(vendor);
    }

    public void deactivateVendor(Long id) {
        Vendor vendor = getVendorById(id);
        vendor.setIsActive(false);
        vendorRepository.save(vendor);
    }
}