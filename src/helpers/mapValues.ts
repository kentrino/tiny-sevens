export function mapValues<T extends Record<string, unknown>, S>(
  obj: T,
  fn: (value: T[keyof T], key: string) => S,
): { [K in keyof T]: S } {
  const result: { [K in keyof T]: S } = {} as never
  for (const key in obj) {
    result[key] = fn(obj[key], key)
  }
  return result
}
