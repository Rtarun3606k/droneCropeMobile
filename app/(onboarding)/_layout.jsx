import { Stack } from "expo-router";

const OnboardingLayout = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="FirstScreen" />
      <Stack.Screen name="CarouselScreen" />
    </Stack>
  );
};

export default OnboardingLayout;
