package com.umc.movie.service;

import com.umc.movie.dto.CreateRatingRequest;
import com.umc.movie.dto.UpdateRatingRequest;
import com.umc.movie.entity.Member;
import com.umc.movie.entity.Rating;
import com.umc.movie.exception.ApiException;
import com.umc.movie.repository.MemberRepository;
import com.umc.movie.repository.RatingRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RatingServiceTest {

    @Mock MemberRepository memberRepository;
    @Mock RatingRepository ratingRepository;
    @InjectMocks RatingService ratingService;

    @Test
    void registeringDuplicateRatingReturnsRating409_1() {
        Member member = Member.builder().email("owner@example.com").build();
        when(memberRepository.findById(1L)).thenReturn(Optional.of(member));
        when(ratingRepository.existsByMember_MemberIdAndMovieId(1L, 550L)).thenReturn(true);

        assertThatExceptionOfType(ApiException.class)
                .isThrownBy(() -> ratingService.create(1L, new CreateRatingRequest(550L, 4, null)))
                .satisfies(error -> {
                    assertThat(error.getStatus()).isEqualTo(HttpStatus.CONFLICT);
                    assertThat(error.getCode()).isEqualTo("RATING409_1");
                });
        verify(ratingRepository, never()).save(any(Rating.class));
    }

    @Test
    void updatingAnotherMembersRatingReturnsRating403_1() {
        Member owner = mock(Member.class);
        when(owner.getMemberId()).thenReturn(1L);
        Rating rating = Rating.builder().member(owner).movieId(550L).score(4).build();
        when(ratingRepository.findById(10L)).thenReturn(Optional.of(rating));

        assertThatExceptionOfType(ApiException.class)
                .isThrownBy(() -> ratingService.update(2L, 10L, new UpdateRatingRequest(5, null)))
                .satisfies(error -> {
                    assertThat(error.getStatus()).isEqualTo(HttpStatus.FORBIDDEN);
                    assertThat(error.getCode()).isEqualTo("RATING403_1");
                });
        assertThat(rating.getScore()).isEqualTo(4);
        verify(ratingRepository, never()).save(any(Rating.class));
    }
}
