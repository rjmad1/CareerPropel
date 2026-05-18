export function cn(...classes: (string | undefined | null | boolean)[]): string {
  return classes
    .filter((cls) => typeof cls === 'string' && cls.length > 0)
    .join(' ')
}
