package com.excisemia.service;

import com.excisemia.dto.AnalyticsResponse;
import com.excisemia.model.Lock;
import com.excisemia.model.Trip;
import com.excisemia.repository.LockRepository;
import com.excisemia.repository.TripRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    @Autowired
    private LockRepository lockRepository;

    @Autowired
    private TripRepository tripRepository;

    public List<AnalyticsResponse> getAnalyticsByVendor(Long vendorId) {
        List<Lock> locks = lockRepository.findByVendorId(vendorId);
        
        return locks.stream().map(lock -> {
            List<Trip> trips = tripRepository.findByLockIdAndVendorId(lock.getId(), vendorId);
            
            Long totalTrips = (long) trips.size();
            Double totalDistance = trips.stream()
                    .mapToDouble(trip -> trip.getDistanceKm() != null ? trip.getDistanceKm() : 0.0)
                    .sum();
            Integer totalDetentionTime = trips.stream()
                    .mapToInt(trip -> trip.getDetentionMins() != null ? trip.getDetentionMins() : 0)
                    .sum();
            
            return new AnalyticsResponse(
                    lock.getId(),
                    lock.getLockNumber(),
                    totalTrips,
                    totalDistance,
                    totalDetentionTime
            );
        }).collect(Collectors.toList());
    }
}