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

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.done;

    const span = document.createElement("span");
    span.textContent = task.text;

    const del = document.createElement("button");
    del.type = "button";
    del.className = "delete";
    del.textContent = "Delete";

    li.append(checkbox, span, del);
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

  tasks.push({ id: nextId, text, done: false });
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
    const task = tasks.find((t) => t.id === id);
    task.done = !task.done;
    render();
  }

  if (event.target.matches("button.delete")) {
    tasks = tasks.filter((t) => t.id !== id);
    render();
  }
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
console.log({ form, input, list });