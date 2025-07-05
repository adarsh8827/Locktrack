package com.excisemia.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "locks", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"lock_number", "vendor_id"})
})
@EntityListeners(AuditingEntityListener.class)
public class Lock {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 50)
    @Column(name = "lock_number")
    private String lockNumber;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private Status status = Status.AVAILABLE;

    @Column(name = "assigned_to")
    private Long assignedTo;

    @Column(name = "current_trip_id")
    private Long currentTripId;

    @NotNull
    @Column(name = "vendor_id")
    private Long vendorId;

    @ManyToOne()
    @JoinColumn(name = "vendor_id", insertable = false, updatable = false)
    private Vendor vendor;

    @LastModifiedDate
    @Column(name = "last_updated")
    private LocalDateTime lastUpdated;

    public enum Status {
        AVAILABLE, IN_TRANSIT, ON_REVERSE_TRANSIT, REACHED
    }

    // Constructors
    public Lock() {}

    public Lock(String lockNumber, Long vendorId) {
        this.lockNumber = lockNumber;
        this.vendorId = vendorId;
        this.status = Status.AVAILABLE;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getLockNumber() { return lockNumber; }
    public void setLockNumber(String lockNumber) { this.lockNumber = lockNumber; }

    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }

    public Long getAssignedTo() { return assignedTo; }
    public void setAssignedTo(Long assignedTo) { this.assignedTo = assignedTo; }

    public Long getCurrentTripId() { return currentTripId; }
    public void setCurrentTripId(Long currentTripId) { this.currentTripId = currentTripId; }

    public Long getVendorId() { return vendorId; }
    public void setVendorId(Long vendorId) { this.vendorId = vendorId; }

    public Vendor getVendor() { return vendor; }
    public void setVendor(Vendor vendor) { this.vendor = vendor; }

    public LocalDateTime getLastUpdated() { return lastUpdated; }
    public void setLastUpdated(LocalDateTime lastUpdated) { this.lastUpdated = lastUpdated; }
}