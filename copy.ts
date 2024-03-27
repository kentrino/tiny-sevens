type Primitive = string | number | boolean | null | undefined

/**
 * Deep copy an object. DO NOT USE THIS FUNCTION IN PRODUCTION.
 * @param obj
 */
export function copy<T extends Record<string, unknown> | unknown[] | Primitive>(obj: T): T {
  if (typeof obj === 'string' || typeof obj === 'number' || typeof obj === 'boolean' || obj === null || obj === undefined) {
    return obj as never
  }
  if (Array.isArray(obj)) {
    return obj.map((v) => copy(v as never)) as never
  }
  return Object.fromEntries(
    Object.keys(obj).map((k) => [k, copy(obj[k] as never)])
  ) as never
}
