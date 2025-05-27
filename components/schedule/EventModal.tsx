import DateTimePicker from "@react-native-community/datetimepicker";
import { format } from "date-fns";
import type React from "react";
import {
	Modal,
	Pressable,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import { Text } from "../StyledText";

interface EventModalProps {
	visible: boolean;
	day: string;
	title: string;
	location: string;
	start: Date;
	end: Date;
	isEditing: boolean;
	canSave: boolean;
	pickerMode: "start" | "end" | null;
	tempTime: Date | null;
	onClose: () => void;
	onSave: () => void;
	onDelete: () => void;
	onTitleChange: (text: string) => void;
	onLocationChange: (text: string) => void;
	onShowPicker: (mode: "start" | "end") => void;
	onApplyTime: () => void;
	onPickerChange: (selectedTime: Date | undefined) => void;
}

export const EventModal: React.FC<EventModalProps> = ({
	visible,
	day,
	title,
	location,
	start,
	end,
	isEditing,
	canSave,
	pickerMode,
	tempTime,
	onClose,
	onSave,
	onDelete,
	onTitleChange,
	onLocationChange,
	onShowPicker,
	onApplyTime,
	onPickerChange,
}) => {
	return (
		<Modal visible={visible} transparent animationType="fade">
			<Pressable className="flex-1 bg-black/50" onPress={onApplyTime}>
				<View
					className="flex-1 justify-center px-4"
					onStartShouldSetResponder={() => true}
				>
					<Pressable className="bg-white rounded-lg">
						{/* Modal Header with day and buttons */}
						<View className="flex-row items-center justify-between p-4 border-b border-gray-200">
							<TouchableOpacity onPress={onClose}>
								<Text className="text-red-500 font-medium">Cancel</Text>
							</TouchableOpacity>
							<Text className="text-gray-900 font-bold">{day}</Text>
							<TouchableOpacity onPress={onSave} disabled={!canSave}>
								<Text
									className={`${
										canSave ? "text-blue-500" : "text-gray-400"
									} font-medium`}
								>
									{isEditing ? "Save" : "Add"}
								</Text>
							</TouchableOpacity>
						</View>

						{/* Modal body */}
						<View className="p-4">
							{/* Title input */}
							<TextInput
								placeholder="Title"
								placeholderTextColor="#808080"
								className="border-b border-gray-300 pb-2 mb-4 text-base"
								value={title}
								onChangeText={onTitleChange}
							/>

							{/* Location input */}
							<TextInput
								placeholder="Location or Video Call"
								placeholderTextColor="#808080"
								className="border-b border-gray-300 pb-2 mb-4 text-base"
								value={location}
								onChangeText={onLocationChange}
							/>

							{/* Start/End rows */}
							<View className="mt-2">
								{/* Start */}
								<TouchableOpacity
									onPress={() => onShowPicker("start")}
									className="flex-row justify-between py-3 border-b border-gray-200"
								>
									<Text className="text-gray-700">Starts</Text>
									<Text className="text-gray-900 font-medium">
										{format(start, "HH:mm")}
									</Text>
								</TouchableOpacity>

								{/* End */}
								<TouchableOpacity
									onPress={() => onShowPicker("end")}
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
									onPress={onDelete}
									className="mt-6 py-3 items-center"
								>
									<Text className="text-red-500 font-medium">Delete Event</Text>
								</TouchableOpacity>
							)}
						</View>

						{/* Time picker */}
						{pickerMode && (
							<View className="border-t border-gray-200">
								<View className="flex-row justify-between items-center p-3 bg-gray-100">
									<Text className="text-gray-500 font-medium pl-2">
										{pickerMode === "start" ? "Set Start Time" : "Set End Time"}
									</Text>
									<TouchableOpacity onPress={onApplyTime} className="px-4 py-2">
										<Text className="text-blue-500 font-medium">Done</Text>
									</TouchableOpacity>
								</View>
								<View className="bg-gray-50 pb-4">
									<DateTimePicker
										value={tempTime || (pickerMode === "start" ? start : end)}
										mode="time"
										display="spinner"
										onChange={(event, selectedTime) => {
											if (event.type === "set" && selectedTime) {
												onPickerChange(selectedTime);
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
	);
};
