import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Dimensions, FlatList, TouchableOpacity, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "../../components/StyledText";

// Import components and utilities for the schedule
import { DayColumn } from "../../components/schedule/DayColumn";
import { EventModal } from "../../components/schedule/EventModal";
import { TimeColumn } from "../../components/schedule/TimeColumn";
import { ScheduleHeader } from "../../components/schedule/ScheduleHeader";
import { DAYS, EXTENDED_DAYS, HOURS } from "../../components/schedule/types";
import { loadScheduleData, saveScheduleData, getEventStyles } from "../../components/schedule/utils";
import { useScheduleState } from "../../components/schedule/useScheduleState";

export default function Schedule() {
  const router = useRouter();
  const { width, height } = Dimensions.get("window");
  const timeColumnWidth = 50; // Width of time column
  const dayColumnWidth = width - timeColumnWidth; // Full width minus time column
  const flatListRef = useRef<FlatList>(null);
  const insets = useSafeAreaInsets();

  // Track if scroll was triggered by user or programmatically
  const isManualScrollRef = useRef(true);

  // Calculate hour height to fit all 24 hours on screen
  // Subtract header height (approx 60px), bottom tab bar, and padding
  const bottomInset = insets.bottom + 75; // 50px for tab bar itself
  const availableHeight = height - 60 - bottomInset - 20;
  const hourHeight = availableHeight / 24;
  
  const {
    items, setItems,
    visible, setVisible,
    day, setDay,
    title, setTitle,
    location, setLocation,
    start, setStart,
    end, setEnd,
    pickerMode, setPickerMode,
    tempTime, setTempTime,
    isEditing, setIsEditing,
    editIndex, setEditIndex,
    currentDayIndex, setCurrentDayIndex,
    openAddModal, openEditModal,
    save, deleteEvent,
    closeModal, showPicker,
    applyTime, handlePickerChange
  } = useScheduleState();

  // Load saved schedule data when component mounts
  useEffect(() => {
    loadScheduleData(setItems);
  }, []);

  // Save schedule data whenever items change
  useEffect(() => {
    saveScheduleData(items);
  }, [items]);

  // Navigate to previous day with wrap-around
  const goToPrevDay = () => {
    isManualScrollRef.current = false;
    const newIndex = currentDayIndex === 0 ? 6 : currentDayIndex - 1;
    setCurrentDayIndex(newIndex);

    // Scroll to the extended array position (+1)
    flatListRef.current?.scrollToIndex({
      index: newIndex + 1,
      animated: true,
    });
  };

  // Navigate to next day with wrap-around
  const goToNextDay = () => {
    isManualScrollRef.current = false;
    const newIndex = currentDayIndex === 6 ? 0 : currentDayIndex + 1;
    setCurrentDayIndex(newIndex);

    // Scroll to the extended array position (+1)
    flatListRef.current?.scrollToIndex({
      index: newIndex + 1,
      animated: true,
    });
  };

  // Handle viewable items changed
  const handleViewableItemsChanged = (info: { viewableItems: Array<{ index: number }> }) => {
    if (!isManualScrollRef.current || info.viewableItems.length === 0) return;

    const visibleIndex = info.viewableItems[0].index;

    // Handle wraparound
    if (visibleIndex === 0) {
      // User scrolled to Sunday duplicate at beginning
      // Move to the real Sunday
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({
          index: 7,
          animated: false,
        });
        setCurrentDayIndex(6); // Sunday
      }, 10);
    } else if (visibleIndex === 8) {
      // User scrolled to Monday duplicate at end
      // Move to the real Monday
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({
          index: 1,
          animated: false,
        });
        setCurrentDayIndex(0); // Monday
      }, 10);
    } else if (visibleIndex > 0 && visibleIndex < 8) {
      // User is on a real day (1-7)
      setCurrentDayIndex(visibleIndex - 1);
    }
  };

  // Initialize flatlist to the real first day (Monday at index 1)
  useEffect(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToIndex({
        index: 1, // Monday in extended array
        animated: false,
      });
    }, 100);
  }, []);

  // Render a single day column
  const renderDay = ({ item, index }: { item: string; index: number }) => {
    // Map from extended index to the real day name
    let dayName;
    if (index === 0) dayName = DAYS[6]; // Sunday duplicate at beginning
    else if (index === 8) dayName = DAYS[0]; // Monday duplicate at end
    else dayName = DAYS[index - 1]; // Real days

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
        <TimeColumn
          hourHeight={hourHeight}
          timeColumnWidth={timeColumnWidth}
        />

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
        canSave={title.trim() !== "" && location.trim() !== ""}
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
