import { Tabs } from "expo-router";
import React from "react";
import { useColorScheme, View } from "react-native";

export default function TabsLayout() {
	const colorScheme = useColorScheme();

	return (
		<Tabs
			screenOptions={{
				headerShown: false,
				tabBarStyle: {
					backgroundColor: colorScheme === "dark" ? "#000" : "#fff",
				},
				tabBarActiveTintColor: colorScheme === "dark" ? "#fff" : "#000",
				tabBarInactiveTintColor: colorScheme === "dark" ? "#666" : "#999",
			}}
		>
			<Tabs.Screen
				name="index"
				options={{
					title: "Timer",
					tabBarIcon: ({ color }) => (
						<View style={{ width: 24, height: 24, backgroundColor: color }} />
					),
				}}
			/>
			<Tabs.Screen
				name="profile"
				options={{
					title: "Profile",
					tabBarIcon: ({ color }) => (
						<View style={{ width: 24, height: 24, backgroundColor: color }} />
					),
				}}
			/>
		</Tabs>
	);
}
