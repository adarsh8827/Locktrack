package com.excisemia.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class VendorRequest {
    @NotBlank
    @Size(max = 100)
    private String vendorName;

    @NotBlank
    @Size(max = 50)
    private String vendorCode;

    @Size(max = 255)
    private String description;

    @NotBlank
    @Email
    @Size(max = 100)
    private String contactEmail;

    @Size(max = 20)
    private String contactPhone;

    // Constructors
    public VendorRequest() {}

    public VendorRequest(String vendorName, String vendorCode, String contactEmail) {
        this.vendorName = vendorName;
        this.vendorCode = vendorCode;
        this.contactEmail = contactEmail;
    }

    // Getters and Setters
    public String getVendorName() { return vendorName; }
    public void setVendorName(String vendorName) { this.vendorName = vendorName; }

    public String getVendorCode() { return vendorCode; }
    public void setVendorCode(String vendorCode) { this.vendorCode = vendorCode; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getContactEmail() { return contactEmail; }
    public void setContactEmail(String contactEmail) { this.contactEmail = contactEmail; }

    public String getContactPhone() { return contactPhone; }
    public void setContactPhone(String contactPhone) { this.contactPhone = contactPhone; }
}