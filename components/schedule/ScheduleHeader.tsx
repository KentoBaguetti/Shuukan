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
