package com.company.projectmanagement.repository;

import com.company.projectmanagement.entity.PersonalAccessToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PersonalAccessTokenRepository extends JpaRepository<PersonalAccessToken, Long> {

    List<PersonalAccessToken> findByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<PersonalAccessToken> findByIdAndUserId(Long id, Long userId);
}
