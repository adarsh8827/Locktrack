package com.excisemia.controller;

import com.excisemia.dto.AnalyticsResponse;
import com.excisemia.security.UserPrincipal;
import com.excisemia.service.AnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    @Autowired
    private AnalyticsService analyticsService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPERADMIN')")
    public ResponseEntity<List<AnalyticsResponse>> getAnalytics(Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        List<AnalyticsResponse> analytics = analyticsService.getAnalyticsByVendor(userPrincipal.getVendorId());
        return ResponseEntity.ok(analytics);
    }
}