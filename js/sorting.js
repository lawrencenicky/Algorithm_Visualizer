import { sleep } from './utils.js';

const wait = async (ctx) => sleep(ctx.delay());
const stopped = (ctx) => ctx.shouldStop();

export const SORTING_INFO = {
  bubble: {
    name: 'Bubble Sort',
    description: 'Bubble Sort repeatedly compares neighbouring values and swaps them when they are out of order. Large values slowly rise to the end of the array.',
  },
  selection: {
    name: 'Selection Sort',
    description: 'Selection Sort scans the unsorted area, finds the smallest value, and moves it into its final position.',
  },
  insertion: {
    name: 'Insertion Sort',
    description: 'Insertion Sort builds a sorted section from left to right by inserting each new value where it belongs.',
  },
  merge: {
    name: 'Merge Sort',
    description: 'Merge Sort splits the array into smaller sections, sorts each section, then merges the sections back together.',
  },
  quick: {
    name: 'Quick Sort',
    description: 'Quick Sort chooses a pivot, partitions smaller values to the left and larger values to the right, then sorts each side recursively.',
  },
};

export const Sorting = {
  async bubble(array, ctx) {
    const n = array.length;
    for (let i = 0; i < n; i += 1) {
      let swapped = false;
      for (let j = 0; j < n - i - 1; j += 1) {
        if (stopped(ctx)) return array;
        await ctx.compare([j, j + 1]);
        await wait(ctx);

        if (array[j] > array[j + 1]) {
          [array[j], array[j + 1]] = [array[j + 1], array[j]];
          swapped = true;
          await ctx.swap([j, j + 1], array);
          await wait(ctx);
        }
      }
      await ctx.markSorted([n - i - 1]);
      if (!swapped) break;
    }
    await ctx.markSorted(array.map((_, index) => index));
    return array;
  },

  async selection(array, ctx) {
    const n = array.length;
    for (let i = 0; i < n; i += 1) {
      if (stopped(ctx)) return array;
      let minIndex = i;
      await ctx.focus([i]);

      for (let j = i + 1; j < n; j += 1) {
        if (stopped(ctx)) return array;
        await ctx.compare([minIndex, j]);
        await wait(ctx);
        if (array[j] < array[minIndex]) {
          minIndex = j;
          await ctx.focus([minIndex]);
        }
      }

      if (minIndex !== i) {
        [array[i], array[minIndex]] = [array[minIndex], array[i]];
        await ctx.swap([i, minIndex], array);
        await wait(ctx);
      }
      await ctx.markSorted([i]);
    }
    return array;
  },

  async insertion(array, ctx) {
    await ctx.markSorted([0]);
    for (let i = 1; i < array.length; i += 1) {
      if (stopped(ctx)) return array;
      const current = array[i];
      let j = i - 1;
      await ctx.focus([i]);
      await wait(ctx);

      while (j >= 0 && array[j] > current) {
        if (stopped(ctx)) return array;
        await ctx.compare([j, j + 1]);
        await wait(ctx);
        array[j + 1] = array[j];
        await ctx.write(j + 1, array[j + 1], array, [j, j + 1]);
        j -= 1;
        await wait(ctx);
      }

      array[j + 1] = current;
      await ctx.write(j + 1, current, array, [j + 1]);
      await ctx.markSorted([...Array(i + 1).keys()]);
      await wait(ctx);
    }
    await ctx.markSorted(array.map((_, index) => index));
    return array;
  },

  async merge(array, ctx) {
    const mergeSort = async (left, right) => {
      if (stopped(ctx) || left >= right) return;
      const mid = Math.floor((left + right) / 2);
      await mergeSort(left, mid);
      await mergeSort(mid + 1, right);
      await mergeRange(left, mid, right);
    };

    const mergeRange = async (left, mid, right) => {
      const leftPart = array.slice(left, mid + 1);
      const rightPart = array.slice(mid + 1, right + 1);
      let i = 0;
      let j = 0;
      let k = left;

      while (i < leftPart.length && j < rightPart.length) {
        if (stopped(ctx)) return;
        await ctx.compare([left + i, mid + 1 + j]);
        await wait(ctx);

        if (leftPart[i] <= rightPart[j]) {
          array[k] = leftPart[i];
          i += 1;
        } else {
          array[k] = rightPart[j];
          j += 1;
        }
        await ctx.write(k, array[k], array, [k]);
        k += 1;
        await wait(ctx);
      }

      while (i < leftPart.length) {
        if (stopped(ctx)) return;
        array[k] = leftPart[i];
        await ctx.write(k, array[k], array, [k]);
        i += 1;
        k += 1;
        await wait(ctx);
      }

      while (j < rightPart.length) {
        if (stopped(ctx)) return;
        array[k] = rightPart[j];
        await ctx.write(k, array[k], array, [k]);
        j += 1;
        k += 1;
        await wait(ctx);
      }
    };

    await mergeSort(0, array.length - 1);
    if (!stopped(ctx)) await ctx.markSorted(array.map((_, index) => index));
    return array;
  },

  async quick(array, ctx) {
    const partition = async (low, high) => {
      const pivot = array[high];
      let i = low;
      await ctx.focus([high]);

      for (let j = low; j < high; j += 1) {
        if (stopped(ctx)) return i;
        await ctx.compare([j, high]);
        await wait(ctx);
        if (array[j] < pivot) {
          if (i !== j) {
            [array[i], array[j]] = [array[j], array[i]];
            await ctx.swap([i, j], array);
            await wait(ctx);
          }
          i += 1;
        }
      }

      [array[i], array[high]] = [array[high], array[i]];
      await ctx.swap([i, high], array);
      await ctx.markSorted([i]);
      await wait(ctx);
      return i;
    };

    const quickSort = async (low, high) => {
      if (stopped(ctx) || low > high) return;
      if (low === high) {
        await ctx.markSorted([low]);
        return;
      }
      const pivotIndex = await partition(low, high);
      await quickSort(low, pivotIndex - 1);
      await quickSort(pivotIndex + 1, high);
    };

    await quickSort(0, array.length - 1);
    if (!stopped(ctx)) await ctx.markSorted(array.map((_, index) => index));
    return array;
  },
};
