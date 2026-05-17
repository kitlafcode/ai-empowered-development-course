import { VibeKanbanWebCompanion } from 'vibe-kanban-web-companion';
import { format, formatDistance, compareAsc, parseISO } from 'date-fns';

const STORAGE_KEY = 'todos';
const CATEGORIES_KEY = 'categories';

// Todos array (Feature 1)
let todos = [];
let nextId = 1;

// Categories (Feature 4)
let categories = [];

function saveTodos() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function loadTodos() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === null) return;
    todos = JSON.parse(stored);
    nextId = todos.length > 0 ? Math.max(...todos.map(t => t.id)) + 1 : 1;
}

function saveCategories() {
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
}

function loadCategories() {
    const stored = localStorage.getItem(CATEGORIES_KEY);
    if (stored === null) return;
    categories = JSON.parse(stored);
}

function updateCategoryDatalist() {
    const datalist = document.getElementById('categoriesList');
    datalist.innerHTML = '';
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        datalist.appendChild(option);
    });
}

function updateCategoryFilterSelect() {
    const select = document.getElementById('categoryFilter');
    select.innerHTML = '<option value="all">All categories</option><option value="uncategorized">Uncategorized</option>';
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        select.appendChild(option);
    });
    select.value = currentCategoryFilter;
}

// Current filter (Feature 2)
let currentFilter = 'all';

// Sort by due date (Feature 3)
let sortByDueDate = false;
let sortByCompletedAt = false;
let sortByPriority = true;

let filterFavorites = false;

let currentCategoryFilter = 'all';

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

    const filterButtons = document.querySelectorAll('.filter-btn:not(#sortDueDateBtn):not(#sortCompletedBtn):not(#sortPriorityBtn):not(#filterFavoritesBtn)');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => setFilter(btn.dataset.filter));
    });

    document.getElementById('sortDueDateBtn').addEventListener('click', toggleSortByDueDate);
    document.getElementById('sortCompletedBtn').addEventListener('click', toggleSortByCompletedAt);
    document.getElementById('sortPriorityBtn').addEventListener('click', toggleSortByPriority);
    document.getElementById('filterFavoritesBtn').addEventListener('click', toggleFilterFavorites);
    document.getElementById('categoryFilter').addEventListener('change', e => setCategoryFilter(e.target.value));

    loadCategories();
    updateCategoryDatalist();
    updateCategoryFilterSelect();
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
    const categoryInput = document.getElementById('categoryInput');
    const priorityInput = document.getElementById('priorityInput');
    const text = input.value.trim();
    const category = categoryInput.value.trim();

    if (text === '') return;

    if (category && !categories.includes(category)) {
        categories.push(category);
        saveCategories();
        updateCategoryDatalist();
        updateCategoryFilterSelect();
    }

    todos.push({
        id: nextId++,
        text: text,
        completed: false,
        dueDate: dueDateInput.value || null,
        category: category || null,
        priority: priorityInput.value || null
    });

    input.value = '';
    dueDateInput.value = '';
    categoryInput.value = '';
    priorityInput.value = '';
    saveTodos();
    renderTodos();
}

function toggleTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        todo.completedAt = todo.completed ? new Date().toISOString() : null;
        saveTodos();
        renderTodos();
    }
}

function deleteTodo(id) {
    todos = todos.filter(t => t.id !== id);
    saveTodos();
    renderTodos();
}

function toggleFavorite(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
        todo.favorite = !(todo.favorite ?? false);
        saveTodos();
        renderTodos();
    }
}

function formatCompletedDate(isoStr) {
    return format(parseISO(isoStr), 'MMM d, yyyy');
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

    if (filteredTodos.length === 0 && filterFavorites) {
        todoList.innerHTML = '<li class="empty-state">No favorites yet.</li>';
        return;
    }

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

        let completedDateHtml = '';
        if (todo.completedAt) {
            completedDateHtml = `<span class="todo-completed-date">Completed: ${formatCompletedDate(todo.completedAt)}</span>`;
        }
        const categoryHtml = todo.category
            ? `<span class="category-badge">${escapeHtml(todo.category)}</span>`
            : '';

        const priorityHtml = todo.priority
            ? `<span class="priority-badge priority-${todo.priority}">${todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1)}</span>`
            : '';

        const isFavorited = todo.favorite ?? false;
        const starLabel = isFavorited ? 'Remove from favorites' : 'Mark as favorite';

        li.innerHTML = `
            <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''}>
            <div class="todo-content">
                <span class="todo-text">${escapeHtml(todo.text)}</span>
                ${dueDateHtml}
                ${completedDateHtml}
                ${categoryHtml}
                ${priorityHtml}
            </div>
            <button class="todo-delete">Delete</button>
            <button class="star-btn${isFavorited ? ' favorited' : ''}" aria-label="${starLabel}" aria-pressed="${isFavorited}">${isFavorited ? '★' : '☆'}</button>
        `;

        li.querySelector('.todo-checkbox').addEventListener('change', () => toggleTodo(todo.id));
        li.querySelector('.todo-delete').addEventListener('click', () => deleteTodo(todo.id));
        li.querySelector('.star-btn').addEventListener('click', () => toggleFavorite(todo.id));

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

    if (currentCategoryFilter === 'uncategorized') {
        result = result.filter(t => !t.category);
    } else if (currentCategoryFilter !== 'all') {
        result = result.filter(t => t.category === currentCategoryFilter);
    }

    if (filterFavorites) {
        result = result.filter(t => t.favorite ?? false);
    }

    if (sortByDueDate) {
        result = result.slice().sort((a, b) => {
            if (!a.dueDate && !b.dueDate) return 0;
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;
            return compareAsc(parseDateLocal(a.dueDate), parseDateLocal(b.dueDate));
        });
    }

    if (sortByCompletedAt) {
        result = result.slice().sort((a, b) => {
            if (!a.completedAt && !b.completedAt) return 0;
            if (!a.completedAt) return 1;
            if (!b.completedAt) return -1;
            return compareAsc(parseISO(a.completedAt), parseISO(b.completedAt));
        });
    }

    const PRIORITY_ORDER = { high: 1, medium: 2, low: 3 };
    if (sortByPriority) {
        result = result.slice().sort((a, b) => {
            const pa = PRIORITY_ORDER[a.priority] ?? 4;
            const pb = PRIORITY_ORDER[b.priority] ?? 4;
            return pa - pb;
        });
    }

    return result;
}

// Feature 2: Set filter and update UI
function setFilter(filter) {
    currentFilter = filter;

    const filterButtons = document.querySelectorAll('.filter-btn:not(#sortDueDateBtn):not(#sortCompletedBtn):not(#sortPriorityBtn):not(#filterFavoritesBtn)');
    filterButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.filter === filter) {
            btn.classList.add('active');
        }
    });

    renderTodos();
}

function setCategoryFilter(filter) {
    currentCategoryFilter = filter;
    renderTodos();
}

// Feature 3: Toggle sort by due date
function toggleSortByDueDate() {
    sortByDueDate = !sortByDueDate;
    if (sortByDueDate) {
        sortByCompletedAt = false;
        sortByPriority = false;
        document.getElementById('sortCompletedBtn').classList.remove('active');
        document.getElementById('sortPriorityBtn').classList.remove('active');
    }
    document.getElementById('sortDueDateBtn').classList.toggle('active', sortByDueDate);
    renderTodos();
}

function toggleSortByCompletedAt() {
    sortByCompletedAt = !sortByCompletedAt;
    if (sortByCompletedAt) {
        sortByDueDate = false;
        sortByPriority = false;
        document.getElementById('sortDueDateBtn').classList.remove('active');
        document.getElementById('sortPriorityBtn').classList.remove('active');
    }
    document.getElementById('sortCompletedBtn').classList.toggle('active', sortByCompletedAt);
    renderTodos();
}

function toggleSortByPriority() {
    sortByPriority = !sortByPriority;
    if (sortByPriority) {
        sortByDueDate = false;
        sortByCompletedAt = false;
        document.getElementById('sortDueDateBtn').classList.remove('active');
        document.getElementById('sortCompletedBtn').classList.remove('active');
    }
    document.getElementById('sortPriorityBtn').classList.toggle('active', sortByPriority);
    renderTodos();
}

function toggleFilterFavorites() {
    filterFavorites = !filterFavorites;
    const btn = document.getElementById('filterFavoritesBtn');
    btn.classList.toggle('active', filterFavorites);
    btn.setAttribute('aria-pressed', filterFavorites ? 'true' : 'false');
    renderTodos();
}

// Utility function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
