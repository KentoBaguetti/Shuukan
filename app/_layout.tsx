import { Stack } from "expo-router";
import { useColorScheme } from "react-native";
import "./globals.css";

export default function RootLayout() {
	const colorScheme = useColorScheme();

	return (
		<Stack
			screenOptions={{
				headerShown: false,
				contentStyle: {
					backgroundColor: colorScheme === "dark" ? "#000" : "#fff",
				},
			}}
		>
			<Stack.Screen name="(tabs)" />
		</Stack>
	);
}
