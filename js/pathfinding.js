import { keyOf, parseKey } from './utils.js';

export const PATHFINDING_INFO = {
  bfs: {
    name: 'Breadth-First Search',
    description: 'BFS explores the grid level by level and finds the shortest path when every step has the same cost.',
  },
  dijkstra: {
    name: "Dijkstra's Algorithm",
    description: "Dijkstra's Algorithm always expands the cheapest known node next, so it handles weighted tiles correctly.",
  },
  astar: {
    name: 'A* Search',
    description: 'A* Search combines known travel cost with a direction estimate, usually finding the target faster than Dijkstra on open grids.',
  },
};

const DIRECTIONS = [
  [0, 1],
  [1, 0],
  [0, -1],
  [-1, 0],
];

const isWalkable = (grid, row, col) => {
  const node = grid[row]?.[col];
  return Boolean(node) && node.type !== 'wall';
};

const getNeighbors = (grid, row, col) => {
  const neighbors = [];
  for (const [rowDelta, colDelta] of DIRECTIONS) {
    const nextRow = row + rowDelta;
    const nextCol = col + colDelta;
    if (isWalkable(grid, nextRow, nextCol)) {
      neighbors.push(grid[nextRow][nextCol]);
    }
  }
  return neighbors;
};

const costOf = (node) => (node.type === 'weight' ? 5 : 1);

const manhattan = (a, b) => Math.abs(a.row - b.row) + Math.abs(a.col - b.col);

const reconstructPath = (previous, start, target) => {
  const startKey = keyOf(start.row, start.col);
  const targetKey = keyOf(target.row, target.col);
  const path = [];
  let currentKey = targetKey;

  if (!previous.has(currentKey) && currentKey !== startKey) return path;

  while (currentKey && currentKey !== startKey) {
    const [row, col] = parseKey(currentKey);
    path.unshift({ row, col });
    currentKey = previous.get(currentKey);
  }

  return path;
};

export const Pathfinding = {
  bfs(grid, start, target) {
    const queue = [start];
    const visited = new Set([keyOf(start.row, start.col)]);
    const previous = new Map();
    const visitedOrder = [];

    while (queue.length) {
      const current = queue.shift();
      const currentKey = keyOf(current.row, current.col);
      visitedOrder.push(current);

      if (current.row === target.row && current.col === target.col) {
        return {
          visitedOrder,
          path: reconstructPath(previous, start, target),
        };
      }

      for (const neighbor of getNeighbors(grid, current.row, current.col)) {
        const neighborKey = keyOf(neighbor.row, neighbor.col);
        if (!visited.has(neighborKey)) {
          visited.add(neighborKey);
          previous.set(neighborKey, currentKey);
          queue.push(neighbor);
        }
      }
    }

    return { visitedOrder, path: [] };
  },

  dijkstra(grid, start, target) {
    const distances = new Map();
    const previous = new Map();
    const visited = new Set();
    const unvisited = [];
    const visitedOrder = [];

    for (const row of grid) {
      for (const node of row) {
        if (node.type !== 'wall') {
          const nodeKey = keyOf(node.row, node.col);
          distances.set(nodeKey, Number.POSITIVE_INFINITY);
          unvisited.push(node);
        }
      }
    }

    distances.set(keyOf(start.row, start.col), 0);

    while (unvisited.length) {
      unvisited.sort((a, b) => distances.get(keyOf(a.row, a.col)) - distances.get(keyOf(b.row, b.col)));
      const current = unvisited.shift();
      const currentKey = keyOf(current.row, current.col);

      if (visited.has(currentKey)) continue;
      if (distances.get(currentKey) === Number.POSITIVE_INFINITY) break;

      visited.add(currentKey);
      visitedOrder.push(current);

      if (current.row === target.row && current.col === target.col) {
        return {
          visitedOrder,
          path: reconstructPath(previous, start, target),
        };
      }

      for (const neighbor of getNeighbors(grid, current.row, current.col)) {
        const neighborKey = keyOf(neighbor.row, neighbor.col);
        if (visited.has(neighborKey)) continue;

        const tentativeDistance = distances.get(currentKey) + costOf(neighbor);
        if (tentativeDistance < distances.get(neighborKey)) {
          distances.set(neighborKey, tentativeDistance);
          previous.set(neighborKey, currentKey);
        }
      }
    }

    return { visitedOrder, path: [] };
  },

  astar(grid, start, target) {
    const startKey = keyOf(start.row, start.col);
    const open = new Set([startKey]);
    const previous = new Map();
    const gScore = new Map([[startKey, 0]]);
    const fScore = new Map([[startKey, manhattan(start, target)]]);
    const visitedOrder = [];

    const getNodeByKey = (nodeKey) => {
      const [row, col] = parseKey(nodeKey);
      return grid[row][col];
    };

    while (open.size) {
      let currentKey = [...open].reduce((best, candidate) => {
        return (fScore.get(candidate) ?? Number.POSITIVE_INFINITY) < (fScore.get(best) ?? Number.POSITIVE_INFINITY)
          ? candidate
          : best;
      });

      const current = getNodeByKey(currentKey);
      visitedOrder.push(current);

      if (current.row === target.row && current.col === target.col) {
        return {
          visitedOrder,
          path: reconstructPath(previous, start, target),
        };
      }

      open.delete(currentKey);

      for (const neighbor of getNeighbors(grid, current.row, current.col)) {
        const neighborKey = keyOf(neighbor.row, neighbor.col);
        const tentativeG = (gScore.get(currentKey) ?? Number.POSITIVE_INFINITY) + costOf(neighbor);

        if (tentativeG < (gScore.get(neighborKey) ?? Number.POSITIVE_INFINITY)) {
          previous.set(neighborKey, currentKey);
          gScore.set(neighborKey, tentativeG);
          fScore.set(neighborKey, tentativeG + manhattan(neighbor, target));
          open.add(neighborKey);
        }
      }
    }

    return { visitedOrder, path: [] };
  },
};
