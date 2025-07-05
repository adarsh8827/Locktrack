package com.excisemia.service;

import com.excisemia.dto.RemarkRequest;
import com.excisemia.model.Remark;
import com.excisemia.repository.RemarkRepository;
import com.excisemia.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RemarkService {

    @Autowired
    private RemarkRepository remarkRepository;

    public List<Remark> getRemarksByVendor(Long vendorId) {
        return remarkRepository.findByVendorIdOrderByTimestampDesc(vendorId);
    }

    public List<Remark> getRemarksByLockAndVendor(Long lockId, Long vendorId) {
        return remarkRepository.findByLockIdAndVendorIdOrderByTimestampDesc(lockId, vendorId);
    }

    public Remark createRemark(RemarkRequest remarkRequest, UserPrincipal userPrincipal) {
        Remark remark = new Remark(
                remarkRequest.getLockId(),
                userPrincipal.getId(),
                userPrincipal.getName(),
                remarkRequest.getMessage(),
                userPrincipal.getVendorId()
        );
        return remarkRepository.save(remark);
    }
}