export function formatCompactNumber(num) {
  if (num == null || isNaN(num)) return "0";

  const absNum = Math.abs(num);

  if(absNum < 100) {
    return "< 100";
  }

  if (absNum < 1000) {
    return num.toString();
  }

  const units = ["K", "M", "B", "T"];
  let unitIndex = -1;
  let value = absNum;

  while (value >= 1000 && unitIndex < units.length - 1) {
    value /= 1000;
    unitIndex++;
  }
  
  const formatted =
    value % 1 === 0
      ? value.toFixed(0)
      : value.toFixed(1);

  return `${num < 0 ? "-" : ""}${formatted}${units[unitIndex]}`;
}