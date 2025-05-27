let currentPage = 1;
const pageSize = 5;

const todosList = document.getElementById("todosList");
const categorySelect = document.getElementById("categorySelect");
const filterCategorySelect = document.getElementById("filterCategorySelect");
const filterDoneSelect = document.getElementById("filterDoneSelect");
const todoInput = document.getElementById("todoInput");
const addTodoBtn = document.getElementById("addTodoBtn");
const prevPageBtn = document.getElementById("prevPageBtn");
const nextPageBtn = document.getElementById("nextPageBtn");
const pageInfo = document.getElementById("pageInfo");

const apiUrl = "/.netlify/functions";

const editModal = document.getElementById("editModal");
const editTodoInput = document.getElementById("editTodoInput");
const editCategorySelect = document.getElementById("editCategorySelect");
const editDoneCheckbox = document.getElementById("editDoneCheckbox");
const saveEditBtn = document.getElementById("saveEditBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");

let editingTodoId = null;

async function fetchCategories() {
  try {
    const res = await fetch(`${apiUrl}/getCategories`);
    if (!res.ok) throw new Error("Помилка завантаження категорій");
    const categories = await res.json();

    [categorySelect, filterCategorySelect, editCategorySelect].forEach(select => {
      select.innerHTML = '<option value="">Оберіть категорію</option>';
      categories.forEach(cat => {
        const option = document.createElement("option");
        option.value = cat._id;
        option.textContent = cat.name;
        select.appendChild(option);
      });
    });
  } catch (error) {
    console.error(error);
  }
}

async function fetchTodos() {
  const category = filterCategorySelect.value;
  const completedFilter = filterDoneSelect.value;
  const skip = (currentPage - 1) * pageSize;

  const params = new URLSearchParams({ skip, take: pageSize });

  if (category) params.append("categoryId", category);
  if (completedFilter === "done") params.append("completed", "true");
  else if (completedFilter === "notdone") params.append("completed", "false");

  try {
    const res = await fetch(`${apiUrl}/getTodos?${params.toString()}`);
    if (!res.ok) throw new Error("Помилка завантаження завдань");
    const todos = await res.json();

    renderTodos(todos);
    updatePageInfo(todos.length);
  } catch (error) {
    console.error(error);
  }
}

function renderTodos(todos) {
  todosList.innerHTML = "";
  if (todos.length === 0) {
    todosList.textContent = "Завдань не знайдено.";
    return;
  }

  todos.forEach(todo => {
  const li = document.createElement("li");

  li.textContent = `${todo.title} [${todo.done ? "✓" : "✗"}]`;
  if (todo.category?.name) {
    li.textContent += ` - Категорія: ${todo.category.name}`;
  }

  const btnContainer = document.createElement("div");
  btnContainer.style.marginLeft = "auto";
  btnContainer.style.display = "flex";
  btnContainer.style.gap = "8px";

  const editBtn = document.createElement("button");
  editBtn.textContent = "Редагувати";
  editBtn.onclick = () => openEditModal(todo);

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "Видалити";
  deleteBtn.onclick = () => deleteTodo(todo._id);

  btnContainer.appendChild(editBtn);
  btnContainer.appendChild(deleteBtn);

  li.textContent = "";
  
  const textSpan = document.createElement("span");
  textSpan.textContent = `${todo.title} [${todo.done ? "✅" : "❌"}]`;
  if (todo.category?.name) {
    textSpan.textContent += ` - Категорія: ${todo.category.name}`;
  }

  li.style.display = "flex";
  li.style.alignItems = "center";

  li.appendChild(textSpan);
  li.appendChild(btnContainer);

  todosList.appendChild(li);
});
}

function updatePageInfo(fetchedCount) {
  pageInfo.textContent = `Сторінка ${currentPage}`;
  prevPageBtn.disabled = currentPage === 1;
  nextPageBtn.disabled = fetchedCount < pageSize;
}

addTodoBtn.addEventListener("click", async () => {
  const title = todoInput.value.trim();
  const categoryId = categorySelect.value;

  if (!title) {
    alert("Введіть назву завдання");
    return;
  }

  try {
    const res = await fetch(`${apiUrl}/createTodo`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, categoryId }),
    });
    if (!res.ok) throw new Error("Помилка додавання завдання");
    todoInput.value = "";
    await fetchTodos();
  } catch (error) {
    console.error(error);
  }
});

function openEditModal(todo) {
  editingTodoId = todo._id;
  editTodoInput.value = todo.title;
  editCategorySelect.value = todo.categoryId || "";
  editDoneCheckbox.checked = todo.done;
  editModal.style.display = "block";
}

saveEditBtn.addEventListener("click", async () => {
  const title = editTodoInput.value.trim();
  const categoryId = editCategorySelect.value;
  const done = editDoneCheckbox.checked;

  if (!title) {
    alert("Назва не може бути пустою");
    return;
  }

  try {
    const res = await fetch(`${apiUrl}/updateTodo/${editingTodoId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, categoryId, done }),
    });
    if (!res.ok) throw new Error("Помилка оновлення завдання");

    editModal.style.display = "none";
    await fetchTodos();
  } catch (error) {
    console.error(error);
  }
});

cancelEditBtn.addEventListener("click", () => {
  editModal.style.display = "none";
});

async function deleteTodo(id) {
  if (!confirm("Видалити це завдання?")) return;

  try {
    const res = await fetch(`${apiUrl}/deleteTodo?id=${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Помилка видалення");
    await fetchTodos();
  } catch (error) {
    console.error(error);
  }
}

prevPageBtn.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    fetchTodos();
  }
});

nextPageBtn.addEventListener("click", () => {
  currentPage++;
  fetchTodos();
});

filterCategorySelect.addEventListener("change", () => {
  currentPage = 1;
  fetchTodos();
});

filterDoneSelect.addEventListener("change", () => {
  currentPage = 1;
  fetchTodos();
});

(async () => {
  await fetchCategories();
  await fetchTodos();
})();
