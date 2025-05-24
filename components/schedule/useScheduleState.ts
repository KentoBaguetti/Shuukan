import { format } from "date-fns";
import { useState } from "react";
import type { Event } from "./types";
import { DAYS } from "./types";

export const useScheduleState = () => {
	// Events by day name
	const [items, setItems] = useState<Record<string, Event[]>>(
		DAYS.reduce(
			(acc: Record<string, Event[]>, d) => {
				acc[d] = [];
				return acc;
			},
			{} as Record<string, Event[]>,
		),
	);

	// Modal & form state
	const [visible, setVisible] = useState(false);
	const [day, setDay] = useState(DAYS[0]);
	const [title, setTitle] = useState("");
	const [location, setLocation] = useState("");
	const [start, setStart] = useState(new Date());
	const [end, setEnd] = useState(new Date());
	const [pickerMode, setPickerMode] = useState<"start" | "end" | null>(null);
	const [tempTime, setTempTime] = useState<Date | null>(null);

	// Edit mode tracking
	const [isEditing, setIsEditing] = useState(false);
	const [editIndex, setEditIndex] = useState<number>(-1);

	// Current day index (0-6) for the real days
	const [currentDayIndex, setCurrentDayIndex] = useState(0);

	// Open add modal for the current day
	const openAddModal = () => {
		const currentDay = DAYS[currentDayIndex];
		setDay(currentDay);
		setTitle("");
		setLocation("");
		setStart(new Date());
		setEnd(new Date());
		setPickerMode(null);
		setTempTime(null);
		setIsEditing(false);
		setEditIndex(-1);
		setVisible(true);
	};

	// Open edit modal
	const openEditModal = (index: number) => {
		const currentDay = DAYS[currentDayIndex];
		const event = items[currentDay][index];
		setDay(currentDay);
		setTitle(event.title);
		setLocation(event.location);

		// Parse time strings to Date objects
		const today = new Date();
		const [startHours, startMinutes] = event.start.split(":").map(Number);
		const [endHours, endMinutes] = event.end.split(":").map(Number);

		const startDate = new Date(today);
		startDate.setHours(startHours, startMinutes, 0);

		const endDate = new Date(today);
		endDate.setHours(endHours, endMinutes, 0);

		setStart(startDate);
		setEnd(endDate);
		setPickerMode(null);
		setTempTime(null);
		setIsEditing(true);
		setEditIndex(index);
		setVisible(true);
	};

	// Save event (works for both add and edit)
	const save = () => {
		if (!title.trim() || !location.trim()) return;

		const s = format(start, "HH:mm");
		const e = format(end, "HH:mm");
		const eventData = {
			title: title.trim(),
			location: location.trim(),
			start: s,
			end: e,
		};

		setItems((prev) => {
			const newItems = { ...prev };

			if (isEditing) {
				// Update existing event
				newItems[day] = [...prev[day]];
				newItems[day][editIndex] = eventData;
			} else {
				// Add new event
				newItems[day] = [...prev[day], eventData];
			}

			// Sort events by start time
			newItems[day].sort((a, b) => (a.start > b.start ? 1 : -1));
			return newItems;
		});

		setVisible(false);
	};

	// Delete event (only from edit modal)
	const deleteEvent = () => {
		setItems((prev) => ({
			...prev,
			[day]: prev[day].filter((_, idx) => idx !== editIndex),
		}));
		setVisible(false);
	};

	// Close modal
	const closeModal = () => {
		setVisible(false);
		setPickerMode(null);
	};

	// Show time picker
	const showPicker = (mode: "start" | "end") => {
		setTempTime(mode === "start" ? start : end);
		setPickerMode(mode);
	};

	// Apply the selected time
	const applyTime = () => {
		if (tempTime && pickerMode) {
			if (pickerMode === "start") {
				setStart(tempTime);
			} else {
				setEnd(tempTime);
			}
		}
		setPickerMode(null);
		setTempTime(null);
	};

	const handlePickerChange = (selectedTime?: Date) => {
		if (selectedTime) {
			setTempTime(selectedTime);
		}
	};

	return {
		items,
		setItems,
		visible,
		setVisible,
		day,
		setDay,
		title,
		setTitle,
		location,
		setLocation,
		start,
		setStart,
		end,
		setEnd,
		pickerMode,
		setPickerMode,
		tempTime,
		setTempTime,
		isEditing,
		setIsEditing,
		editIndex,
		setEditIndex,
		currentDayIndex,
		setCurrentDayIndex,
		openAddModal,
		openEditModal,
		save,
		deleteEvent,
		closeModal,
		showPicker,
		applyTime,
		handlePickerChange,
	};
};
