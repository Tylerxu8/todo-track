export function addTask(tasks, text, id) {
  return [...tasks, { id, text, done: false, dueDate: null, flagged: false }];
}

export function toggle(tasks, id) {
  return tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
}

export function remove(tasks,id) {
  return tasks.filter((t) => t.id !==id);
}

export function setDueDate(tasks, id, dueDate) {
  return tasks.map((t) => (t.id === id ? { ...t, dueDate } : t));
}

export function toggleFlag(tasks, id) {
  return tasks.map((t) => (t.id === id ? { ...t, flagged: !t.flagged } : t));
}