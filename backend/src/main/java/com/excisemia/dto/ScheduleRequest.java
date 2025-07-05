package com.excisemia.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public class ScheduleRequest {
    @NotNull
    private LocalDate date;

    @Size(max = 500)
    private String note;

    // Constructors
    public ScheduleRequest() {}

    public ScheduleRequest(LocalDate date, String note) {
        this.date = date;
        this.note = note;
    }

    // Getters and Setters
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
}