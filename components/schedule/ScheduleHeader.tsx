import type React from "react";
import { TouchableOpacity, View } from "react-native";
import { Text } from "../StyledText";
import { DAYS } from "./types";

interface ScheduleHeaderProps {
	currentDayIndex: number;
	onAddEvent: () => void;
	onPrevDay: () => void;
	onNextDay: () => void;
}

export const ScheduleHeader: React.FC<ScheduleHeaderProps> = ({
	currentDayIndex,
	onAddEvent,
	onPrevDay,
	onNextDay,
}) => {
	// Calculate the current date based on day of the week
	const today = new Date();
	const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
	const diff = currentDayIndex - ((currentDay + 6) % 7); // Convert to our index (0 = Monday)

	// Create a new date with the correct day
	const displayDate = new Date(today);
	displayDate.setDate(today.getDate() + diff);

	return (
		<View className="flex-row items-center justify-between p-3 border-b border-gray-800">
			<TouchableOpacity onPress={onPrevDay} className="p-2">
				<Text className="text-gray-200 text-lg">←</Text>
			</TouchableOpacity>
			<View className="flex-1 justify-center items-center">
				<TouchableOpacity onPress={onAddEvent}>
					<Text className="text-gray-200 font-bold text-xl text-center">
						{DAYS[currentDayIndex]}
					</Text>
					<Text className="text-gray-500 text-xs">
						Click me to add an event!
					</Text>
				</TouchableOpacity>
			</View>

			<TouchableOpacity onPress={onNextDay} className="p-2">
				<Text className="text-gray-200 text-lg">→</Text>
			</TouchableOpacity>
		</View>
	);
};
