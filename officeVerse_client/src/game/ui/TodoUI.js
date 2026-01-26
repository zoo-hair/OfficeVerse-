export default class TodoUI {
    constructor(scene) {
        this.scene = scene;
        this.setupTodoListeners();
    }

    setupTodoListeners() {
        const closeBtn = document.getElementById('close-todo-btn');
        if (closeBtn) closeBtn.onclick = () => this.closeTodo();

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

        tasks.forEach(task => {
            const li = document.createElement('li');
            li.className = `todo-item ${task.completed ? 'completed' : ''}`;
            li.innerHTML = `
                <input type="checkbox" ${task.completed ? 'checked' : ''}>
                <span>${task.text}</span>
                <button class="delete-task-btn" ${task.immutable ? 'style="display:none"' : ''}>&times;</button>
            `;

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
    }
}
