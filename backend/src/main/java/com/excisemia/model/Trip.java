package com.excisemia.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "trips")
@EntityListeners(AuditingEntityListener.class)
public class Trip {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Column(name = "lock_id")
    private Long lockId;

    @NotNull
    @Column(name = "schedule_id")
    private Long scheduleId;

    @NotNull
    @Column(name = "vendor_id")
    private Long vendorId;

    @ManyToOne()
    @JoinColumn(name = "vendor_id", insertable = false, updatable = false)
    private Vendor vendor;

    @CreatedDate
    @Column(name = "start_time", nullable = false, updatable = false)
    private LocalDateTime startTime;

    @Column(name = "end_time")
    private LocalDateTime endTime;

    @Column(name = "distance_km")
    private Double distanceKm;

    @Column(name = "detention_mins")
    private Integer detentionMins;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private Status status = Status.ACTIVE;

    public enum Status {
        ACTIVE, COMPLETED
    }

    // Constructors
    public Trip() {}

    public Trip(Long lockId, Long scheduleId, Long vendorId) {
        this.lockId = lockId;
        this.scheduleId = scheduleId;
        this.vendorId = vendorId;
        this.status = Status.ACTIVE;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getLockId() { return lockId; }
    public void setLockId(Long lockId) { this.lockId = lockId; }

    public Long getScheduleId() { return scheduleId; }
    public void setScheduleId(Long scheduleId) { this.scheduleId = scheduleId; }

    public Long getVendorId() { return vendorId; }
    public void setVendorId(Long vendorId) { this.vendorId = vendorId; }

    public Vendor getVendor() { return vendor; }
    public void setVendor(Vendor vendor) { this.vendor = vendor; }

    public LocalDateTime getStartTime() { return startTime; }
    public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }

    public LocalDateTime getEndTime() { return endTime; }
    public void setEndTime(LocalDateTime endTime) { this.endTime = endTime; }

    public Double getDistanceKm() { return distanceKm; }
    public void setDistanceKm(Double distanceKm) { this.distanceKm = distanceKm; }

    public Integer getDetentionMins() { return detentionMins; }
    public void setDetentionMins(Integer detentionMins) { this.detentionMins = detentionMins; }

    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }
}