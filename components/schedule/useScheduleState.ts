import { format } from "date-fns";
import { useEffect, useMemo, useRef, useState } from "react";
import type { FlatList } from "react-native";
import { Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DAYS, type Event } from "./types";
import { loadScheduleData, saveScheduleData } from "./utils";

export function useScheduleState() {
	const { width, height } = Dimensions.get("window");
	const timeColumnWidth = 50; // Width of time column
	const dayColumnWidth = width - timeColumnWidth; // Full width minus time column
	const flatListRef = useRef<FlatList>(null);
	const insets = useSafeAreaInsets();

	// Track if scroll was triggered by user or programmatically
	const isManualScrollRef = useRef(true);

	// Calculate hour height to fit all 24 hours on screen
	const bottomInset = insets.bottom + 75; // 50px for tab bar itself
	const availableHeight = height - 60 - bottomInset - 20;
	const hourHeight = availableHeight / 24;

	// Current day index (0-6) for the real days
	const [currentDayIndex, setCurrentDayIndex] = useState(0); // We don't need to adjust the index anymore as we handle it directly in the renderDay function
	// Events by day name
	const [items, setItems] = useState<Record<string, Event[]>>(() =>
		DAYS.reduce(
			(acc, d) => {
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

	// Add canSave computed property
	const canSave = useMemo(() => {
		return title.trim() !== "" && location.trim() !== "";
	}, [title, location]);

	// Load saved schedule data when component mounts
	useEffect(() => {
		loadScheduleData(setItems);
	}, []);

	// Save schedule data whenever items change
	useEffect(() => {
		saveScheduleData(items);
	}, [items]);

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

	// Navigate to previous day with wrap-around
	const goToPrevDay = () => {
		isManualScrollRef.current = false;
		const newIndex = currentDayIndex === 0 ? 6 : currentDayIndex - 1;
		setCurrentDayIndex(newIndex);

		// Scroll to the extended array position (+1)
		flatListRef.current?.scrollToIndex({
			index: newIndex + 1,
			animated: true,
		});
	};

	// Navigate to next day with wrap-around
	const goToNextDay = () => {
		isManualScrollRef.current = false;
		const newIndex = currentDayIndex === 6 ? 0 : currentDayIndex + 1;
		setCurrentDayIndex(newIndex);

		// Scroll to the extended array position (+1)
		flatListRef.current?.scrollToIndex({
			index: newIndex + 1,
			animated: true,
		});
	};
	// Handle viewable items changed
	const handleViewableItemsChanged = ({
		viewableItems,
	}: {
		viewableItems: {
			index: number;
			item: string;
			isViewable: boolean;
			key: string;
		}[];
	}) => {
		if (!isManualScrollRef.current || viewableItems.length === 0) return;

		const visibleIndex = viewableItems[0].index;

		// Handle wraparound
		if (visibleIndex === 0) {
			// User scrolled to Sunday duplicate at beginning
			// Move to the real Sunday
			setTimeout(() => {
				flatListRef.current?.scrollToIndex({
					index: 7,
					animated: false,
				});
				setCurrentDayIndex(6); // Sunday
			}, 10);
		} else if (visibleIndex === 8) {
			// User scrolled to Monday duplicate at end
			// Move to the real Monday
			setTimeout(() => {
				flatListRef.current?.scrollToIndex({
					index: 1,
					animated: false,
				});
				setCurrentDayIndex(0); // Monday
			}, 10);
		} else if (visibleIndex > 0 && visibleIndex < 8) {
			// User is on a real day (1-7)
			setCurrentDayIndex(visibleIndex - 1);
		}
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

	// Handle time picker change
	const handlePickerChange = (selectedTime: Date | undefined) => {
		if (selectedTime) {
			setTempTime(selectedTime);
		}
	};

	// Initialize flatlist to the real first day on mount
	useEffect(() => {
		setTimeout(() => {
			flatListRef.current?.scrollToIndex({
				index: 1, // Monday in extended array
				animated: false,
			});
		}, 100);
	}, []);

	return {
		// Layout and refs
		timeColumnWidth,
		dayColumnWidth,
		hourHeight,
		flatListRef,
		isManualScrollRef,

		// Day state
		currentDayIndex,

		// Event data
		items,

		// Modal state
		visible,
		day,
		title,
		location,
		start,
		end,
		pickerMode,
		tempTime,
		isEditing,
		canSave,

		// Actions
		setTitle,
		setLocation,
		openAddModal,
		openEditModal,
		goToPrevDay,
		goToNextDay,
		handleViewableItemsChanged,
		save,
		deleteEvent,
		closeModal,
		showPicker,
		applyTime,
		handlePickerChange,
	};
}
