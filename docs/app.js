import { addTask, toggle, remove } from "./todo.js";

const form = document.querySelector("#new-task");
const input = document.querySelector("#task-input");
const list = document.querySelector("#list");
const counter = document.querySelector("#counter");

let tasks = [];
let nextId = 1;

function render() {
  list.innerHTML = "";

  for (const task of tasks) {
    const li = document.createElement("li");
    li.dataset.id = task.id;
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

    const del = document.createElement("button");
    del.type = "button";
    del.className = "delete";
    del.textContent = "Delete";

    const actions = document.createElement("div");
    actions.className = "row-actions";
    actions.appendChild(del);

    const content = document.createElement("div");
    content.className = "row-content";
    content.append(checkWrap, span);

    li.append(actions, content);
    list.appendChild(li);
  }
  const doneCount = tasks.filter((t) => t.done).length;
  counter.textContent = `${tasks.length} tasks · ${doneCount} done`;
  save();
}

function save() {
  localStorage.setItem("todo-track", JSON.stringify(tasks));
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const text = input.value.trim();
  if (text === "") return;

  tasks = addTask(tasks, text, nextId);
  nextId += 1;
  render();

  input.value = "";
  input.focus();
});

list.addEventListener("click", (event) => {
  const li = event.target.closest("li");
  if (!li) return;

  const id = Number(li.dataset.id);

  if (event.target.matches('input[type="checkbox"]')) {
    tasks = toggle(tasks, id);
    render();
  }

  if (event.target.matches("button.delete")) {
    tasks = remove(tasks, id);
    render();
  }
});

const OPEN_X = -88;
let drag = null;

list.addEventListener("pointerdown", (event) => {
  const content = event.target.closest(".row-content");
  if (!content) return;

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

const saved = localStorage.getItem("todo-track");
if (saved) {
  try {
  	tasks = JSON.parse(saved);
  	nextId = Math.max(0, ...tasks.map((t) => t.id)) + 1;
  } catch {
  	tasks = [];
  }
}
render();