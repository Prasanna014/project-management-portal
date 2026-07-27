package com.company.projectmanagement.repository;

import com.company.projectmanagement.entity.TaskCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TaskCategoryRepository extends JpaRepository<TaskCategory, Long> {

    Optional<TaskCategory> findByCategoryKey(String categoryKey);

    Optional<TaskCategory> findByCategoryName(String categoryName);

    List<TaskCategory> findByActive(Boolean active);
}
