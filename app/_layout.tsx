import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { useColorScheme } from "react-native";
import "./globals.css";

// Keep splash screen visible while fonts load
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
	const [fontsLoaded] = useFonts({
		Minecraft: require("../assets/fonts/Minecraft.ttf"),
	});

	useEffect(() => {
		if (fontsLoaded) {
			SplashScreen.hideAsync();
		}
	}, [fontsLoaded]);

	const colorScheme = useColorScheme();

	if (!fontsLoaded) {
		return null;
	}

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
