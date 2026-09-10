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

export function addList(lists, name, id) {
  return [...lists, { id, name, tasks: [] }];
}

export function removeList(lists, id) {
  return lists.filter((l) => l.id !== id);
}

export function findList(lists, id) {
  return lists.find((l) => l.id === id);
}

export function replaceListTasks(lists, id, tasks) {
  return lists.map((l) => (l.id === id ? { ...l, tasks } : l));
}

export function reorder(tasks, draggedId, targetId) {
  const dragged = tasks.find((t) => t.id === draggedId);
  const withoutDragged = tasks.filter((t) => t.id !== draggedId);
  const targetIndex = withoutDragged.findIndex((t) => t.id === targetId);

  const fromIndex = tasks.findIndex((t) => t.id === draggedId);
  const toIndex = tasks.findIndex((t) => t.id === targetId);
  const insertAt = fromIndex < toIndex ? targetIndex + 1 : targetIndex;

  return [
    ...withoutDragged.slice(0, insertAt),
    dragged,
    ...withoutDragged.slice(insertAt),
  ];
}