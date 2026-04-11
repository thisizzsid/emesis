import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const extractHashtags = (text: string): string[] => {
  const hashtagRegex = /#[\w\u0590-\u05ff]+/gi;
  return text.match(hashtagRegex) || [];
};

export const getDeviceName = (): string => {
  if (typeof window === "undefined") return "Unknown";
  const ua = window.navigator.userAgent;
  if (/iPhone/.test(ua)) return "iPhone";
  if (/iPad/.test(ua)) return "iPad";
  if (/Android/.test(ua)) return "Android Device";
  if (/Macintosh/.test(ua)) return "Mac";
  if (/Windows/.test(ua)) return "PC";
  if (/Linux/.test(ua)) return "Linux PC";
  return "Mobile Device";
};
