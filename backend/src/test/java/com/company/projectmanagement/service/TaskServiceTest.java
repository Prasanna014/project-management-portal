package com.company.projectmanagement.service;

import com.company.projectmanagement.dto.TaskDto;
import com.company.projectmanagement.entity.Task;
import com.company.projectmanagement.entity.TaskPriority;
import com.company.projectmanagement.entity.TaskStatus;
import com.company.projectmanagement.entity.WorkflowState;
import com.company.projectmanagement.exception.BadRequestException;
import com.company.projectmanagement.repository.TaskCategoryRepository;
import com.company.projectmanagement.repository.TaskPriorityRepository;
import com.company.projectmanagement.repository.TaskRepository;
import com.company.projectmanagement.repository.TaskStatusRepository;
import com.company.projectmanagement.repository.WorkflowStateRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TaskServiceTest {

    @Mock
    private TaskRepository taskRepository;
    @Mock
    private TaskStatusRepository taskStatusRepository;
    @Mock
    private TaskPriorityRepository taskPriorityRepository;
    @Mock
    private TaskCategoryRepository taskCategoryRepository;
    @Mock
    private WorkflowStateRepository workflowStateRepository;

    private TaskService taskService;

    @BeforeEach
    void setUp() {
        taskService = new TaskService(
                taskRepository,
                taskStatusRepository,
                taskPriorityRepository,
                taskCategoryRepository,
                workflowStateRepository
        );
    }

    @Test
    void createTaskShouldResolveStatusAndPriorityByIds() {
        TaskStatus status = TaskStatus.builder().id(11L).statusName("Open").build();
        TaskPriority priority = TaskPriority.builder().id(22L).priorityName("High").build();
        WorkflowState workflowState = WorkflowState.builder().id(33L).build();

        when(taskStatusRepository.findById(11L)).thenReturn(Optional.of(status));
        when(taskPriorityRepository.findById(22L)).thenReturn(Optional.of(priority));
        when(workflowStateRepository.findById(33L)).thenReturn(Optional.of(workflowState));
        when(taskRepository.save(any(Task.class))).thenAnswer(inv -> inv.getArgument(0));

        TaskDto dto = TaskDto.builder()
                .taskNo("T-101")
                .projectId(1L)
                .issueActionItem("Fix API")
                .statusId(11L)
                .priorityId(22L)
                .workflowStateId(33L)
                .build();

        TaskDto saved = taskService.createTask(dto);

        ArgumentCaptor<Task> taskCaptor = ArgumentCaptor.forClass(Task.class);
        verify(taskRepository).save(taskCaptor.capture());
        Task persisted = taskCaptor.getValue();

        assertThat(persisted.getStatusId()).isEqualTo(11L);
        assertThat(persisted.getStatus()).isEqualTo("Open");
        assertThat(persisted.getPriorityId()).isEqualTo(22L);
        assertThat(persisted.getPriority()).isEqualTo("High");
        assertThat(persisted.getWorkflowStateId()).isEqualTo(33L);

        assertThat(saved.getStatusId()).isEqualTo(11L);
        assertThat(saved.getPriorityId()).isEqualTo(22L);
    }

    @Test
    void createTaskShouldFallbackToLegacyNamesWhenIdsMissing() {
        TaskStatus status = TaskStatus.builder().id(4L).statusName("In Progress").build();
        TaskPriority priority = TaskPriority.builder().id(7L).priorityName("Medium").build();

        when(taskStatusRepository.findByStatusName("In Progress")).thenReturn(Optional.of(status));
        when(taskPriorityRepository.findByPriorityName("Medium")).thenReturn(Optional.of(priority));
        when(taskRepository.save(any(Task.class))).thenAnswer(inv -> inv.getArgument(0));

        TaskDto dto = TaskDto.builder()
                .taskNo("T-102")
                .projectId(1L)
                .issueActionItem("Write tests")
                .status("In Progress")
                .priority("Medium")
                .build();

        taskService.createTask(dto);

        ArgumentCaptor<Task> taskCaptor = ArgumentCaptor.forClass(Task.class);
        verify(taskRepository).save(taskCaptor.capture());
        Task persisted = taskCaptor.getValue();

        assertThat(persisted.getStatusId()).isEqualTo(4L);
        assertThat(persisted.getPriorityId()).isEqualTo(7L);
    }

    @Test
    void createTaskShouldThrowWhenStatusNameUnknown() {
        when(taskStatusRepository.findByStatusName("Unknown")).thenReturn(Optional.empty());

        TaskDto dto = TaskDto.builder()
                .taskNo("T-103")
                .projectId(1L)
                .issueActionItem("Bad status")
                .status("Unknown")
                .build();

        assertThatThrownBy(() -> taskService.createTask(dto))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Invalid status");
    }
}
