import React from "react";
import { View } from "react-native";
import { Text } from "../../components/StyledText";

const profile = () => {
	return (
		<View className="flex-1 justify-center items-center bg-gray-950">
			<Text className="text-white text-lg">Profile</Text>
			<Text className="text-white text-sm">Coming soon!</Text>
		</View>
	);
};

export default profile;
