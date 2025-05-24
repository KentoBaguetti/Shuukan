import type React from "react";
import { View } from "react-native";
import { Text } from "../StyledText";
import { HOURS } from "./types";

interface TimeColumnProps {
	hourHeight: number;
	timeColumnWidth: number;
}

export const TimeColumn: React.FC<TimeColumnProps> = ({
	hourHeight,
	timeColumnWidth,
}) => {
	return (
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
	);
};
