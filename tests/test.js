import assert from "node:assert/strict";
import { addTask, toggle, remove, setDueDate, toggleFlag } from "../docs/todo.js";

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

console.log(`\n${passed} passed`);