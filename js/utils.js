export const $ = (selector, parent = document) => parent.querySelector(selector);
export const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, Math.max(0, ms)));

export const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

export const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export const speedToDelay = (speed, minDelay = 12, maxDelay = 360) => {
  const normalized = clamp(Number(speed), 1, 100);
  return Math.round(maxDelay - ((normalized - 1) / 99) * (maxDelay - minDelay));
};

export const keyOf = (row, col) => `${row}-${col}`;

export const parseKey = (key) => key.split('-').map(Number);

export const shuffle = (items) => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = randomInt(0, i);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};
