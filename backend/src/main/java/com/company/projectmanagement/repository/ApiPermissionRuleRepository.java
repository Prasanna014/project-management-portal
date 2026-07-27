package com.company.projectmanagement.repository;

import com.company.projectmanagement.entity.ApiPermissionRule;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApiPermissionRuleRepository extends JpaRepository<ApiPermissionRule, Long> {

    List<ApiPermissionRule> findByActiveTrue();

    List<ApiPermissionRule> findByActiveTrueAndHttpMethod(String httpMethod);

        @Query("""
                        select r
                        from ApiPermissionRule r
                        join fetch r.permission p
                        where r.active = true
                            and upper(r.httpMethod) = upper(:httpMethod)
                            and p.active = true
                        """)
        List<ApiPermissionRule> findActiveRulesByHttpMethodWithPermission(@Param("httpMethod") String httpMethod);
}
