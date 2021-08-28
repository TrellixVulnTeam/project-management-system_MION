package com.projectmanager.repository;

import com.projectmanager.entity.Todo;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface TodoRepository extends JpaRepository<Todo, Integer>, JpaSpecificationExecutor<Todo> {

    Optional<Todo> findByIdAndDeletedIsFalse(Integer id);

    Optional<Todo> findByNameAndDeletedIsFalse(String name);

    Page<Todo> findAllByDeletedIsFalse(Pageable pageable);

    Page<Todo> findByAssignedUserAndDeletedIsFalse(Integer id, Pageable pageable);

    List<Todo> findByAssignedUserAndDeletedIsFalse(Integer id);

    Page<Todo>findByTaskIdAndDeletedIsFalse(Integer id, Pageable pageable);

    List<Todo>findByTaskIdAndDeletedIsFalse(Integer id);

    @Query(value="SELECT * FROM todo t where t.is_deleted = false  AND (?8 = 0 OR t.task_id = ?8) AND UPPER(t.name) LIKE CONCAT('%',UPPER(?1),'%') " +
            "AND (?2 = '' OR t.status = ?2)"  +
            "AND (?3 = '' OR t.priority = ?3) " +
            "AND (?4 = '' OR t.todo_type = ?4) " +
            "AND (?5 = 0 OR t.assigned_user = ?5) " +
            "AND (?9 = 0 OR t.project_id = ?9) " +
            "AND (?6 = '' or t.start_date >= ?6) " +
            "AND (?7 = '' or t.end_date <= ?7) "
            , nativeQuery = true)
    Page<Todo> searchTodo(String name, String status, String priority, String type,
                          Integer assignedFor, String startDate, String endDate, Integer taskId, Integer projectId, Pageable pageable);
}