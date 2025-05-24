import type React from "react";
import { TouchableOpacity, View } from "react-native";
import { Text } from "../StyledText";
import type { Event } from "./types";
import { HOURS } from "./types";
import { getEventStyles } from "./utils";

interface DayColumnProps {
	dayName: string;
	hourHeight: number;
	dayColumnWidth: number;
	items: Record<string, Event[]>;
	openEditModal: (index: number) => void;
}

export const DayColumn: React.FC<DayColumnProps> = ({
	dayName,
	hourHeight,
	dayColumnWidth,
	items,
	openEditModal,
}) => {
	return (
		<View style={{ width: dayColumnWidth }}>
			{/* Hour grid lines */}
			{HOURS.map((hour) => (
				<View
					key={hour}
					style={{ height: hourHeight }}
					className="border-b border-gray-800"
				/>
			))}

			{/* Events for this day */}
			{items[dayName]?.map((event, eventIndex) => {
				const { top, height } = getEventStyles(
					event.start,
					event.end,
					hourHeight,
				);
				return (
					<TouchableOpacity
						key={`${event.title}-${event.start}-${event.end}-${eventIndex}`}
						style={{
							position: "absolute",
							top,
							left: 2,
							right: 2,
							height,
						}}
						className="bg-blue-600 rounded p-1 shadow-md"
						onPress={() => openEditModal(eventIndex)}
					>
						<Text
							className="text-white text-2xl font-semibold"
							numberOfLines={1}
						>
							{event.title}
						</Text>
						<Text
							className="text-white text-1xl font-semibold"
							numberOfLines={1}
						>
							{event.location}
						</Text>
						<Text className="text-gray-200 text-lg" numberOfLines={1}>
							{event.start} - {event.end}
						</Text>
					</TouchableOpacity>
				);
			})}
		</View>
	);
};
