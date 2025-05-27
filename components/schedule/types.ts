// Common types for the schedule component
export type Event = {
	title: string;
	location: string;
	start: string;
	end: string;
};

// Storage key for schedule data
export const STORAGE_KEY = "shuukan_schedule_data";

// Days of the week
export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Create extended data array for circular scrolling
// This includes the real days (indexes 1-7) with duplicates at both ends
export const EXTENDED_DAYS = [...DAYS.slice(-1), ...DAYS, ...DAYS.slice(0, 1)];

// Generate hours from 0-23
export const HOURS = Array.from({ length: 24 }, (_, i) => i);
