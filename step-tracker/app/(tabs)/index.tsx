import React, { useState, useEffect } from "react";
import * as Animatable from "react-native-animatable";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Keyboard,
  TouchableWithoutFeedback,
  TouchableOpacity,
  StatusBar,
  Modal,
  Pressable,
} from "react-native";
import { useStepCounter } from "../../assets/functions";
import { AnimatedCircularProgress } from "react-native-circular-progress";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import * as Notifications from "expo-notifications";
import styles from "../../assets/styles";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const STEP_LENGTH = 0.75; // meters
const CALORIES_PER_STEP = 0.045;

export default function StepPage() {
  const { stepCount, resetSteps, setStepGoal, stepGoal } = useStepCounter();
  const [goalInput, setGoalInput] = useState(stepGoal.toString()); // for equating inputgoal and stepgoal
  const [showCelebration, setShowCelebration] = useState(false);
  const [resetPressed, setResetPressed] = useState(false); // reset button
  const [goalPressed, setGoalPressed] = useState(false); // set goal button
  const [infoVisible, setInfoVisible] = useState(false);
  const [goalAchieved, setGoalAchieved] = useState(false); //for celebration animation like if goal achieved it wont keep saying that message, resets whenever u reset steps or change goal

  useEffect(() => {
    setGoalInput(stepGoal.toString());
  }, [stepGoal]);

  // Reset goalAchieved for animation purposes when goal changes or we reset steps
  useEffect(() => {
    setGoalAchieved(false);
  }, [stepGoal]);

  const handleResetSteps = () => {
    resetSteps();
    setGoalAchieved(false);
  };

  // Show celebration only once per goal
  useEffect(() => {
    if (stepCount >= stepGoal && !showCelebration && !goalAchieved) {
      setShowCelebration(true);
      setGoalAchieved(true); // Mark as celebrated
      setTimeout(() => setShowCelebration(false), 3200);
    }
  }, [stepCount, stepGoal, showCelebration, goalAchieved]);

  const progress = Math.min(stepCount / stepGoal, 1);

  const distance = ((stepCount * STEP_LENGTH) / 1000).toFixed(2); // km
  const calories = Math.round(stepCount * CALORIES_PER_STEP);

  function formatTime(steps: number) {
    const minutes = Math.floor(steps / 120);
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours > 0 ? `${hours}h ` : ""}${mins}m`;
  }

  return (
    <>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#23272f"
        translucent={false}
      />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          {/* Info icon in top right */}
          <TouchableOpacity
            style={styles.infoIcon}
            onPress={() => setInfoVisible(true)}
            activeOpacity={0.7}
          >
            <Icon name="information-outline" size={28} color="#fff" />
          </TouchableOpacity>

          <Text style={styles.title}>Step Tracker</Text>
          <AnimatedCircularProgress
            size={220}
            width={18}
            fill={progress * 100}
            tintColor="#ef476f"
            backgroundColor="#2d3340"
            rotation={0}
            lineCap="round"
            style={{ marginBottom: 16 }}
          >
            {() =>
              showCelebration ? (
                <Animatable.View
                  animation="bounceIn"
                  duration={1500}
                  style={{
                    flex: 1,
                    alignItems: "center",
                    justifyContent: "center",
                    width: "100%",
                    height: "100%",
                    position: "absolute",
                    top: 0,
                    left: 0,
                  }}
                >
                  <Text
                    style={{ fontSize: 44, color: "#fff", textAlign: "center" }}
                  >
                    🎉
                  </Text>
                  <Text
                    style={{
                      fontSize: 22,
                      color: "#fff",
                      textAlign: "center",
                      marginTop: 8,
                    }}
                  >
                    Goal Achieved!
                  </Text>
                </Animatable.View>
              ) : (
                <View style={{ alignItems: "center" }}>
                  <Icon
                    name="shoe-print"
                    size={50}
                    color="#ef476f"
                    style={{ marginBottom: 4 }}
                  />
                  <Text style={styles.stepCount}>{stepCount}</Text>
                  <Text style={styles.goalInCircle}>Goal: {stepGoal}</Text>
                </View>
              )
            }
          </AnimatedCircularProgress>

          {/* Stats cards row */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Icon
                name="clock-outline"
                size={28}
                color="#e5ff00"
                style={{ marginBottom: 4 }}
              />
              <Text style={styles.statValue}>{formatTime(stepCount)}</Text>
              <Text style={styles.statLabel}>Time</Text>
            </View>
            <View style={styles.statCard}>
              <Icon
                name="fire"
                size={28}
                color="#ff9100"
                style={{ marginBottom: 4 }}
              />
              <Text style={styles.statValue}>{calories} kcal</Text>
              <Text style={styles.statLabel}>Calories</Text>
            </View>
            <View style={styles.statCard}>
              <Icon
                name="map-marker"
                size={28}
                color="#4ade80"
                style={{ marginBottom: 4 }}
              />
              <Text style={styles.statValue}>{distance} km</Text>
              <Text style={styles.statLabel}>Distance</Text>
            </View>
          </View>

          {/* Goal input row */}
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={goalInput}
              onChangeText={setGoalInput}
              onSubmitEditing={() => {
                const goal = parseInt(goalInput);
                if (!isNaN(goal) && goal > 0) {
                  setStepGoal(goal);
                } else {
                  setGoalInput(stepGoal.toString());
                }
              }}
              keyboardType="numeric"
              placeholder="Enter custom goal"
              placeholderTextColor="#888"
              returnKeyType="done"
            />
            <TouchableOpacity
              activeOpacity={0.8}
              onPressIn={() => setGoalPressed(true)}
              onPressOut={() => setGoalPressed(false)}
              onPress={() => {}}
              style={[
                styles.premiumButton,
                goalPressed && { transform: [{ translateY: 2 }], opacity: 0.7 },
              ]}
            >
              <Icon
                name="pencil"
                size={18}
                color="#60a5fa"
                style={{ marginRight: 6 }}
              />
              <Text style={styles.premiumButtonText}>Change Goal</Text>
            </TouchableOpacity>
          </View>

          {/* Reset steps button */}
          <TouchableOpacity
            style={[
              styles.premiumButtonFilled,
              resetPressed && { transform: [{ translateY: 2 }], opacity: 0.7 },
              { marginTop: 24 },
            ]}
            activeOpacity={0.8}
            onPressIn={() => setResetPressed(true)}
            onPressOut={() => setResetPressed(false)}
            onPress={handleResetSteps}
          >
            <Icon
              name="refresh"
              size={18}
              color="#fff"
              style={{ marginRight: 6 }}
            />
            <Text style={styles.premiumButtonFilledText}>Reset Steps</Text>
          </TouchableOpacity>

          {/* Info Modal for overlaying content for info icon*/}
          <Modal
            visible={infoVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setInfoVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>How We Calculate</Text>
                <Text style={styles.modalText}>
                  <Text style={{ fontWeight: "bold" }}>Assumptions:</Text>
                  {"\n"}• Average step length: 0.75 meters
                  {"\n"}• Average walking speed: 120 steps/minute
                  {"\n"}• Calories burned per step: 0.045 kcal
                  {"\n\n"}
                  <Text style={{ fontWeight: "bold" }}>Formulas:</Text>
                  {"\n"}• <Text style={{ fontWeight: "bold" }}>Distance</Text>:
                  steps × 0.75 ÷ 1000 (in km)
                  {"\n"}• <Text style={{ fontWeight: "bold" }}>Calories</Text>:
                  steps × 0.045 (in kcal)
                  {"\n"}• <Text style={{ fontWeight: "bold" }}>Time</Text>:
                  steps ÷ 120 (in minutes)
                </Text>
                <Pressable
                  style={styles.closeButton}
                  onPress={() => setInfoVisible(false)}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </Pressable>
              </View>
            </View>
          </Modal>
        </View>
      </TouchableWithoutFeedback>
    </>
  );
}
