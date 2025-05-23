import * as ScreenOrientation from "expo-screen-orientation";
import React, { useEffect, useRef, useState } from "react";
import {
	Modal,
	Pressable,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";

const POMODORO_DURATION = 45 * 60; // 45 minutes, the base time

const Index = () => {
	// Timer state
	const [time, setTime] = useState(POMODORO_DURATION);
	const [isRunning, setIsRunning] = useState(false);

	// Keep track of interval
	const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

	// Modal state
	const [modalVisible, setModalVisible] = useState(false);
	const [inputMinutes, setInputMinutes] = useState("");

	// Timer effect
	useEffect(() => {
		ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
		if (isRunning) {
			intervalRef.current = setInterval(() => {
				setTime((prev) => (prev > 0 ? prev - 1 : 0));
			}, 1000);
		} else if (intervalRef.current) {
			clearInterval(intervalRef.current);
			intervalRef.current = null;
		}
		return () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
				intervalRef.current = null;
			}
		};
	}, [isRunning]);

	// Reset timer when finished
	useEffect(() => {
		ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
		if (time === 0 && isRunning) {
			setIsRunning(false);
		}
	}, [time, isRunning]);

	// Format time as mm:ss
	const formatTime = (t: number) => {
		const m = Math.floor(t / 60)
			.toString()
			.padStart(2, "0");
		const s = (t % 60).toString().padStart(2, "0");
		return `${m}:${s}`;
	};

	const handleStartPause = () => setIsRunning((prev) => !prev);
	const handleReset = () => {
		setIsRunning(false);
		setTime(POMODORO_DURATION);
	};

	const handleTimerPress = () => {
		setInputMinutes(Math.floor(time / 60).toString());
		setModalVisible(true);
	};

	const handleInputChange = (text: string) => {
		// Only allow numbers
		if (/^\d*$/.test(text)) setInputMinutes(text);
	};

	const handleSetTime = () => {
		const mins = Number.parseInt(inputMinutes, 10);
		if (!Number.isNaN(mins) && mins > 0) {
			setTime(mins * 60);
		}
		setModalVisible(false);
		setIsRunning(false);
	};

	return (
		<View className="flex-1 justify-center items-center bg-gray-950">
			<Modal
				visible={modalVisible}
				transparent
				animationType="fade"
				onRequestClose={() => setModalVisible(false)}
			>
				<View className="flex-1 justify-center items-center bg-black/60">
					<View className="bg-white rounded-xl p-6 w-72">
						<Text className="text-lg font-semibold mb-2 text-center">
							Set Shuukan Time
						</Text>
						<TextInput
							className="border border-gray-300 rounded-lg px-4 py-2 text-3xl text-center mb-4"
							keyboardType="number-pad"
							value={inputMinutes}
							onChangeText={handleInputChange}
							maxLength={3}
							autoFocus
						/>
						<View className="flex-row justify-center space-x-4">
							<Pressable
								className="bg-blue-700 px-4 py-2 rounded-lg mr-1"
								onPress={handleSetTime}
							>
								<Text className="text-white font-semibold">Set</Text>
							</Pressable>
							<Pressable
								className="bg-gray-400 px-4 py-2 rounded-lg ml-1"
								onPress={() => setModalVisible(false)}
							>
								<Text className="text-white font-semibold">Cancel</Text>
							</Pressable>
						</View>
					</View>
				</View>
			</Modal>
			<View className="mb-8">
				<TouchableOpacity onPress={handleTimerPress} activeOpacity={0.7}>
					<Text className="text-6xl font-bold text-center text-white">
						{formatTime(time)}
					</Text>
					<Text className="text-center text-gray-400 text-xs mt-1">
						Tap to set time
					</Text>
				</TouchableOpacity>
			</View>
			<View className="flex-row space-x-4 mb-4">
				<TouchableOpacity
					className="bg-blue-700 px-6 py-2 rounded-full mr-1"
					onPress={handleStartPause}
				>
					<Text className="text-white text-lg font-semibold">
						{isRunning ? "Pause" : "Start"}
					</Text>
				</TouchableOpacity>
				<TouchableOpacity
					className="bg-gray-400 px-6 py-2 rounded-full ml-1"
					onPress={handleReset}
				>
					<Text className="text-white text-lg font-semibold">Reset</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
};

export default Index;
