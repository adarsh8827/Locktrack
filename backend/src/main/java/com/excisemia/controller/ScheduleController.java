package com.excisemia.controller;

import com.excisemia.dto.ScheduleRequest;
import com.excisemia.model.Schedule;
import com.excisemia.security.UserPrincipal;
import com.excisemia.service.ScheduleService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/schedules")
public class ScheduleController {

    @Autowired
    private ScheduleService scheduleService;

    @GetMapping
    public ResponseEntity<List<Schedule>> getAllSchedules(Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        List<Schedule> schedules = scheduleService.getSchedulesByVendor(userPrincipal.getVendorId());
        return ResponseEntity.ok(schedules);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPERADMIN')")
    public ResponseEntity<Schedule> createSchedule(@Valid @RequestBody ScheduleRequest scheduleRequest,
                                                 Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        Schedule schedule = scheduleService.createSchedule(scheduleRequest, userPrincipal.getId(), userPrincipal.getVendorId());
        return ResponseEntity.ok(schedule);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPERADMIN')")
    public ResponseEntity<?> deleteSchedule(@PathVariable Long id, Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        scheduleService.deleteSchedule(id, userPrincipal.getVendorId());
        return ResponseEntity.ok().build();
    }
}