import DateTimePicker from "@react-native-community/datetimepicker";
import { format } from "date-fns";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
	Dimensions,
	Modal,
	Pressable,
	ScrollView,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
// Generate hours from 0-23
const HOURS = Array.from({ length: 24 }, (_, i) => i);

type Event = { title: string; location: string; start: string; end: string };

export default function Schedule() {
	const router = useRouter();
	const { width } = Dimensions.get("window");
	const hourHeight = 60; // Height for one hour in pixels
	const timeColumnWidth = 42; // Width of time column
	const dayColumnWidth = (width - timeColumnWidth) / DAYS.length;
	const scrollViewRef = useRef<ScrollView>(null);

	// Events by day name
	const [items, setItems] = useState<Record<string, Event[]>>(
		DAYS.reduce((acc, d) => ({ ...acc, [d]: [] }), {} as any),
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

	// Can add/save validation
	const canSave = title.trim() !== "" && location.trim() !== "";

	// Open add modal
	const openAddModal = (d: string) => {
		setDay(d);
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
	const openEditModal = (d: string, index: number) => {
		const event = items[d][index];
		setDay(d);
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

	// Helper function to calculate event position and height
	const getEventStyles = (start: string, end: string) => {
		const [startHour, startMinute] = start.split(":").map(Number);
		const [endHour, endMinute] = end.split(":").map(Number);

		const startPosition =
			startHour * hourHeight + (startMinute / 60) * hourHeight;
		const endPosition = endHour * hourHeight + (endMinute / 60) * hourHeight;
		const height = endPosition - startPosition;

		return {
			top: startPosition,
			height: Math.max(height, 30), // Minimum height of 30px
		};
	};

	// Scroll to 12:00 when component mounts
	useEffect(() => {
		// Short delay to ensure the ScrollView is rendered
		const timer = setTimeout(() => {
			if (scrollViewRef.current) {
				scrollViewRef.current.scrollTo({ y: 7 * hourHeight, animated: false });
			}
		}, 100);

		return () => clearTimeout(timer);
	}, []);

	return (
		<SafeAreaView className="flex-1 bg-gray-950">
			{/* Day headers */}
			<View className="flex-row border-b border-gray-800">
				{/* Empty cell for time column */}
				<View style={{ width: timeColumnWidth }} className="bg-gray-900" />

				{/* Day headers */}
				{DAYS.map((d) => (
					<TouchableOpacity
						key={d}
						style={{ width: dayColumnWidth }}
						onPress={() => openAddModal(d)}
						className="py-3 items-center bg-gray-800"
					>
						<Text className="text-gray-200 font-medium">{d}</Text>
					</TouchableOpacity>
				))}
			</View>

			{/* Timeline with events */}
			<ScrollView ref={scrollViewRef}>
				<View className="flex-row">
					{/* Time column */}
					<View style={{ width: timeColumnWidth }}>
						{HOURS.map((hour) => (
							<View
								key={hour}
								style={{ height: hourHeight }}
								className="border-b border-gray-800 justify-center"
							>
								<Text className="text-gray-400 text-xs text-right pr-2">
									{hour.toString().padStart(2, "0")}:00
								</Text>
							</View>
						))}
					</View>

					{/* Day columns with events */}
					{DAYS.map((d) => (
						<View
							key={d}
							style={{ width: dayColumnWidth }}
							className="relative border-l border-gray-800"
						>
							{/* Hour grid lines */}
							{HOURS.map((hour) => (
								<View
									key={hour}
									style={{ height: hourHeight }}
									className="border-b border-gray-800"
								/>
							))}

							{/* Events */}
							{items[d].map((event, index) => {
								const { top, height } = getEventStyles(event.start, event.end);
								return (
									<TouchableOpacity
										key={index}
										style={{
											position: "absolute",
											top,
											left: 2,
											right: 2,
											height,
										}}
										className="bg-blue-600 rounded p-1 shadow-md"
										onPress={() => openEditModal(d, index)}
									>
										<Text
											className="text-white text-xs font-semibold"
											numberOfLines={1}
										>
											{event.title}
										</Text>
										<Text className="text-gray-200 text-xs" numberOfLines={1}>
											{event.start} - {event.end}
										</Text>
									</TouchableOpacity>
								);
							})}
						</View>
					))}
				</View>
			</ScrollView>

			{/* Add/Edit Event Modal */}
			<Modal visible={visible} transparent animationType="fade">
				<Pressable className="flex-1 bg-black/50" onPress={applyTime}>
					<View
						className="flex-1 justify-center px-4"
						onStartShouldSetResponder={() => true}
					>
						<Pressable className="bg-white rounded-lg">
							{/* Modal Header with day and buttons */}
							<View className="flex-row items-center justify-between p-4 border-b border-gray-200">
								<TouchableOpacity onPress={closeModal}>
									<Text className="text-red-500 font-medium">Cancel</Text>
								</TouchableOpacity>
								<Text className="text-gray-900 font-bold">{day}</Text>
								<TouchableOpacity onPress={save} disabled={!canSave}>
									<Text
										className={`${
											canSave ? "text-blue-500" : "text-gray-400"
										} font-medium`}
									>
										{isEditing ? "Save" : "Add"}
									</Text>
								</TouchableOpacity>
							</View>

							<View className="p-4">
								{/* Title input */}
								<TextInput
									placeholder="Title"
									className="border-b border-gray-300 pb-2 mb-4 text-base"
									value={title}
									onChangeText={setTitle}
								/>

								{/* Location input */}
								<TextInput
									placeholder="Location or Video Call"
									className="border-b border-gray-300 pb-2 mb-4 text-base"
									value={location}
									onChangeText={setLocation}
								/>

								{/* Start/End rows */}
								<View className="mt-2">
									{/* Start */}
									<TouchableOpacity
										onPress={() => showPicker("start")}
										className="flex-row justify-between py-3 border-b border-gray-200"
									>
										<Text className="text-gray-700">Starts</Text>
										<Text className="text-gray-900 font-medium">
											{format(start, "HH:mm")}
										</Text>
									</TouchableOpacity>

									{/* End */}
									<TouchableOpacity
										onPress={() => showPicker("end")}
										className="flex-row justify-between py-3 border-b border-gray-200"
									>
										<Text className="text-gray-700">Ends</Text>
										<Text className="text-gray-900 font-medium">
											{format(end, "HH:mm")}
										</Text>
									</TouchableOpacity>
								</View>

								{/* Delete button - only show in edit mode */}
								{isEditing && (
									<TouchableOpacity
										onPress={deleteEvent}
										className="mt-6 py-3 items-center"
									>
										<Text className="text-red-500 font-medium">
											Delete Event
										</Text>
									</TouchableOpacity>
								)}
							</View>

							{/* Time picker - now in Apple style */}
							{pickerMode && (
								<View className="border-t border-gray-200">
									<View className="flex-row justify-between items-center p-3 bg-gray-100">
										<Text className="text-gray-500 font-medium pl-2">
											{pickerMode === "start"
												? "Set Start Time"
												: "Set End Time"}
										</Text>
										<TouchableOpacity onPress={applyTime} className="px-4 py-2">
											<Text className="text-blue-500 font-medium">Done</Text>
										</TouchableOpacity>
									</View>
									<View className="bg-gray-50 pb-4">
										<DateTimePicker
											value={tempTime || (pickerMode === "start" ? start : end)}
											mode="time"
											display="spinner"
											onChange={(_, selectedTime) => {
												if (selectedTime) {
													setTempTime(selectedTime);
												}
											}}
											textColor="#000000"
											style={{
												backgroundColor: "#f5f5f5",
												height: 180,
											}}
										/>
									</View>
								</View>
							)}
						</Pressable>
					</View>
				</Pressable>
			</Modal>
		</SafeAreaView>
	);
}
