export function generateOrderNumber(): string {
  return `SW-${Date.now().toString().slice(-4)}`
}
