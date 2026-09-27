package com.umc.study.repository;

import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.Map;

@Repository
@RequiredArgsConstructor
public class RentalRepository {

    private final JdbcTemplate jdbcTemplate;

    public void save(Map<String, Object> body) {
        // 대여일은 현재 시간, 반납 예정일은 7일 뒤로 설정합니다.
        String sql = "INSERT INTO rental "
                + "(user_id, book_id, rented_at, due_at, returned_at) "
                + "VALUES (?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY), NULL)";

        jdbcTemplate.update(
                sql,
                body.get("userId"),
                body.get("bookId")
        );
    }

    public int updateReturnedAt(Long rentalId) {
        String sql = "UPDATE rental SET returned_at = NOW() WHERE rental_id = ?";

        // 수정된 행의 개수를 반환합니다.
        return jdbcTemplate.update(sql, rentalId);
    }
}