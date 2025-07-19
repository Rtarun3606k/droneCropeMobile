import { Stack } from "expo-router";
import "../global.css";
import { LanguageProvider } from "../src/contexts/LanguageContext";

export default function RootLayout() {
  return (
    <LanguageProvider>
      <Stack screenOptions={{
        headerShown: false,
      }} />
    </LanguageProvider>
  );
}
