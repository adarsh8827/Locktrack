package com.excisemia.dto;

public class AnalyticsResponse {
    private Long lockId;
    private String lockNumber;
    private Long totalTrips;
    private Double totalDistance;
    private Integer totalDetentionTime;

    // Constructors
    public AnalyticsResponse() {}

    public AnalyticsResponse(Long lockId, String lockNumber, Long totalTrips, 
                           Double totalDistance, Integer totalDetentionTime) {
        this.lockId = lockId;
        this.lockNumber = lockNumber;
        this.totalTrips = totalTrips;
        this.totalDistance = totalDistance;
        this.totalDetentionTime = totalDetentionTime;
    }

    // Getters and Setters
    public Long getLockId() { return lockId; }
    public void setLockId(Long lockId) { this.lockId = lockId; }

    public String getLockNumber() { return lockNumber; }
    public void setLockNumber(String lockNumber) { this.lockNumber = lockNumber; }

    public Long getTotalTrips() { return totalTrips; }
    public void setTotalTrips(Long totalTrips) { this.totalTrips = totalTrips; }

    public Double getTotalDistance() { return totalDistance; }
    public void setTotalDistance(Double totalDistance) { this.totalDistance = totalDistance; }

    public Integer getTotalDetentionTime() { return totalDetentionTime; }
    public void setTotalDetentionTime(Integer totalDetentionTime) { this.totalDetentionTime = totalDetentionTime; }
}