package com.excisemia.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class RemarkRequest {
    @NotNull
    private Long lockId;

    @NotBlank
    @Size(max = 1000)
    private String message;

    // Constructors
    public RemarkRequest() {}

    public RemarkRequest(Long lockId, String message) {
        this.lockId = lockId;
        this.message = message;
    }

    // Getters and Setters
    public Long getLockId() { return lockId; }
    public void setLockId(Long lockId) { this.lockId = lockId; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}