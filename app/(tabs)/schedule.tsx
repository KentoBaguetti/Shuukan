import React from "react";
import { FlatList, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { DayColumn } from "../../components/schedule/DayColumn";
import { EventModal } from "../../components/schedule/EventModal";
import { ScheduleHeader } from "../../components/schedule/ScheduleHeader";
import { TimeColumn } from "../../components/schedule/TimeColumn";
import { EXTENDED_DAYS } from "../../components/schedule/types";
import { useScheduleState } from "../../components/schedule/useScheduleState";

export default function Schedule() {
	// Use our custom hook to manage all the state and logic
	const {
		// Layout and refs
		timeColumnWidth,
		dayColumnWidth,
		hourHeight,
		flatListRef,
		isManualScrollRef,

		// Day state
		currentDayIndex,

		// Event data
		items,

		// Modal state
		visible,
		day,
		title,
		location,
		start,
		end,
		pickerMode,
		tempTime,
		isEditing,
		canSave,

		// Actions
		setTitle,
		setLocation,
		openAddModal,
		openEditModal,
		goToPrevDay,
		goToNextDay,
		handleViewableItemsChanged,
		save,
		deleteEvent,
		closeModal,
		showPicker,
		applyTime,
		handlePickerChange,
	} = useScheduleState();

	// Render a single day column
	const renderDay = ({ item, index }) => {
		// Map from extended index to the real day name
		let dayName;
		if (index === 0)
			dayName = EXTENDED_DAYS[0]; // Sunday duplicate at beginning
		else if (index === 8)
			dayName = EXTENDED_DAYS[8]; // Monday duplicate at end
		else dayName = EXTENDED_DAYS[index]; // Real days

		return (
			<DayColumn
				dayName={dayName}
				hourHeight={hourHeight}
				dayColumnWidth={dayColumnWidth}
				items={items}
				openEditModal={openEditModal}
			/>
		);
	};

	return (
		<SafeAreaView className="flex-1 bg-gray-950">
			{/* Header with day navigation */}
			<ScheduleHeader
				currentDayIndex={currentDayIndex}
				onAddEvent={openAddModal}
				onPrevDay={goToPrevDay}
				onNextDay={goToNextDay}
			/>

			{/* Main schedule grid */}
			<View className="flex-1 flex-row">
				{/* Time column - stays fixed on the left */}
				<TimeColumn hourHeight={hourHeight} timeColumnWidth={timeColumnWidth} />

				{/* Day view with horizontal swipe */}
				<FlatList
					ref={flatListRef}
					data={EXTENDED_DAYS}
					horizontal
					pagingEnabled
					showsHorizontalScrollIndicator={false}
					renderItem={renderDay}
					keyExtractor={(item, index) => `${item}-${index}`}
					initialScrollIndex={1} // Start at the real Monday (index 1)
					getItemLayout={(_, index) => ({
						length: dayColumnWidth,
						offset: dayColumnWidth * index,
						index,
					})}
					onViewableItemsChanged={handleViewableItemsChanged}
					viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
					scrollEventThrottle={16}
					onScrollBeginDrag={() => {
						isManualScrollRef.current = true;
					}}
				/>
			</View>

			{/* Event Modal */}
			<EventModal
				visible={visible}
				day={day}
				title={title}
				location={location}
				start={start}
				end={end}
				isEditing={isEditing}
				canSave={canSave}
				pickerMode={pickerMode}
				tempTime={tempTime}
				onClose={closeModal}
				onSave={save}
				onDelete={deleteEvent}
				onTitleChange={setTitle}
				onLocationChange={setLocation}
				onShowPicker={showPicker}
				onApplyTime={applyTime}
				onPickerChange={handlePickerChange}
			/>
		</SafeAreaView>
	);
}
