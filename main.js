import { VibeKanbanWebCompanion } from 'vibe-kanban-web-companion';
import { format, formatDistance, compareAsc, parseISO } from 'date-fns';

const STORAGE_KEY = 'todos';

// Todos array (Feature 1)
let todos = [];
let nextId = 1;

function saveTodos() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function loadTodos() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === null) return;
    todos = JSON.parse(stored);
    nextId = todos.length > 0 ? Math.max(...todos.map(t => t.id)) + 1 : 1;
}

// Current filter (Feature 2)
let currentFilter = 'all';

// Sort by due date (Feature 3)
let sortByDueDate = false;

document.addEventListener('DOMContentLoaded', () => {
    init();
    initVibeKanban();
});

function init() {
    const addBtn = document.getElementById('addBtn');
    const todoInput = document.getElementById('todoInput');

    addBtn.addEventListener('click', addTodo);
    todoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTodo();
    });

    const filterButtons = document.querySelectorAll('.filter-btn:not(#sortDueDateBtn)');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => setFilter(btn.dataset.filter));
    });

    document.getElementById('sortDueDateBtn').addEventListener('click', toggleSortByDueDate);

    loadTodos();
    renderTodos();
}

function initVibeKanban() {
    const companion = new VibeKanbanWebCompanion();
    companion.render(document.body);
}

// Feature 1: Add, toggle, delete todos
function addTodo() {
    const input = document.getElementById('todoInput');
    const dueDateInput = document.getElementById('dueDateInput');
    const text = input.value.trim();

    if (text === '') return;

    todos.push({
        id: nextId++,
        text: text,
        completed: false,
        dueDate: dueDateInput.value || null
    });

    input.value = '';
    dueDateInput.value = '';
    saveTodos();
    renderTodos();
}

function toggleTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        saveTodos();
        renderTodos();
    }
}

function deleteTodo(id) {
    todos = todos.filter(t => t.id !== id);
    saveTodos();
    renderTodos();
}

// Feature 3: Due date formatting
function parseDateLocal(dateStr) {
    // Parse yyyy-MM-dd as local time to avoid UTC midnight shifting the displayed day
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
}

function getDueDateStatus(dateStr) {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    if (dateStr < todayStr) return 'overdue';
    if (dateStr === todayStr) return 'today';
    return 'upcoming';
}

function formatDueDateDisplay(dateStr) {
    const date = parseDateLocal(dateStr);
    const formatted = format(date, 'MMM d, yyyy');
    const relative = formatDistance(date, new Date(), { addSuffix: true });
    return `${formatted} · ${relative}`;
}

// Feature 1: Render todos
function renderTodos() {
    const todoList = document.getElementById('todoList');
    const filteredTodos = getFilteredTodos();

    todoList.innerHTML = '';

    filteredTodos.forEach(todo => {
        const li = document.createElement('li');
        li.className = 'todo-item';
        if (todo.completed) li.classList.add('completed');

        let dueDateHtml = '';
        if (todo.dueDate) {
            const status = getDueDateStatus(todo.dueDate);
            dueDateHtml = `<span class="todo-due-date ${status}">${escapeHtml(formatDueDateDisplay(todo.dueDate))}</span>`;
        }

        li.innerHTML = `
            <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''}>
            <div class="todo-content">
                <span class="todo-text">${escapeHtml(todo.text)}</span>
                ${dueDateHtml}
            </div>
            <button class="todo-delete">Delete</button>
        `;

        li.querySelector('.todo-checkbox').addEventListener('change', () => toggleTodo(todo.id));
        li.querySelector('.todo-delete').addEventListener('click', () => deleteTodo(todo.id));

        todoList.appendChild(li);
    });
}

// Feature 2: Filter todos based on current filter
function getFilteredTodos() {
    let result;
    if (currentFilter === 'active') {
        result = todos.filter(t => !t.completed);
    } else if (currentFilter === 'completed') {
        result = todos.filter(t => t.completed);
    } else {
        result = [...todos];
    }

    if (sortByDueDate) {
        result = result.slice().sort((a, b) => {
            if (!a.dueDate && !b.dueDate) return 0;
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;
            return compareAsc(parseDateLocal(a.dueDate), parseDateLocal(b.dueDate));
        });
    }

    return result;
}

// Feature 2: Set filter and update UI
function setFilter(filter) {
    currentFilter = filter;

    const filterButtons = document.querySelectorAll('.filter-btn:not(#sortDueDateBtn)');
    filterButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.filter === filter) {
            btn.classList.add('active');
        }
    });

    renderTodos();
}

// Feature 3: Toggle sort by due date
function toggleSortByDueDate() {
    sortByDueDate = !sortByDueDate;
    const sortBtn = document.getElementById('sortDueDateBtn');
    sortBtn.classList.toggle('active', sortByDueDate);
    renderTodos();
}

// Utility function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
