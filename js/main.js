import { Sorting, SORTING_INFO } from './sorting.js';
import { Pathfinding, PATHFINDING_INFO } from './pathfinding.js';
import { $, $$, randomInt, sleep, speedToDelay } from './utils.js';

const elements = {
  tabs: $$('.tab-btn'),
  panels: $$('.panel'),
  barVisualizer: $('#bar-visualizer'),
  sortAlgorithm: $('#sort-algorithm'),
  arraySize: $('#array-size'),
  arraySizeValue: $('#array-size-value'),
  sortSpeed: $('#sort-speed'),
  sortSpeedValue: $('#sort-speed-value'),
  generateArray: $('#generate-array'),
  startSort: $('#start-sort'),
  stopSort: $('#stop-sort'),
  sortingStatus: $('#sorting-status'),
  sortInfoTitle: $('#sort-info-title'),
  sortInfoBody: $('#sort-info-body'),
  comparisonCount: $('#comparison-count'),
  writeCount: $('#write-count'),
  gridVisualizer: $('#grid-visualizer'),
  pathAlgorithm: $('#path-algorithm'),
  brushMode: $('#brush-mode'),
  pathSpeed: $('#path-speed'),
  pathSpeedValue: $('#path-speed-value'),
  startPath: $('#start-path'),
  randomMaze: $('#random-maze'),
  clearPath: $('#clear-path'),
  clearBoard: $('#clear-board'),
  pathStatus: $('#path-status'),
  pathInfoTitle: $('#path-info-title'),
  pathInfoBody: $('#path-info-body'),
  visitedCount: $('#visited-count'),
  pathLength: $('#path-length'),
};

const sortState = {
  array: [],
  sorted: new Set(),
  isRunning: false,
  stopRequested: false,
  comparisons: 0,
  writes: 0,
};

const pathState = {
  rows: 16,
  cols: 29,
  start: { row: 8, col: 4 },
  target: { row: 8, col: 24 },
  grid: [],
  isMouseDown: false,
  isRunning: false,
};

function init() {
  bindTabs();
  bindSortingControls();
  bindPathfindingControls();
  generateArray();
  createGrid();
  updateSortingInfo();
  updatePathfindingInfo();
}

function bindTabs() {
  elements.tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const panelId = tab.dataset.panel;
      elements.tabs.forEach((button) => {
        const active = button === tab;
        button.classList.toggle('active', active);
        button.setAttribute('aria-selected', String(active));
      });

      elements.panels.forEach((panel) => {
        const active = panel.id === panelId;
        panel.classList.toggle('active-panel', active);
        panel.hidden = !active;
      });
    });
  });
}

function bindSortingControls() {
  elements.generateArray.addEventListener('click', generateArray);
  elements.startSort.addEventListener('click', runSort);
  elements.stopSort.addEventListener('click', () => {
    sortState.stopRequested = true;
    elements.sortingStatus.textContent = 'Stopping at the next safe step...';
  });

  elements.arraySize.addEventListener('input', () => {
    elements.arraySizeValue.textContent = elements.arraySize.value;
    if (!sortState.isRunning) generateArray();
  });

  elements.sortSpeed.addEventListener('input', () => {
    elements.sortSpeedValue.textContent = elements.sortSpeed.value;
  });

  elements.sortAlgorithm.addEventListener('change', updateSortingInfo);
}

function generateArray() {
  if (sortState.isRunning) return;
  const size = Number(elements.arraySize.value);
  sortState.array = Array.from({ length: size }, () => randomInt(8, 100));
  sortState.sorted.clear();
  sortState.comparisons = 0;
  sortState.writes = 0;
  updateSortMetrics();
  renderBars();
  elements.sortingStatus.textContent = `Generated ${size} values.`;
}

function renderBars({ compare = [], swap = [], focus = [] } = {}) {
  const compareSet = new Set(compare);
  const swapSet = new Set(swap);
  const focusSet = new Set(focus);
  const maxValue = Math.max(...sortState.array, 100);

  elements.barVisualizer.innerHTML = '';
  sortState.array.forEach((value, index) => {
    const bar = document.createElement('div');
    const height = Math.max(14, Math.round((value / maxValue) * 370));
    bar.className = 'bar';
    bar.style.height = `${height}px`;
    bar.dataset.value = value;
    bar.title = `Index ${index}: ${value}`;

    if (compareSet.has(index) || focusSet.has(index)) bar.classList.add('compare');
    if (swapSet.has(index)) bar.classList.add('swap');
    if (sortState.sorted.has(index)) bar.classList.add('sorted');

    elements.barVisualizer.appendChild(bar);
  });
}

function updateSortingInfo() {
  const info = SORTING_INFO[elements.sortAlgorithm.value];
  elements.sortInfoTitle.textContent = info.name;
  elements.sortInfoBody.textContent = info.description;
}

function updateSortMetrics() {
  elements.comparisonCount.textContent = sortState.comparisons;
  elements.writeCount.textContent = sortState.writes;
}

function setSortingControlsDisabled(disabled) {
  elements.generateArray.disabled = disabled;
  elements.startSort.disabled = disabled;
  elements.sortAlgorithm.disabled = disabled;
  elements.arraySize.disabled = disabled;
  elements.stopSort.disabled = !disabled;
}

async function runSort() {
  if (sortState.isRunning) return;
  const algorithm = elements.sortAlgorithm.value;
  sortState.isRunning = true;
  sortState.stopRequested = false;
  sortState.sorted.clear();
  sortState.comparisons = 0;
  sortState.writes = 0;
  updateSortMetrics();
  setSortingControlsDisabled(true);
  elements.sortingStatus.textContent = `${SORTING_INFO[algorithm].name} is running...`;

  const context = {
    delay: () => speedToDelay(elements.sortSpeed.value, 10, 320),
    shouldStop: () => sortState.stopRequested,
    compare: async (indices) => {
      sortState.comparisons += 1;
      updateSortMetrics();
      renderBars({ compare: indices });
    },
    focus: async (indices) => {
      renderBars({ focus: indices });
    },
    swap: async (indices, array) => {
      sortState.writes += 1;
      sortState.array = [...array];
      updateSortMetrics();
      renderBars({ swap: indices });
    },
    write: async (index, value, array, active = [index]) => {
      sortState.writes += 1;
      sortState.array = [...array];
      updateSortMetrics();
      renderBars({ swap: active });
    },
    markSorted: async (indices) => {
      indices.forEach((index) => sortState.sorted.add(index));
      renderBars();
    },
  };

  await Sorting[algorithm](sortState.array, context);

  sortState.isRunning = false;
  setSortingControlsDisabled(false);

  if (sortState.stopRequested) {
    sortState.sorted.clear();
    renderBars();
    elements.sortingStatus.textContent = 'Sort stopped. You can continue with this array or generate a fresh one.';
    return;
  }

  sortState.array.forEach((_, index) => sortState.sorted.add(index));
  renderBars();
  elements.sortingStatus.textContent = `${SORTING_INFO[algorithm].name} complete.`;
}

function bindPathfindingControls() {
  document.addEventListener('pointerup', () => {
    pathState.isMouseDown = false;
  });

  elements.pathAlgorithm.addEventListener('change', updatePathfindingInfo);
  elements.pathSpeed.addEventListener('input', () => {
    elements.pathSpeedValue.textContent = elements.pathSpeed.value;
  });

  elements.startPath.addEventListener('click', runPathfinding);
  elements.randomMaze.addEventListener('click', randomizeWalls);
  elements.clearPath.addEventListener('click', () => {
    clearPathVisuals();
    renderGrid();
    elements.pathStatus.textContent = 'Cleared the visited nodes and highlighted route.';
  });
  elements.clearBoard.addEventListener('click', () => {
    if (pathState.isRunning) return;
    createGrid();
    elements.pathStatus.textContent = 'Board cleared. Draw a new challenge.';
  });
}

function createGrid() {
  pathState.grid = Array.from({ length: pathState.rows }, (_, row) => {
    return Array.from({ length: pathState.cols }, (_, col) => ({
      row,
      col,
      type: getBaseNodeType(row, col),
      visual: '',
    }));
  });
  updatePathMetrics(0, 0);
  renderGrid();
}

function getBaseNodeType(row, col) {
  if (row === pathState.start.row && col === pathState.start.col) return 'start';
  if (row === pathState.target.row && col === pathState.target.col) return 'target';
  return 'empty';
}

function renderGrid() {
  elements.gridVisualizer.style.gridTemplateColumns = `repeat(${pathState.cols}, minmax(18px, 1fr))`;
  elements.gridVisualizer.innerHTML = '';

  for (const row of pathState.grid) {
    for (const node of row) {
      const cell = document.createElement('button');
      cell.type = 'button';
      cell.className = 'node';
      cell.dataset.row = node.row;
      cell.dataset.col = node.col;
      cell.title = `${node.type === 'empty' ? 'Open tile' : node.type} (${node.row}, ${node.col})`;
      cell.setAttribute('aria-label', cell.title);

      if (node.type !== 'empty') cell.classList.add(node.type);
      if (node.visual && node.type !== 'start' && node.type !== 'target') cell.classList.add(node.visual);

      cell.addEventListener('pointerdown', (event) => {
        event.preventDefault();
        pathState.isMouseDown = true;
        paintNode(node.row, node.col);
      });

      cell.addEventListener('pointerenter', () => {
        if (pathState.isMouseDown) paintNode(node.row, node.col);
      });

      cell.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          paintNode(node.row, node.col);
        }
      });

      elements.gridVisualizer.appendChild(cell);
    }
  }
}

function paintNode(row, col) {
  if (pathState.isRunning) return;
  clearPathVisuals();
  const brush = elements.brushMode.value;
  const node = pathState.grid[row][col];

  if (brush === 'start') {
    if (node.type === 'target') return;
    pathState.grid[pathState.start.row][pathState.start.col].type = 'empty';
    pathState.start = { row, col };
    node.type = 'start';
  }

  if (brush === 'target') {
    if (node.type === 'start') return;
    pathState.grid[pathState.target.row][pathState.target.col].type = 'empty';
    pathState.target = { row, col };
    node.type = 'target';
  }

  if (brush === 'wall') {
    if (node.type !== 'start' && node.type !== 'target') {
      node.type = node.type === 'wall' ? 'empty' : 'wall';
    }
  }

  if (brush === 'weight') {
    if (node.type !== 'start' && node.type !== 'target') {
      node.type = node.type === 'weight' ? 'empty' : 'weight';
    }
  }

  if (brush === 'erase') {
    if (node.type !== 'start' && node.type !== 'target') node.type = 'empty';
  }

  renderGrid();
}

function clearPathVisuals() {
  for (const row of pathState.grid) {
    for (const node of row) {
      node.visual = '';
    }
  }
  updatePathMetrics(0, 0);
}

function randomizeWalls() {
  if (pathState.isRunning) return;
  clearPathVisuals();
  for (const row of pathState.grid) {
    for (const node of row) {
      if (node.type === 'start' || node.type === 'target') continue;
      const roll = Math.random();
      if (roll < 0.24) node.type = 'wall';
      else if (roll < 0.31) node.type = 'weight';
      else node.type = 'empty';
    }
  }
  renderGrid();
  elements.pathStatus.textContent = 'Random walls and weighted tiles placed.';
}

function updatePathfindingInfo() {
  const info = PATHFINDING_INFO[elements.pathAlgorithm.value];
  elements.pathInfoTitle.textContent = info.name;
  elements.pathInfoBody.textContent = info.description;
}

function updatePathMetrics(visited, pathLength) {
  elements.visitedCount.textContent = visited;
  elements.pathLength.textContent = pathLength;
}

function setPathControlsDisabled(disabled) {
  elements.startPath.disabled = disabled;
  elements.randomMaze.disabled = disabled;
  elements.clearBoard.disabled = disabled;
  elements.clearPath.disabled = disabled;
  elements.pathAlgorithm.disabled = disabled;
  elements.brushMode.disabled = disabled;
}

async function runPathfinding() {
  if (pathState.isRunning) return;
  clearPathVisuals();
  renderGrid();
  pathState.isRunning = true;
  setPathControlsDisabled(true);

  const algorithm = elements.pathAlgorithm.value;
  const startNode = pathState.grid[pathState.start.row][pathState.start.col];
  const targetNode = pathState.grid[pathState.target.row][pathState.target.col];
  const result = Pathfinding[algorithm](pathState.grid, startNode, targetNode);
  const delay = () => speedToDelay(elements.pathSpeed.value, 6, 110);

  elements.pathStatus.textContent = `${PATHFINDING_INFO[algorithm].name} is exploring...`;

  let visitedCounter = 0;
  for (const node of result.visitedOrder) {
    if (node.type !== 'start' && node.type !== 'target') {
      node.visual = 'visited';
      visitedCounter += 1;
      updatePathMetrics(visitedCounter, 0);
      renderGrid();
      await sleep(delay());
    }
  }

  if (!result.path.length) {
    pathState.isRunning = false;
    setPathControlsDisabled(false);
    elements.pathStatus.textContent = 'No path found — the route is completely blocked.';
    return;
  }

  let pathCounter = 0;
  for (const node of result.path) {
    const gridNode = pathState.grid[node.row][node.col];
    if (gridNode.type !== 'start' && gridNode.type !== 'target') {
      gridNode.visual = 'path';
      pathCounter += 1;
      updatePathMetrics(visitedCounter, pathCounter);
      renderGrid();
      await sleep(Math.max(10, delay() * 1.25));
    }
  }

  pathState.isRunning = false;
  setPathControlsDisabled(false);
  elements.pathStatus.textContent = `${PATHFINDING_INFO[algorithm].name} found a route with ${pathCounter} visible steps.`;
}

init();
