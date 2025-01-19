import { siteConfig } from "@/lib/config";

export function absoluteUrl(path: string) {
  return `${process.env.NEXT_PUBLIC_APP_URL || siteConfig.url}${path}`;
}

export function formatDate(date: string) {
  const currentDate = new Date().getTime();
  let formattedDate = date;
  if (!date.includes("T")) {
    formattedDate = `${date}T00:00:00`;
  }
  const targetDate = new Date(formattedDate).getTime();
  const timeDifference = Math.abs(currentDate - targetDate);
  const daysAgo = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

  const fullDate = new Date(formattedDate).toLocaleString("en-us", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  if (daysAgo < 1) {
    return "Today";
  }
  if (daysAgo < 7) {
    return `${fullDate} (${daysAgo}d ago)`;
  }
  if (daysAgo < 30) {
    const weeksAgo = Math.floor(daysAgo / 7);
    return `${fullDate} (${weeksAgo}w ago)`;
  }
  if (daysAgo < 365) {
    const monthsAgo = Math.floor(daysAgo / 30);
    return `${fullDate} (${monthsAgo}mo ago)`;
  }
  const yearsAgo = Math.floor(daysAgo / 365);
  return `${fullDate} (${yearsAgo}y ago)`;
}
