console.log("VERSION 2")

const form = document.querySelector('#new-task');
const input = document.querySelector('#task-input');
const list = document.querySelector('#list');
const counter = document.querySelector('#counter');

let tasks = [];

const saved = localStorage.getItem('todo-broken');
if (saved) {
  try {
    tasks = JSON.parse(saved);
  } catch {
    tasks = [];
  }
}
render();

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const text = input.value.trim();
  if (text === '') return;

  const id = Math.max(0, ...tasks.map((t) => t.id)) + 1;
  tasks.push({ id, text, done: false });

  input.value = '';
  input.focus();
  render();
});

list.addEventListener('click', (event) => {
  const li = event.target.closest('li');
  if (!li) return;
  const id = Number(li.dataset.id);

  if (event.target.matches('input[type="checkbox"]')) {
    const task = tasks.find(t => t.id === id);
    task.done = !task.done;
    render();
  }

  if (event.target.matches('button.delete')) {
    tasks = tasks.filter(t => t.id !== id);
    render();
  }
});

function render() {
  list.innerHTML = '';

  for (const task of tasks) {
    const li = document.createElement('li');
    li.dataset.id = task.id;
    if (task.done) li.classList.add('done');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.done;

    const span = document.createElement('span');
    span.textContent = task.text;

    const del = document.createElement('button');
    del.type = 'button';
    del.className = 'delete';
    del.textContent = 'Delete';

    li.append(checkbox, span, del);
    list.appendChild(li);
  }

  const done = tasks.filter(t => t.done).length;
  counter.textContent = `${tasks.length} tasks · ${done} done`;
  localStorage.setItem('todo-broken', JSON.stringify(tasks));
}
