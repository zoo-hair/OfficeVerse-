export default class TodoManager {
    constructor() {
        this.STORAGE_KEY = 'officeVerse_todos';
        this.todos = JSON.parse(localStorage.getItem(this.STORAGE_KEY)) || {};
    }

    getTasks(deskId) {
        return this.todos[deskId] || [];
    }

    addTask(deskId, text, isImmutable = false) {
        if (!this.todos[deskId]) this.todos[deskId] = [];
        const newTask = {
            id: Date.now() + Math.random(), // Unique ID even for simultaneous tasks
            text: text,
            completed: false,
            immutable: isImmutable // New: boss tasks cannot be deleted
        };
        this.todos[deskId].push(newTask);
        this.save();
        return newTask;
    }

    assignGlobalTask(text) {
        const desks = ['d1', 'd2', 'd3', 'd4', 'd5', 'd6'];
        desks.forEach(desk => {
            this.addTask(desk, text, true);
        });
    }

    toggleTask(deskId, taskId) {
        if (!this.todos[deskId]) return;
        const task = this.todos[deskId].find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            this.save();
        }
    }

    deleteTask(deskId, taskId) {
        if (!this.todos[deskId]) return;
        const task = this.todos[deskId].find(t => t.id === taskId);
        if (task && task.immutable) {
            console.warn('Cannot delete immutable boss task');
            return;
        }
        this.todos[deskId] = this.todos[deskId].filter(t => t.id !== taskId);
        this.save();
    }

    save() {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.todos));
    }
}
