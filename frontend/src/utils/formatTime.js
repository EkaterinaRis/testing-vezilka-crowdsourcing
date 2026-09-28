export function formatRelativeTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 0) return "штотуку";

  const intervals = {
    година: 31536000,
    месец: 2592000,
    ден: 86400,
    час: 3600,
    минута: 60,
    секунда: 1,
  };

  for (const [unit, seconds] of Object.entries(intervals)) {
    const value = Math.floor(diffInSeconds / seconds);

    if (value >= 1) {
      let suffix = "";
      
      if (unit === "секунда") suffix = value === 1 ? "секунда" : "секунди";
      else if (unit === "минута") suffix = value === 1 ? "минута" : "минути";
      else if (unit === "час") suffix = value === 1 ? "час" : "часа";
      else if (unit === "ден") suffix = value === 1 ? "ден" : "дена";
      else if (unit === "месец") suffix = value === 1 ? "месец" : "месеци";
      else if (unit === "година") suffix = value === 1 ? "година" : "години";

      return `пред ${value} ${suffix}`;
    }
  }

  return "штотуку";
}