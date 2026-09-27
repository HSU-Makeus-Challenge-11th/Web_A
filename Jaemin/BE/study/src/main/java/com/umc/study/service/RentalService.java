package com.umc.study.service;

import com.umc.study.repository.RentalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class RentalService {

    private final RentalRepository rentalRepository;

    public void createRental(Map<String, Object> body) {
        rentalRepository.save(body);
    }

    public void returnRental(Long rentalId) {
        int updatedCount = rentalRepository.updateReturnedAt(rentalId);

        // 존재하지 않는 대여 번호라면 404 오류를 반환합니다.
        if (updatedCount == 0) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "대여 기록을 찾을 수 없습니다."
            );
        }
    }
}