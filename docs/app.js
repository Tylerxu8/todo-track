import { addTask, toggle, remove, setDueDate, toggleFlag, findList, replaceListTasks, addList, removeList, reorder } from "./todo.js";

const form = document.querySelector("#new-task");
const input = document.querySelector("#task-input");
const list = document.querySelector("#list");
const counter = document.querySelector("#counter");
const savedLists = localStorage.getItem("todo-track-lists");
const savedFlat = localStorage.getItem("todo-track");

let lists = [];
let activeListId = 1;
let nextListId = 2;
let nextTaskId = 1;

if (savedLists) {
  try {
    const parsed = JSON.parse(savedLists);
    lists = parsed.lists;
    activeListId = parsed.activeListId;
  } catch {
    lists = [{ id: 1, name: "My List", tasks: [] }];
  }
} else if (savedFlat) {
  try {
    const oldTasks = JSON.parse(savedFlat);
    lists = [{ id: 1, name: "My List", tasks: oldTasks }];
  } catch {
    lists = [{ id: 1, name: "My List", tasks: [] }];
  }
} else {
  lists = [{ id: 1, name: "My List", tasks: [] }];
}

const allIds = lists.flatMap((l) => l.tasks.map((t) => t.id));
nextTaskId = Math.max(0, ...allIds) + 1;
nextListId = Math.max(0, ... lists.map((l) => l.id)) + 1;

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

function currentTasks() {
  return findList(lists, activeListId).tasks;
}

function updateCurrentTasks(newTasks) {
  lists = replaceListTasks(lists, activeListId, newTasks);
}

function renderTabs() {
  const tabs = document.querySelector("#list-tabs");
  tabs.innerHTML = "";

  for (const l of lists) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = l.name;
    const x = document.createElement("span");
    x.className = "tab-x";
    x.textContent = "×";
    btn.appendChild(x);
    btn.className = l.id === activeListId ? "tab active" : "tab";
    btn.dataset.listId = l.id;
    tabs.appendChild(btn);
  }

  const addBtn = document.createElement("button");
  addBtn.type = "button";
  addBtn.textContent = "+";
  addBtn.id = "add-list";
  tabs.appendChild(addBtn);
}

function render() {
  list.innerHTML = "";

  for (const task of currentTasks()) {
    const li = document.createElement("li");
    li.dataset.id = task.id;
    li.draggable = true;
    if (task.done) li.classList.add("done");

    const checkWrap = document.createElement("label");
    checkWrap.className = "check";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.done;

    const circle = document.createElement("span");
    circle.className = "check-circle";

    checkWrap.append(checkbox, circle);

    const span = document.createElement("span");
    span.textContent = task.text;

    const dateInput = document.createElement("input");
    dateInput.type = "date";
    dateInput.className = "due-date";
    dateInput.value = task.dueDate || "";

    const isOverdue = task.dueDate && !task.done && task.dueDate < todayString();
    if (isOverdue) dateInput.classList.add("overdue");

    const flagBtn = document.createElement("button");
    flagBtn.type = "button";
    flagBtn.className = "flag";
    if (task.flagged) flagBtn.classList.add("flagged");
    flagBtn.textContent = "⚑";

    const del = document.createElement("button");
    del.type = "button";
    del.className = "delete";
    del.textContent = "Delete";

    const actions = document.createElement("div");
    actions.className = "row-actions";
    actions.appendChild(del);

    const content = document.createElement("div");
    content.className = "row-content";
    content.append(checkWrap, span, dateInput, flagBtn);

    li.append(actions, content);
    list.appendChild(li);
  }
  const doneCount = currentTasks().filter((t) => t.done).length;
  counter.textContent = `${currentTasks().length} tasks · ${doneCount} done`;
  save();
}

function save() {
  localStorage.setItem(
    "todo-track-lists", 
    JSON.stringify({ lists, activeListId })
  );  
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const text = input.value.trim();
  if (text === "") return;

  updateCurrentTasks(addTask(currentTasks(), text, nextTaskId));
  nextTaskId += 1;
  render();
  renderTabs();

  input.value = "";
  input.focus();
});

list.addEventListener("change", (event) => {
  const li = event.target.closest("li");
  if (!li) return;
  const id = Number(li.dataset.id);

  if (event.target.matches(".due-date")) {
    updateCurrentTasks(setDueDate(currentTasks(), id, event.target.value || null));
    render();
    renderTabs();
  }
});

list.addEventListener("click", (event) => {
  const li = event.target.closest("li");
  if (!li) return;
  const id = Number(li.dataset.id);

  if (event.target.matches('input[type="checkbox"]')) {
    updateCurrentTasks(toggle(currentTasks(), id));
    render();
    renderTabs();
  }

  if (event.target.matches("button.delete")) {
    updateCurrentTasks(remove(currentTasks(), id));
    render();
    renderTabs();
  }

  if (event.target.matches(".flag")) {
    const id = Number(event.target.closest("li").dataset.id);
    updateCurrentTasks(toggleFlag(currentTasks(), id));
    render();
    renderTabs();
  }
});

document.querySelector("#list-tabs").addEventListener("click", (event) => {
  if (event.target.matches(".tab-x")) {
    if (lists.length <= 1) return;
    const id = Number(event.target.closest(".tab").dataset.listId);
    const list = findList(lists, id);
    if (!confirm(`Delete "${list.name}" and its tasks?`)) return;
    lists = removeList(lists, id);
    if (activeListId === id) activeListId = lists[0].id;
    render();
    renderTabs();
    return;
  }
  if (event.target.matches(".tab")) {
    activeListId = Number(event.target.dataset.listId);
    render();
    renderTabs();
  }

  if (event.target.id === "add-list") {
    const name = prompt("List name?");
    if (!name || !name.trim()) return;
    lists = addList(lists, name.trim(), nextListId);
    nextListId += 1;
    activeListId = nextListId - 1;
    render();
    renderTabs();
  }
});

const OPEN_X = -88;
let drag = null;

list.addEventListener("pointerdown", (event) => {
  if (event.pointerType !== "touch") return;
  const content = event.target.closest(".row-content");
  if (!content) return;
  if (event.target.closest("input, button")) return;

  drag = { content, startX: event.clientX, currentX: 0 };
  content.style.transition = "none";
  content.setPointerCapture(event.pointerId);
});

list.addEventListener("pointermove", (event) => {
  if (!drag) return;

  const delta = event.clientX - drag.startX;
  drag.currentX = Math.min(0, Math.max(OPEN_X, delta));
  drag.content.style.transform = `translateX(${drag.currentX}px)`;
});

list.addEventListener("pointerup", (event) => {
  if (!drag) return;

  drag.content.style.transition = "";
  const open = drag.currentX < OPEN_X / 2;
  drag.content.style.transform = `translateX(${open ? OPEN_X : 0}px)`;
  drag = null;
});

list.addEventListener("pointercancel", () => {
  if (!drag) return;
  drag.content.style.transition = "";
  drag = null;
});

list.addEventListener("dragstart", (event) => {
  const li = event.target.closest("li");
  if (!li) return;
  event.dataTransfer.setData("text/plain", li.dataset.id);
  event.dataTransfer.effectAllowed = "move";
});

list.addEventListener("dragover", (event) => {
  event.preventDefault();
});

list.addEventListener("drop", (event) => {
  event.preventDefault();

  const targetLi = event.target.closest("li");
  if (!targetLi) return;

  const draggedId = Number(event.dataTransfer.getData("text/plain"));
  const targetId = Number(targetLi.dataset.id);
  if (draggedId === targetId) return;

  updateCurrentTasks(reorder(currentTasks(), draggedId, targetId));
  render();
  renderTabs();
});

render();
renderTabs();