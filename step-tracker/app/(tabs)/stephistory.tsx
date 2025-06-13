import React, { useState, useEffect, useRef } from "react";
import { View, Text, Dimensions, Pressable, Animated } from "react-native";
import { useStepCounterContext } from "../../assets/StepCounterContext";
import { G, Rect } from "react-native-svg";
// @ts-ignore
import { BarChart, XAxis } from "react-native-svg-charts";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useFocusEffect } from "expo-router"; // or '@react-navigation/native'

const screenWidth = Dimensions.get("window").width;

type BarDatum = {
  value: number;
  date: string;
};

export default function StepHistory() {
  const context = useStepCounterContext();
  if (!context) return null;
  const { stepHistory } = context;

  // Prepare data
  const historyArray = Object.entries(stepHistory || {}).sort(([a], [b]) =>
    a.localeCompare(b)
  );
  const barData: BarDatum[] = historyArray.map(([date, steps]) => ({
    value: steps as number,
    date,
  }));

  // Animation progress (0 to 1)
  const animation = useRef(new Animated.Value(0)).current;
  const [animatedData, setAnimatedData] = useState(barData.map(() => 0));

  // Animation only when tab is focused
  useFocusEffect(
    React.useCallback(() => {
      animation.setValue(0);
      Animated.timing(animation, {
        toValue: 1,
        duration: 900,
        useNativeDriver: false,
      }).start();
      const id = animation.addListener(({ value }) => {
        setAnimatedData(barData.map((d) => Math.round(d.value * value)));
      });
      return () => animation.removeListener(id);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [barData.length])
  );

  // Bar selection
  const [selectedBar, setSelectedBar] = useState<number | null>(null);

  // Colors
  const barColor = "#22c55e";
  const bgColor = "#23272f";
  const accentColor = "#00FFFF";

  // X-axis labels
  const xLabels = barData.map((d, i) =>
    i === barData.length - 1 ? "Today" : new Date(d.date).getDate().toString()
  );

  // Y-axis ticks
  const maxSteps = Math.max(...barData.map((d) => d.value), 10000);
  const yTicks = [0, 2000, 4000, 6000, 8000, 10000].filter(
    (t) => t <= maxSteps
  );

  // Bar width for overlay
  const barWidth = ((screenWidth - 40) / barData.length) * 0.6;
  const chartHeight = 260;
  const chartWidth = screenWidth - 65; // ADJUSTING HERE !!! Shrink chart for y-axis labels and margin
  const chartMarginLeft = 29; // Move everything to the right

  // Combine animated values and color logic for each bar
  const chartData = barData.map((d, i) => ({
    value: animatedData[i] ?? 0,
    svg: {
      fill: selectedBar === i ? accentColor : barColor,
    },
  }));

  return (
    <View
      style={{ flex: 1, backgroundColor: bgColor, padding: 24, paddingTop: 48 }}
    >
      <Text
        style={{
          color: "#fff",
          fontSize: 28,
          fontWeight: "bold",
          alignSelf: "center",
          marginBottom: 24,
        }}
      >
        Step History (7 Days)
      </Text>
      {/* Chart container with marginLeft */}
      <View style={{ marginLeft: chartMarginLeft }}>
        <BarChart
          style={{ height: chartHeight, width: chartWidth }}
          data={chartData}
          yAccessor={({ item }: { item: { value: number } }) => item.value}
          spacingInner={0.4}
          contentInset={{ top: 20, bottom: 20 }}
          gridMin={0}
          gridMax={maxSteps}
          numberOfTicks={yTicks.length}
          animate={false}
        />
        {/* Overlay Pressables for bar selection */}
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: chartWidth,
            height: chartHeight,
            flexDirection: "row",
            justifyContent: "space-between",
            pointerEvents: "box-none",
          }}
        >
          {barData.map((_, i) => (
            <Pressable
              key={i}
              style={{
                width: barWidth * (chartWidth / (screenWidth - 48)), // scale bar width
                height: chartHeight,
                marginLeft:
                  i === 0
                    ? 0
                    : barWidth * 0.5 * (chartWidth / (screenWidth - 48)),
                backgroundColor: "transparent",
              }}
              onPress={() => setSelectedBar(i)}
            />
          ))}
        </View>
        <XAxis
          style={{ marginTop: 8, width: chartWidth, alignSelf: "center" }}
          data={barData}
          formatLabel={(_value: any, i: number) => xLabels[i]}
          contentInset={{ left: 20, right: 20 }}
          svg={{ fontSize: 14, fill: "#a1a1aa", fontWeight: "bold" }}
        />
        {/* Y-axis grid lines */}
        <View
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: chartWidth,
            height: chartHeight,
            pointerEvents: "none",
          }}
        >
          {yTicks.map((tick) => (
            <View
              key={tick}
              style={{
                position: "absolute",
                top: (1 - tick / maxSteps) * (chartHeight - 20),
                left: 0,
                right: 0,
                borderTopWidth: 1,
                borderTopColor: "#444",
              }}
            >
              <Text
                style={{
                  position: "absolute",
                  left: -chartMarginLeft,
                  top: -10,
                  color: "#a1a1aa",
                  fontSize: 12,
                  fontWeight: "bold",
                  width: chartMarginLeft - 8,
                  textAlign: "right",
                }}
              >
                {tick / 1000}k
              </Text>
            </View>
          ))}
        </View>
      </View>
      {/* Info card for selected bar */}
      {selectedBar !== null && (
        <View
          style={{
            marginTop: 32,
            alignSelf: "center",
            backgroundColor: "#18181b",
            borderRadius: 16,
            padding: 20,
            flexDirection: "row",
            alignItems: "center",
            shadowColor: "#000",
            shadowOpacity: 0.15,
            shadowRadius: 8,
          }}
        >
          <Icon
            name="walk"
            size={28}
            color={accentColor}
            style={{ marginRight: 12 }}
          />
          <View>
            <Text style={{ color: "#fff", fontSize: 22, fontWeight: "bold" }}>
              {barData[selectedBar].value} Steps
            </Text>
            <Text style={{ color: "#a1a1aa", fontSize: 16 }}>
              {selectedBar === barData.length - 1
                ? "Today"
                : new Date(barData[selectedBar].date).toLocaleDateString(
                    undefined,
                    { month: "short", day: "numeric" }
                  )}
            </Text>
          </View>
        </View>
      )}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          alignSelf: "center",
          marginTop: 40,
        }}
      >
        <Icon
          name="information-outline"
          size={20}
          color="#a1a1aa"
          style={{ marginRight: 6 }}
        />
        <Text
          style={{
            color: "#a1a1aa",
            fontSize: 12,
            opacity: 0.7,
          }}
        >
          Tap on the bars to see that day's steps
        </Text>
      </View>
    </View>
  );
}
