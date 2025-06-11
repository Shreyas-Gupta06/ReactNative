import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState, useEffect, useRef } from "react";
import { Accelerometer } from "expo-sensors";
import * as Notifications from "expo-notifications";

const STORAGE_KEY = "stepData";
const CURRENT_KEY = "currentSteps";
const LAST_UPDATED_KEY = "lastUpdatedDate";

export const getTodayDate = () => new Date().toISOString().split("T")[0];

const dateNDaysAgo = (n: number) => {
  const date = new Date();
  date.setDate(date.getDate() - n);
  return date.toISOString().split("T")[0];
};

const getDaysBetween = (start: string, end: string) => {
  const diffMs = new Date(end).getTime() - new Date(start).getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
};

export const getStepData = async () => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (err) {
    console.error("Error getting step data:", err);
    return {};
  }
};

export const saveStepData = async (data: any) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error("Error saving step data:", err);
  }
};

//=========================================================

// export const initStepTracking = async () => {
//   const today = getTodayDate();
//   console.log("date:", today);
//   const data = await getStepData();
//   console.log("stepdata:", data);

//   const raw = await AsyncStorage.getItem("currentSteps");

//   var saved = raw !== null ? parseInt(raw) : 0;
//   console.log("saved steps:", saved);

//   const lastUpdated = await AsyncStorage.getItem(LAST_UPDATED_KEY);
//   console.log("lastUpdated:", lastUpdated);
//   if (lastUpdated === today) {
//     console.log("Already up to date for today:");
//     return; // already up to date
//   }

//   const updatedData = { ...data };

//   if (lastUpdated === null) {
//     // First run ever
//     updatedData[today] = 0;
//     console.log("if statement");
//   } else {
//     console.log("else statement");
//     const daysGap = getDaysBetween(lastUpdated, today);
//     if (daysGap >= 1) {
//       // Store steps for last updated date
//       updatedData[lastUpdated] = saved;
//       console.log(
//         `Storing ${saved} steps for last updated date: ${lastUpdated}`
//       );
//       // Fill missing days (excluding today)
//       for (let i = 1; i < daysGap; i++) {
//         const missingDate = dateNDaysAgo(daysGap - i);
//         if (!updatedData[missingDate]) {
//           updatedData[missingDate] = 0;
//         }
//       }

//       // Add today's entry
//       updatedData[today] = 0;
//       //////test
//       saved = 0;
//       AsyncStorage.setItem("currentSteps", saved.toString());
//     }
//   }

//   // Keep only the last 7 days
//   const cleaned = Object.entries(updatedData)
//     .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime()) // newest first
//     .slice(0, 7)
//     .reverse(); // oldest first

//   const finalData = Object.fromEntries(cleaned);
//   console.log("Final step data:", finalData);

//   // Save everything back
//   await saveStepData(finalData);
//   console.log("Step data saved successfully.");
//   await AsyncStorage.setItem(LAST_UPDATED_KEY, today);
//   console.log("Last updated date set to today:");
// };

// //=============================================================================

export function useStepCounter() {
  const [stepCount, setStepCount] = useState(0);
  const [stepGoal, setStepGoal] = useState(10000);
  const [loaded, setLoaded] = useState(false);
  const lastStepTime = useRef(0);

  //intialize
  useEffect(() => {
    const load = async () => {
      const rawSteps = await AsyncStorage.getItem("currentSteps");
      if (rawSteps !== null) setStepCount(parseInt(rawSteps));
      const rawGoal = await AsyncStorage.getItem("stepGoal");
      if (rawGoal !== null) setStepGoal(parseInt(rawGoal));
      setLoaded(true);
      //console.log("first time!!!! Loaded steps:", stepCount, "Goal:", stepGoal);
    };
    load();
  }, []);

  useEffect(() => {
    //console.log("Loaded steps:", stepCount, "Goal:", stepGoal);
  }, [stepCount, stepGoal]);

  useEffect(() => {
    if (loaded) {
      AsyncStorage.setItem("currentSteps", stepCount.toString());
    }
  }, [stepCount, loaded]);

  useEffect(() => {
    if (loaded) {
      AsyncStorage.setItem("stepGoal", stepGoal.toString());
    }
    //console.log("saved stepgaolzzz", stepGoal);
  }, [stepGoal, loaded]);

  useEffect(() => {
    Accelerometer.setUpdateInterval(100);
    const subscription = Accelerometer.addListener(({ x, y, z }) => {
      const magnitude = Math.sqrt(x * x + y * y + z * z);
      const now = Date.now();
      if (magnitude > 1.5 && now - lastStepTime.current > 600) {
        lastStepTime.current = now;
        setStepCount((n) => n + 1);
      }
    });

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      if (stepCount < stepGoal) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "Step Goal Not Fulfilled",
            body: `You have ${stepCount} steps. Goal: ${stepGoal}`,
          },
          trigger: null,
        });
      }
    }, 5000); // every 5 sec

    return () => clearInterval(interval);
  }, [stepCount, stepGoal]);

  useEffect(() => {
    async function requestPermissions() {
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== "granted") {
        await Notifications.requestPermissionsAsync();
      }
    }
    requestPermissions();
  }, []);

  function resetSteps() {
    console.log("Resetting steps", stepCount);
    setStepCount(0);
    console.log("Steps reset to 0");
  }

  return { stepCount, resetSteps, stepGoal, setStepGoal };
}
