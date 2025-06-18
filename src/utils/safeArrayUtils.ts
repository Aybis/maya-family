// Safe array utility functions to handle null/undefined/empty data

export const safeArray = <T>(value: T[] | null | undefined): T[] => {
  return Array.isArray(value) ? value : [];
};

export const safeSlice = <T>(
  array: T[] | null | undefined, 
  start?: number, 
  end?: number
): T[] => {
  const safeArr = safeArray(array);
  return safeArr.slice(start, end);
};

export const safeFilter = <T>(
  array: T[] | null | undefined,
  predicate: (value: T, index: number, array: T[]) => boolean
): T[] => {
  const safeArr = safeArray(array);
  return safeArr.filter(predicate);
};

export const safeMap = <T, U>(
  array: T[] | null | undefined,
  mapper: (value: T, index: number, array: T[]) => U
): U[] => {
  const safeArr = safeArray(array);
  return safeArr.map(mapper);
};

export const safeReduce = <T, U>(
  array: T[] | null | undefined,
  reducer: (accumulator: U, currentValue: T, currentIndex: number, array: T[]) => U,
  initialValue: U
): U => {
  const safeArr = safeArray(array);
  return safeArr.reduce(reducer, initialValue);
};

export const safeFind = <T>(
  array: T[] | null | undefined,
  predicate: (value: T, index: number, array: T[]) => boolean
): T | undefined => {
  const safeArr = safeArray(array);
  return safeArr.find(predicate);
};

export const safeSome = <T>(
  array: T[] | null | undefined,
  predicate: (value: T, index: number, array: T[]) => boolean
): boolean => {
  const safeArr = safeArray(array);
  return safeArr.some(predicate);
};

export const safeEvery = <T>(
  array: T[] | null | undefined,
  predicate: (value: T, index: number, array: T[]) => boolean
): boolean => {
  const safeArr = safeArray(array);
  return safeArr.every(predicate);
};

export const safeSort = <T>(
  array: T[] | null | undefined,
  compareFn?: (a: T, b: T) => number
): T[] => {
  const safeArr = safeArray(array);
  return [...safeArr].sort(compareFn);
};

export const safeLength = <T>(array: T[] | null | undefined): number => {
  return safeArray(array).length;
};

export const isEmpty = <T>(array: T[] | null | undefined): boolean => {
  return safeLength(array) === 0;
};

export const isNotEmpty = <T>(array: T[] | null | undefined): boolean => {
  return safeLength(array) > 0;
};

// Safe object property access
export const safeGet = <T>(obj: any, path: string, defaultValue: T): T => {
  if (!obj || typeof obj !== 'object') return defaultValue;
  
  const keys = path.split('.');
  let current = obj;
  
  for (const key of keys) {
    if (current === null || current === undefined || !(key in current)) {
      return defaultValue;
    }
    current = current[key];
  }
  
  return current !== null && current !== undefined ? current : defaultValue;
};

// Safe number operations
export const safeNumber = (value: any, defaultValue: number = 0): number => {
  const num = Number(value);
  return isNaN(num) ? defaultValue : num;
};

// Safe string operations
export const safeString = (value: any, defaultValue: string = ''): string => {
  return value != null ? String(value) : defaultValue;
};

// Safe date operations
export const safeDate = (value: any, defaultValue?: Date): Date => {
  if (value instanceof Date && !isNaN(value.getTime())) {
    return value;
  }
  
  if (typeof value === 'string' || typeof value === 'number') {
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      return date;
    }
  }
  
  return defaultValue || new Date();
};