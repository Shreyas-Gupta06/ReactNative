import { useEffect } from "react";
import { Stack } from "expo-router";

export default function RootLayout() {
  // useEffect(() => {
  //   const prepare = () => {
  //     console.log("Init app!!!");
  //     // await initStepTracking();
  //     // await SplashScreen.hideAsync();
  //   };

  //   prepare();
  // }, []);

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}
