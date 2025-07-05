package com.excisemia.controller;

import com.excisemia.dto.RemarkRequest;
import com.excisemia.model.Remark;
import com.excisemia.security.UserPrincipal;
import com.excisemia.service.RemarkService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/remarks")
public class RemarkController {

    @Autowired
    private RemarkService remarkService;

    @GetMapping
    public ResponseEntity<List<Remark>> getAllRemarks(Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        List<Remark> remarks = remarkService.getRemarksByVendor(userPrincipal.getVendorId());
        return ResponseEntity.ok(remarks);
    }

    @GetMapping("/lock/{lockId}")
    public ResponseEntity<List<Remark>> getRemarksByLock(@PathVariable Long lockId, Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        List<Remark> remarks = remarkService.getRemarksByLockAndVendor(lockId, userPrincipal.getVendorId());
        return ResponseEntity.ok(remarks);
    }

    @PostMapping
    public ResponseEntity<Remark> createRemark(@Valid @RequestBody RemarkRequest remarkRequest,
                                             Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        Remark remark = remarkService.createRemark(remarkRequest, userPrincipal);
        return ResponseEntity.ok(remark);
    }
}