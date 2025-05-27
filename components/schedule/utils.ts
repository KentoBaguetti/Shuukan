import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";
import { type Event, STORAGE_KEY } from "./types";

// Load schedule data from AsyncStorage
export const loadScheduleData = async (
	setItems: React.Dispatch<React.SetStateAction<Record<string, Event[]>>>,
) => {
	try {
		const savedData = await AsyncStorage.getItem(STORAGE_KEY);
		if (savedData) {
			setItems(JSON.parse(savedData));
		}
	} catch (error) {
		console.error("Failed to load schedule data:", error);
		Alert.alert(
			"Error",
			"Failed to load your schedule. Some data may be missing.",
		);
	}
};

// Save schedule data to AsyncStorage
export const saveScheduleData = async (items: Record<string, Event[]>) => {
	try {
		await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
	} catch (error) {
		console.error("Failed to save schedule data:", error);
		Alert.alert("Error", "Failed to save your changes to schedule.");
	}
};

// Calculate event position and height based on start and end times
export const getEventStyles = (
	start: string,
	end: string,
	hourHeight: number,
) => {
	const [startHour, startMinute] = start.split(":").map(Number);
	const [endHour, endMinute] = end.split(":").map(Number);

	const startPosition =
		startHour * hourHeight + (startMinute / 60) * hourHeight;
	const endPosition = endHour * hourHeight + (endMinute / 60) * hourHeight;
	const height = endPosition - startPosition;

	return {
		top: startPosition,
		height: Math.max(height, Math.min(30, hourHeight * 0.8)), // Adaptive minimum height
	};
};
