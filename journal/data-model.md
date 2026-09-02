# Data model

## A task
A task is an object with three fields:


- id	a number, unique per task. Never shown to the user. It exists so the app can point at one specific task even when two tasks have identical text.

- text	a string. Exactly what the user typed (after trimming spaces).
- done	a boolean. False when created; flips when the user marks it done.


Written out:	{ id: 1, text: "buy milk", done: false }


## The list
The whole to-do list is an array of task objects, in the order they were added:

	[ 
	  { id: 1, text: "buy milk",		done: false},
	  { id: 2, text: "call the bank",	done: true }
	]

## The three operations
1. ADD    take the typed text, make { id: <next unused id>, text, done: false },
          put it on the END of the array.
2. TOGGLE given an id, find that task, set done to the opposite of what it is.
3. DELETE given an id, remove the task with that id from the array.

## A decision I am making now
id is a plain incrementing number (1, 2, 3, ...). Not a random string, not the
text itself. If the user deletes task 2, the next new task is still 3 — ids are
never reused.