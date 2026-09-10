import assert from "node:assert/strict";
import { addTask, toggle, remove, setDueDate, toggleFlag, addList, removeList, findList, replaceListTasks, reorder } from "../docs/todo.js";

let passed = 0;
function test(name, fn) {
  fn();
  passed += 1;
  console.log("ok -", name);
}

test("addTask appends one task with done:false", () => {
  const out = addTask([], "buy milk", 1);
  assert.equal(out.length, 1);
  assert.equal(out[0].text, "buy milk");
  assert.equal(out[0].done, false);
});

test("addTask does not mutate its input array", () => {
	const input = [];
	addTask(input, "x", 1);
	assert.equal(input.length, 0);
});

test("toggle flips done for the matching id only", () => {
	const start = [
	  { id: 1, text: "a", done: false },
	  { id: 2, text: "b", done: false },
	];
	const out = toggle(start, 1);
	assert.equal(out[0].done, true);
	assert.equal(out[1].done, false);
});

test("toggle does not mutate its input array", () => {
	const start = [{ id: 1, text: "a", done: false }];
	toggle(start, 1);
	assert.equal(start[0].done, false);
});

test("toggle with an id that doesn't exist leaves tasks unchanged", () => {
	const start = [{ id: 1, text: "a", done: false }];
	const out = toggle(start, 999);
	assert.deepEqual(out, start);
});

test("remove drops the task with that id", () => {
  const start = [
    { id: 1, text: "a", done: false },
    { id: 2, text: "b", done: false },
  ];
  const out = remove(start, 1);
  assert.equal(out.length, 1);
  assert.equal(out[0].id, 2);
});

test("remove does not mutate its input array", () => {
	const start = [{ id: 1, text: "a", done: false }];
	remove(start, 1);
	assert.equal(start.length, 1);
});

test("remove with an id that doesn't exist leaves tasks unchanged", () => {
	const start = [{ id: 1, text: "a", done: false }];
	const out = remove(start, 999);
	assert.deepEqual(out, start);
});

test("setDueDate sets the date on the matching task only", () => {
	const start = [
		{ id: 1, text: "a", done: false, dueDate: null, flagged: false },
		{ id: 2, text: "b", done: false, dueDate: null, flagged: false },
	];
	const out = setDueDate(start, 1, "2026-09-10");
	assert.equal(out[0].dueDate, "2026-09-10");
	assert.equal(out[1].dueDate, null);
});

test("toggleFlag flips flagged for the matching task only", () => {
	const start = [{ id: 1, text: "a", done: false, dueDate: null, flagged: false }];
	const out = toggleFlag(start, 1);
	assert.equal(out[0].flagged, true);
});

test("addList appends a new list with an empty tasks array", () => {
	const out = addList([], "Groceries", 2);
	assert.equal(out.length, 1);
	assert.equal(out[0].id, 2);
	assert.equal(out[0].name, "Groceries");
	assert.deepEqual(out[0].tasks, []);
});

test("addList does not mutate its input array", () => {
	const start = [{ id: 1, name: "My List", tasks: [] }];
	addList(start, "Work", 2);
	assert.equal(start.length, 1);
});

test("removeList drops the list with that id", () => {
	const	start = [
		{ id: 1, name: "A", tasks: [] },
		{ id: 2, name: "B", tasks: [] },
	];
	const out = removeList(start, 1);
	assert.equal(out.length, 1);
	assert.equal(out[0].id, 2);
});

test("removeList with an id that doesn't exist leaves lists unchanged", () => {
	const start = [{ id: 1, name: "A", tasks: [] }];
	const out = removeList(start, 999);
	assert.deepEqual(out, start);
});

test("removeList does not mutate its input array", () => {
	const start = [
		{ id: 1, name: "A", tasks: [] },
		{ id: 2, name: "B", tasks: [] },
	];
	removeList(start, 1);
	assert.equal(start.length, 2);
});

test("findList returns the matching list", () => {
	const lists = [
		{ id: 1, name: "A", tasks: [] },
		{ id: 2, name: "B", tasks: [] },
	];
	assert.equal(findList(lists, 2).name, "B");
});

test("findList returns undefined when no list matches", () => {
	const lists = [{ id: 1, name: "A", tasks: [] }];
	assert.equal(findList(lists, 999), undefined);
});

test("replaceListTasks updates only the targeted list's tasks", () => {
	const lists = [
		{ id: 1, name: "A", tasks: [] },
		{ id: 2, name: "B", tasks: [{ id: 9, text: "keep me", done: false }] },
	];
	const newTasks = [{ id: 5, text: "new", done: false }];
	const out = replaceListTasks(lists, 1, newTasks);
	assert.deepEqual(out[0].tasks, newTasks);
	assert.deepEqual(out[1].tasks, [{ id: 9, text: "keep me", done: false }]);
});

test("replaceListTasks keeps the targeted list's other fields", () => {
	const lists = [{ id: 1, name: "A", tasks: [] }];
	const out = replaceListTasks(lists, 1, [{ id: 5, text: "x", done: false }]);
	assert.equal(out[0].id, 1);
	assert.equal(out[0].name, "A");
});

test("replaceListTasks does not mutate its input", () => {
	const original = [];
	const lists = [{ id: 1, name: "A", tasks: original }];
	replaceListTasks(lists, 1, [{ id: 5, text: "x", done: false }]);
	assert.equal(lists[0].tasks, original);
	assert.equal(lists[0].tasks.length, 0);
});

test("findList + addTask + replaceListTasks adds to the right list only", () => {
	let lists = [
		{ id: 1, name: "A", tasks: [] },
		{ id: 2, name: "B", tasks: [] },
	];
	const listA = findList(lists, 1);
	const updated = addTask(listA.tasks, "buy milk", 1);
	lists = replaceListTasks(lists, 1, updated);
	assert.equal(lists[0].tasks.length, 1);
	assert.equal(lists[0].tasks[0].text, "buy milk");
	assert.equal(lists[1].tasks.length, 0);
});

test("reorder moves a task to just before the target", () => {
	const start = [
		{ id: 1, text: "a" },
		{ id: 2, text: "b" },
		{ id: 3, text: "c" },
	];
	const out = reorder(start, 3, 1);
	assert.deepEqual(out.map((t) => t.id), [3, 1, 2]);
});

test("reorder moves a task down to just after the target", () => {
	const start = [
		{ id: 1, text: "a" },
		{ id: 2, text: "b" },
		{ id: 3, text: "c" },
	];
	const out = reorder(start, 1, 2);
	assert.deepEqual(out.map((t) => t.id), [2, 1, 3]);
});

console.log(`\n${passed} passed`);