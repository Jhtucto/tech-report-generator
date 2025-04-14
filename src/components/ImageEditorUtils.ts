
// Type guard to check if a string is in a specific union type
export function isInEnum<T extends string>(value: string, enumValues: readonly T[]): value is T {
  return (enumValues as readonly string[]).includes(value);
}

// Helper for type-safe string comparisons
export function safeCompare<T extends string>(value1: T, value2: string): boolean {
  return value1 === value2;
}
