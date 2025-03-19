import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Date helper functions that properly handle timezone
export const getLocalDateString = (dateStr: string) => {
  // Create a date object and get the date in local timezone
  const date = new Date(dateStr);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

export function formatDate(dateString: string) {
  try {
    // Check if the dateString matches the expected format YYYY-MM-DD
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      throw new Error("Invalid date format. Expected YYYY-MM-DD");
    }

    // Split the date string by the hyphen
    const [year, monthIndex, day] = dateString.split("-");

    // Array of month names
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    // Convert the month index to integer and subtract 1 (since months are 0-indexed in our array)
    const monthNum = parseInt(monthIndex, 10) - 1;

    // Check if the month index is valid
    if (monthNum < 0 || monthNum >= 12) {
      throw new Error("Invalid month index");
    }

    // Get the month name
    const month = months[monthNum];

    // Remove leading zero from day if present
    const dayNum = parseInt(day, 10);

    // Format the date
    return `${month} ${dayNum}, ${year}`;
  } catch (err) {
    console.error(`Error formatting date: ${err}`);
    return dateString;
  }
}
