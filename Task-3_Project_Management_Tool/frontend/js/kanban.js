/**
 * CodeAlpha Project Management Tool (TaskAlpha) — Kanban Board & Interactions
 * Author: Veernarayan | CodeAlpha Full Stack Internship Task 3
 */

// Global Toast System
window.showToast = function(message, type = 'info') {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  let icon = 'ℹ️';
  if (type === 'success') icon = '✅';
  if (type === 'error') icon = '⚠️';

  toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
};

const kanban = {
  currentProjectId: 'proj-1',
  cachedTasks: [],
  cachedUsers: [],
  currentModalTask: null,

  async init() {
    await this.loadUsers();
    await this.loadProjects();
    this.bindDropzones();
    this.bindEvents();
    await this.loadBoardTasks(this.currentProjectId);
  },

  async loadUsers() {
    try {
      const res = await api.getUsers();
      if (res.success) {
        this.cachedUsers = res.users;
        this.populateUserSelects();
      }
    } catch (err) {
      console.error('Users load error', err);
    }
  },

  populateUserSelects() {
    const selects = document.querySelectorAll('.user-select-populate');
    selects.forEach(select => {
      select.innerHTML = this.cachedUsers.map(u => `
        <option value="${u.id}">${u.name} (${u.role || 'Member'})</option>
      `).join('');
    });
  },

  async loadProjects() {
    const select = document.getElementById('projectSelector');
    try {
      const res = await api.getProjects();
      if (res.success && select) {
        select.innerHTML = res.projects.map(p => `
          <option value="${p.id}" ${p.id === this.currentProjectId ? 'selected' : ''}>
            ${p.name}
          </option>
        `).join('');

        select.addEventListener('change', (e) => {
          this.currentProjectId = e.target.value;
          this.loadBoardTasks(this.currentProjectId);
        });
      }
    } catch (err) {
      console.error('Projects load error', err);
    }
  },

  bindEvents() {
    // Open New Task Modal Button
    const btnNewTask = document.getElementById('btnOpenNewTaskModal');
    if (btnNewTask) {
      btnNewTask.addEventListener('click', () => this.openNewTaskModal('todo'));
    }

    // Modal Close buttons
    document.querySelectorAll('.modal-close-icon').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const overlay = e.target.closest('.modal-overlay');
        if (overlay) overlay.classList.remove('open');
      });
    });

    // Close on overlay click
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.classList.remove('open');
      });
    });
  },

  bindDropzones() {
    const columns = ['todo', 'inprogress', 'review', 'done'];

    columns.forEach(col => {
      const zone = document.getElementById(`dropzone-${col}`);
      if (!zone) return;

      zone.addEventListener('dragover', (e) => {
        e.preventDefault();
        zone.classList.add('drag-over');
      });

      zone.addEventListener('dragleave', () => {
        zone.classList.remove('drag-over');
      });

      zone.addEventListener('drop', async (e) => {
        e.preventDefault();
        zone.classList.remove('drag-over');
        const taskId = e.dataTransfer.getData('text/plain');
        if (taskId) {
          await this.moveTaskToColumn(taskId, col);
        }
      });
    });
  },

  async loadBoardTasks(projectId) {
    try {
      // Load project details
      const projRes = await api.getProject(projectId);
      if (projRes.success && projRes.project) {
        document.getElementById('boardProjectTitle').textContent = projRes.project.name;
        document.getElementById('boardProjectDesc').textContent = projRes.project.description;
        document.getElementById('boardProgressFill').style.width = `${projRes.project.progress}%`;
        document.getElementById('boardProgressLabel').textContent = `${projRes.project.progress}% Done`;

        // Stack members
        const stack = document.getElementById('membersAvatarStack');
        if (stack && projRes.project.membersList) {
          stack.innerHTML = projRes.project.membersList.map(m => `
            <img src="${m.avatar}" alt="${m.name}" title="${m.name} (${m.role})" class="member-avatar-stacked">
          `).join('');
        }
      }

      // Load tasks
      const tasksRes = await api.getTasks(projectId);
      if (tasksRes.success) {
        this.cachedTasks = tasksRes.tasks;
        this.renderColumns(tasksRes.tasks);
      }
    } catch (err) {
      console.error('Board tasks error', err);
    }
  },

  renderColumns(tasks) {
    const columns = ['todo', 'inprogress', 'review', 'done'];

    columns.forEach(col => {
      const zone = document.getElementById(`dropzone-${col}`);
      const countBadge = document.getElementById(`count-${col}`);
      const colTasks = tasks.filter(t => t.column === col);

      if (countBadge) countBadge.textContent = colTasks.length;

      if (!zone) return;

      if (colTasks.length === 0) {
        zone.innerHTML = `
          <div style="text-align: center; padding: 2rem 0; color: var(--text-muted); font-size: 0.8rem;">
            No tasks here. Drop a card or click + to add.
          </div>
        `;
        return;
      }

      zone.innerHTML = colTasks.map(task => this.renderTaskCard(task)).join('');
    });

    // Rebind drag events on newly rendered cards
    document.querySelectorAll('.task-card').forEach(card => {
      card.addEventListener('dragstart', (e) => {
        card.classList.add('dragging');
        e.dataTransfer.setData('text/plain', card.getAttribute('data-id'));
      });
      card.addEventListener('dragend', () => {
        card.classList.remove('dragging');
      });
    });
  },

  renderTaskCard(task) {
    const priorityClass = `priority-${task.priority.toLowerCase()}`;
    const doneSubtasks = (task.subtasks || []).filter(s => s.done).length;
    const totalSubtasks = (task.subtasks || []).length;
    const commentsCount = (task.comments || []).length;

    const assigneeAvatar = task.assignee 
      ? `<img src="${task.assignee.avatar}" alt="${task.assignee.name}" title="Assigned to ${task.assignee.name}" class="card-assignee-avatar">`
      : `<span style="font-size:0.75rem; color:var(--text-muted);">Unassigned</span>`;

    return `
      <div class="task-card" draggable="true" data-id="${task.id}" onclick="kanban.openTaskDetailsModal('${task.id}')">
        <div class="card-top-meta">
          <span class="priority-badge ${priorityClass}">${task.priority}</span>
          <span style="font-size:0.75rem; color:var(--text-muted); font-family:monospace;">${task.id}</span>
        </div>

        <div class="task-card-title">${task.title}</div>
        ${task.description ? `<div class="task-card-desc">${task.description}</div>` : ''}

        <div class="card-bottom-row">
          <div class="card-indicators-left">
            ${totalSubtasks > 0 ? `
              <div class="indicator-chip" title="Checklist: ${doneSubtasks}/${totalSubtasks} completed">
                <span>✓</span> ${doneSubtasks}/${totalSubtasks}
              </div>
            ` : ''}
            ${commentsCount > 0 ? `
              <div class="indicator-chip" title="${commentsCount} comments">
                <span>💬</span> ${commentsCount}
              </div>
            ` : ''}
            <div class="indicator-chip" title="Due Date: ${task.dueDate}">
              <span>📅</span> ${task.dueDate ? task.dueDate.substring(5) : ''}
            </div>
          </div>
          <div>${assigneeAvatar}</div>
        </div>
      </div>
    `;
  },

  async moveTaskToColumn(taskId, newColumn) {
    const task = this.cachedTasks.find(t => t.id === taskId);
    if (!task || task.column === newColumn) return;

    // Optimistic UI update
    task.column = newColumn;
    this.renderColumns(this.cachedTasks);

    try {
      const res = await api.updateTask(taskId, { column: newColumn });
      if (res.success) {
        window.showToast(`Task moved to ${newColumn.toUpperCase()}`, 'success');
        this.loadBoardTasks(this.currentProjectId); // Recalculate progress
      }
    } catch (err) {
      window.showToast('Failed to update task column', 'error');
      this.loadBoardTasks(this.currentProjectId);
    }
  },

  async openTaskDetailsModal(taskId) {
    const modal = document.getElementById('taskDetailsModal');
    if (!modal) return;

    try {
      const res = await api.getTask(taskId);
      if (res.success && res.task) {
        const task = res.task;
        this.currentModalTask = task;

        document.getElementById('modalTaskIdLabel').textContent = task.id;
        document.getElementById('modalTaskTitleInput').value = task.title;
        document.getElementById('modalTaskDescInput').value = task.description || '';
        document.getElementById('modalTaskPrioritySelect').value = task.priority;
        document.getElementById('modalTaskColumnSelect').value = task.column;
        document.getElementById('modalTaskDueInput').value = task.dueDate || '';
        document.getElementById('modalTaskAssigneeSelect').value = task.assigneeId;

        this.renderModalSubtasks(task);
        this.renderModalComments(task);

        modal.classList.add('open');
      }
    } catch (err) {
      window.showToast('Could not load task details', 'error');
    }
  },

  renderModalSubtasks(task) {
    const list = document.getElementById('modalSubtasksList');
    const progressFill = document.getElementById('modalSubtasksProgressFill');
    const countLabel = document.getElementById('modalSubtasksCountLabel');

    if (!list) return;

    const subtasks = task.subtasks || [];
    const doneCount = subtasks.filter(s => s.done).length;
    const pct = subtasks.length ? Math.round((doneCount / subtasks.length) * 100) : 0;

    if (progressFill) progressFill.style.width = `${pct}%`;
    if (countLabel) countLabel.textContent = `${doneCount} of ${subtasks.length} completed (${pct}%)`;

    if (subtasks.length === 0) {
      list.innerHTML = `<p style="font-size:0.82rem; color:var(--text-muted);">No checklist items. Add one below.</p>`;
      return;
    }

    list.innerHTML = subtasks.map(s => `
      <div class="subtask-item ${s.done ? 'done' : ''}">
        <input type="checkbox" ${s.done ? 'checked' : ''} onchange="kanban.handleToggleSubtask('${task.id}', '${s.id}')">
        <span>${s.text}</span>
      </div>
    `).join('');
  },

  async handleToggleSubtask(taskId, subtaskId) {
    try {
      const res = await api.toggleSubtask(taskId, subtaskId);
      if (res.success && res.task) {
        this.currentModalTask = res.task;
        this.renderModalSubtasks(res.task);
        this.loadBoardTasks(this.currentProjectId);
      }
    } catch (err) {
      window.showToast('Failed to toggle subtask', 'error');
    }
  },

  async handleAddSubtask() {
    const input = document.getElementById('newSubtaskInput');
    if (!input || !input.value.trim() || !this.currentModalTask) return;

    const newSub = {
      id: `st-${Date.now()}`,
      text: input.value.trim(),
      done: false
    };

    const updatedSubtasks = [...(this.currentModalTask.subtasks || []), newSub];

    try {
      const res = await api.updateTask(this.currentModalTask.id, { subtasks: updatedSubtasks });
      if (res.success && res.task) {
        input.value = '';
        this.currentModalTask = res.task;
        this.renderModalSubtasks(res.task);
        this.loadBoardTasks(this.currentProjectId);
        window.showToast('Subtask added', 'success');
      }
    } catch (err) {
      window.showToast('Failed to add subtask', 'error');
    }
  },

  renderModalComments(task) {
    const container = document.getElementById('modalCommentsList');
    if (!container) return;

    const comments = task.comments || [];
    if (comments.length === 0) {
      container.innerHTML = `<p style="font-size:0.82rem; color:var(--text-muted); margin-bottom: 0.5rem;">No comments yet. Start the discussion!</p>`;
      return;
    }

    container.innerHTML = comments.map(c => `
      <div class="comment-entry">
        <img src="${c.userAvatar}" alt="${c.userName}">
        <div class="comment-entry-body">
          <div class="comment-entry-header">
            <span>${c.userName}</span>
            <span style="color:var(--text-muted); font-size:0.75rem;">${c.date}</span>
          </div>
          <div class="comment-entry-text">${c.content}</div>
        </div>
      </div>
    `).join('');
  },

  async handleAddComment() {
    const input = document.getElementById('newCommentInput');
    if (!input || !input.value.trim() || !this.currentModalTask) return;

    try {
      const res = await api.addComment(this.currentModalTask.id, input.value.trim());
      if (res.success && res.comment) {
        input.value = '';
        if (!this.currentModalTask.comments) this.currentModalTask.comments = [];
        this.currentModalTask.comments.push(res.comment);
        this.renderModalComments(this.currentModalTask);
        this.loadBoardTasks(this.currentProjectId);
        window.showToast('Comment posted', 'success');
      }
    } catch (err) {
      window.showToast('Failed to post comment', 'error');
    }
  },

  async handleSaveTaskChanges() {
    if (!this.currentModalTask) return;

    const title = document.getElementById('modalTaskTitleInput').value.trim();
    const description = document.getElementById('modalTaskDescInput').value.trim();
    const priority = document.getElementById('modalTaskPrioritySelect').value;
    const column = document.getElementById('modalTaskColumnSelect').value;
    const dueDate = document.getElementById('modalTaskDueInput').value;
    const assigneeId = document.getElementById('modalTaskAssigneeSelect').value;

    try {
      const res = await api.updateTask(this.currentModalTask.id, {
        title,
        description,
        priority,
        column,
        dueDate,
        assigneeId
      });

      if (res.success) {
        window.showToast('Task updated successfully!', 'success');
        document.getElementById('taskDetailsModal').classList.remove('open');
        this.loadBoardTasks(this.currentProjectId);
      }
    } catch (err) {
      window.showToast('Failed to save task', 'error');
    }
  },

  async handleDeleteCurrentTask() {
    if (!this.currentModalTask) return;
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      const res = await api.deleteTask(this.currentModalTask.id);
      if (res.success) {
        window.showToast('Task deleted', 'info');
        document.getElementById('taskDetailsModal').classList.remove('open');
        this.loadBoardTasks(this.currentProjectId);
      }
    } catch (err) {
      window.showToast('Failed to delete task', 'error');
    }
  },

  openNewTaskModal(defaultColumn = 'todo') {
    const modal = document.getElementById('newTaskModal');
    if (!modal) return;

    document.getElementById('createTaskColumnSelect').value = defaultColumn;
    document.getElementById('createTaskTitleInput').value = '';
    document.getElementById('createTaskDescInput').value = '';
    document.getElementById('createTaskDueInput').value = new Date().toISOString().split('T')[0];

    modal.classList.add('open');
  },

  async handleCreateTaskSubmit(e) {
    e.preventDefault();
    const title = document.getElementById('createTaskTitleInput').value.trim();
    const description = document.getElementById('createTaskDescInput').value.trim();
    const column = document.getElementById('createTaskColumnSelect').value;
    const priority = document.getElementById('createTaskPrioritySelect').value;
    const assigneeId = document.getElementById('createTaskAssigneeSelect').value;
    const dueDate = document.getElementById('createTaskDueInput').value;

    if (!title) return;

    try {
      const res = await api.createTask({
        projectId: this.currentProjectId,
        title,
        description,
        column,
        priority,
        assigneeId,
        dueDate
      });

      if (res.success) {
        window.showToast('New task added to board!', 'success');
        document.getElementById('newTaskModal').classList.remove('open');
        this.loadBoardTasks(this.currentProjectId);
      }
    } catch (err) {
      window.showToast('Failed to create task', 'error');
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  kanban.init();
});
