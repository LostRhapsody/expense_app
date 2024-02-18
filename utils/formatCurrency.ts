/**
 * utility function to numbers format to US currency
 * @param num number value to format as currency
 * @returns num formated as US currency
 */
export default function formatCurrency(num: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(num);
}