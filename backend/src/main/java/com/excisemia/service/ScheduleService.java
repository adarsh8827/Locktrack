package com.excisemia.service;

import com.excisemia.dto.ScheduleRequest;
import com.excisemia.model.Schedule;
import com.excisemia.repository.ScheduleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ScheduleService {

    @Autowired
    private ScheduleRepository scheduleRepository;

    public List<Schedule> getSchedulesByVendor(Long vendorId) {
        return scheduleRepository.findByVendorIdOrderByDateDesc(vendorId);
    }

    public Schedule createSchedule(ScheduleRequest scheduleRequest, Long createdBy, Long vendorId) {
        Schedule schedule = new Schedule(
                scheduleRequest.getDate(),
                scheduleRequest.getNote(),
                createdBy,
                vendorId
        );
        return scheduleRepository.save(schedule);
    }

    public void deleteSchedule(Long id, Long vendorId) {
        Schedule schedule = scheduleRepository.findByIdAndVendorId(id, vendorId)
                .orElseThrow(() -> new RuntimeException("Schedule not found or access denied"));
        scheduleRepository.delete(schedule);
    }
}