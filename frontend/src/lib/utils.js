import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Standardize time strings to uppercase AM/PM and 2-digit hours (e.g., "02:30 PM")
 */
export function formatTimeString(inputStr) {
  if (!inputStr) return "";
  let str = inputStr.trim();

  // If input is 24h format e.g. "14:30" or "9:15"
  const m24 = str.match(/^(\d{1,2}):(\d{2})$/);
  if (m24) {
    let hours = parseInt(m24[1], 10);
    const minutes = m24[2];
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${String(hours).padStart(2, "0")}:${minutes} ${ampm}`;
  }

  // If input includes am/pm e.g. "2:30 pm", "2:30pm", "02:30 pM"
  const mAmPm = str.match(/^(\d{1,2}):(\d{2})\s*([ap]\.?m\.?)$/i);
  if (mAmPm) {
    const hours = String(parseInt(mAmPm[1], 10)).padStart(2, "0");
    const minutes = mAmPm[2];
    const ampm = mAmPm[3].replace(/\./g, "").toUpperCase();
    return `${hours}:${minutes} ${ampm}`;
  }

  return str.toUpperCase();
}

/**
 * Parse 12h/24h time string (e.g., "10:00 AM", "01:00 PM", "14:00") into a Date object for a given base date
 */
export function parseTimeString(timeStr, baseDate = new Date()) {
  if (!timeStr) return null;
  // Normalize dashes and spaces
  const clean = timeStr.replace(/[–—]/g, "-").trim();

  // Match 12h format e.g. "10:00 AM", "01:30 PM", "9:00 AM"
  const match12 = clean.match(/^(\d{1,2}):(\d{2})\s*([AP]\.?M\.?)$/i);
  let hours = 0;
  let minutes = 0;

  if (match12) {
    hours = parseInt(match12[1], 10);
    minutes = parseInt(match12[2], 10);
    const ampm = match12[3].replace(/\./g, "").toUpperCase();
    if (ampm === "PM" && hours < 12) hours += 12;
    if (ampm === "AM" && hours === 12) hours = 0;
  } else {
    // Match 24h format e.g. "14:00" or "09:30"
    const match24 = clean.match(/^(\d{1,2}):(\d{2})$/);
    if (match24) {
      hours = parseInt(match24[1], 10);
      minutes = parseInt(match24[2], 10);
    } else {
      return null;
    }
  }

  const result = new Date(baseDate);
  result.setHours(hours, minutes, 0, 0);
  return result;
}

/**
 * Add hours to a 12h/24h time string and return formatted 12h string (e.g., "10:00 AM" + 1hr -> "11:00 AM")
 */
export function addHoursToTimeString(timeStr, hoursToAdd = 1) {
  const d = parseTimeString(timeStr);
  if (!d) return timeStr;
  d.setHours(d.getHours() + hoursToAdd);
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${String(hours).padStart(2, "0")}:${minutes} ${ampm}`;
}
