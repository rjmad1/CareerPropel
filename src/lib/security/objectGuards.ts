const BLOCKED_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

export function isSafeObjectKey(key: PropertyKey): key is string | number | symbol {
  return typeof key !== 'string' || !BLOCKED_KEYS.has(key);
}

export function hasOwnSafe<T extends object, K extends PropertyKey>(
  obj: T,
  key: K
): key is K & keyof T {
  return isSafeObjectKey(key) && Object.hasOwn(obj, key);
}
