export default class TodoManager {
    constructor() {
        this.STORAGE_KEY = 'officeVerse_todos';
        this.todos = JSON.parse(localStorage.getItem(this.STORAGE_KEY)) || {};
    }

    getTasks(deskId) {
        return this.todos[deskId] || [];
    }

    addTask(deskId, text) {
        if (!this.todos[deskId]) this.todos[deskId] = [];
        const newTask = {
            id: Date.now(),
            text: text,
            completed: false
        };
        this.todos[deskId].push(newTask);
        this.save();
        return newTask;
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
        this.todos[deskId] = this.todos[deskId].filter(t => t.id !== taskId);
        this.save();
    }

    save() {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.todos));
    }
}
