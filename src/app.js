const form = document.querySelector("#new-task");
const input = document.querySelector("#task-input");
const list = document.querySelector("#list");

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const text = input.value.trim();
  if (text === "") return;

  const li = document.createElement("li");

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";

  const span = document.createElement("span");
  span.textContent = text;

  const del = document.createElement("button");
  del.type = "button";
  del.className = "delete";
  del.textContent = "Delete";

  li.append(checkbox, span, del);
  list.appendChild(li);

  input.value = "";
  input.focus();
});

console.log({ form, input, list });