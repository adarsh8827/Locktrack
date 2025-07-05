package com.excisemia.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class LockRequest {
    @NotBlank
    @Size(max = 50)
    private String lockNumber;

    // Constructors
    public LockRequest() {}

    public LockRequest(String lockNumber) {
        this.lockNumber = lockNumber;
    }

    // Getters and Setters
    public String getLockNumber() { return lockNumber; }
    public void setLockNumber(String lockNumber) { this.lockNumber = lockNumber; }
}