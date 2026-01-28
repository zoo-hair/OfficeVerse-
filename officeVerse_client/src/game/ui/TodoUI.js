export default class TodoUI {
    constructor(scene) {
        this.scene = scene;
        this.setupTodoListeners();
    }

    setupTodoListeners() {
        const closeBtn = document.getElementById('close-todo-btn');
        if (closeBtn) closeBtn.onclick = () => this.closeTodo();

        const clearBtn = document.getElementById('clear-todo-btn');
        if (clearBtn) {
            clearBtn.onclick = () => {
                if (this.scene.activeDesk) {
                    this.scene.todoManager.clearCompletedTasks(this.scene.activeDesk);
                    this.renderTodos();
                }
            };
        }

        const addBtn = document.getElementById('add-todo-btn');
        if (addBtn) addBtn.onclick = () => this.addTodo();

        const input = document.getElementById('todo-input');
        if (input) {
            input.onkeydown = (e) => {
                if (e.key === 'Enter') this.addTodo();
            };
        }
    }

    openTodo(deskId) {
        this.scene.activeDesk = deskId;
        const title = document.getElementById('todo-title');
        if (title) title.textContent = `Desk ${deskId.toUpperCase()} - To-Do List`;

        const overlay = document.getElementById('todo-list-overlay');
        if (overlay) overlay.style.display = 'flex';

        this.renderTodos();
    }

    closeTodo() {
        this.scene.activeDesk = null;
        const overlay = document.getElementById('todo-list-overlay');
        if (overlay) overlay.style.display = 'none';

        const input = document.getElementById('todo-input');
        if (input) input.value = '';
    }

    addTodo() {
        const input = document.getElementById('todo-input');
        if (!input) return;

        const text = input.value.trim();
        if (text && this.scene.activeDesk) {
            this.scene.todoManager.addTask(this.scene.activeDesk, text);
            input.value = '';
            this.renderTodos();
        }
    }

    renderTodos() {
        if (!this.scene.activeDesk) return;
        const list = document.getElementById('todo-items');
        if (!list) return;

        list.innerHTML = '';
        const tasks = this.scene.todoManager.getTasks(this.scene.activeDesk);

        if (tasks.length === 0) {
            this.updateEmptyState(true);
            this.updateTodoStats(0, 0);
            return;
        }

        this.updateEmptyState(false);
        let completedCount = 0;

        tasks.forEach(task => {
            if (task.completed) completedCount++;
            const li = document.createElement('li');
            li.className = `todo-item ${task.completed ? 'completed' : ''} ${task.immutable ? 'is-boss-task' : ''}`;
            
            const bossBadge = task.immutable ? '<span class="boss-badge">👑 Boss</span>' : '';
            // Only show edit icon for personal tasks
            const editIconHtml = !task.immutable ? '<span class="edit-icon" title="Click to edit">✎</span>' : '';
            const taskTitle = !task.immutable ? 'Double click to edit' : 'Boss Task';
            
            li.innerHTML = `
                <div class="todo-check-wrapper">
                    <input type="checkbox" ${task.completed ? 'checked' : ''}>
                </div>
                <div class="todo-content">
                    <div class="todo-text-row">
                        <span class="todo-text" title="${taskTitle}">${task.text}</span>
                        ${editIconHtml}
                    </div>
                    ${bossBadge}
                </div>
                <button class="delete-task-btn" ${task.immutable ? 'style="display:none"' : ''} title="Delete Task">&times;</button>
            `;

            const textSpan = li.querySelector('.todo-text');
            const editIcon = li.querySelector('.edit-icon');
            
            const handleEdit = () => {
                if (task.immutable) return; // Guard clause for extra safety
                const newText = prompt('Edit task:', task.text);
                if (newText !== null && newText.trim() !== '') {
                    this.scene.todoManager.editTask(this.scene.activeDesk, task.id, newText.trim());
                    this.renderTodos();
                }
            };

            if (textSpan && !task.immutable) textSpan.ondblclick = handleEdit;
            if (editIcon) editIcon.onclick = handleEdit;

            li.querySelector('input').onclick = () => {
                this.scene.todoManager.toggleTask(this.scene.activeDesk, task.id);
                this.renderTodos();
            };

            if (!task.immutable) {
                const deleteBtn = li.querySelector('.delete-task-btn');
                if (deleteBtn) {
                    deleteBtn.onclick = () => {
                        this.scene.todoManager.deleteTask(this.scene.activeDesk, task.id);
                        this.renderTodos();
                    };
                }
            }
            list.appendChild(li);
        });

        this.updateTodoStats(tasks.length, completedCount);
    }

    updateTodoStats(total, completed) {
        const statTotal = document.getElementById('stat-total');
        const statCompleted = document.getElementById('stat-completed');
        const statProgress = document.getElementById('stat-progress');
        
        if (statTotal) statTotal.textContent = total;
        if (statCompleted) statCompleted.textContent = completed;
        if (statProgress) {
            const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
            statProgress.textContent = `${progress}%`;
        }
    }

    updateEmptyState(show) {
        const emptyState = document.getElementById('todo-empty-state');
        const todoList = document.getElementById('todo-items');
        if (emptyState) emptyState.style.display = show ? 'block' : 'none';
        if (todoList) todoList.style.display = show ? 'none' : 'block';
    }
}
