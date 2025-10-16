import { DateTime } from "luxon"; // Ensure you have: npm install luxon

export function getUserTimezoneDate(date = new Date(), timezone) {
    if (!timezone) timezone = "UTC"; // Default fallback
    return DateTime.fromJSDate(date).setZone(timezone).startOf('day').toJSDate();
}

export function getUserTimezoneRange(date = new Date(), timezone) {
    if (!timezone) timezone = "UTC"; // Default fallback
    const start = DateTime.fromJSDate(date).setZone(timezone).startOf('day').toJSDate();
    const end = DateTime.fromJSDate(date).setZone(timezone).endOf('day').toJSDate();
    return { start, end };
}
