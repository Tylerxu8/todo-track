export function addTask(tasks, text, id) {
  return [...tasks, { id, text, done: false }];
}

export function toggle(tasks, id) {
  return tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
}

export function remove(tasks,id) {
  return tasks.filter((t) => t.id !==id);
}