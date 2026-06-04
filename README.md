# Royal Algorithm Visualizer

A polished algorithm visualizer built with vanilla HTML, CSS, and JavaScript.

## What is included

- Sorting visualizer
  - Bubble Sort
  - Selection Sort
  - Insertion Sort
  - Merge Sort
  - Quick Sort
- Pathfinding visualizer
  - Breadth-First Search
  - Dijkstra's Algorithm
  - A* Search
- Royal dark theme using navy, purple, gold, ruby, and emerald colors
- Adjustable speed controls
- Adjustable array size
- Interactive grid with walls, weighted tiles, start node, target node, and eraser
- No frontend framework required
- No external dependencies required

## How to run

### Option 1: Run with Node

```bash
npm start
```

Then open:

```text
http://localhost:5173
```

### Option 2: Run with Python

```bash
python3 -m http.server 5173
```

Then open:

```text
http://localhost:5173
```

## Project structure

```text
algorithm-visualizer-main/
├── css/
│   └── style.css
├── js/
│   ├── main.js
│   ├── pathfinding.js
│   ├── sorting.js
│   └── utils.js
├── index.html
├── package.json
├── README.md
└── server.js
```

## Notes for refinement

Good next improvements would be:

- Add pseudocode panels that highlight the active line during animation
- Add algorithm complexity cards
- Add maze generation algorithms
- Add mobile-first grid controls
- Add sound effects or animation presets
- Add a light theme toggle
