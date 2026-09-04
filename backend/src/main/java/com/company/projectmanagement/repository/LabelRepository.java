package com.company.projectmanagement.repository;

import com.company.projectmanagement.entity.Label;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LabelRepository extends JpaRepository<Label, Long> {

    Optional<Label> findByLabelKey(String labelKey);

    Optional<Label> findByLabelName(String labelName);

    List<Label> findByActive(Boolean active);
}