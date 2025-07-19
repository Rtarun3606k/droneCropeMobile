import { Stack } from "expo-router";
import "../global.css";
import { LanguageProvider } from "../src/contexts/LanguageContext";
import { AuthProvider } from "../src/hooks/useAuth";

export default function RootLayout() {
  console.log(process.env.EXPO_PUBLIC_API_URL, "API URL"); // Log the API URL for debugging
  return (
    <AuthProvider>
      <LanguageProvider>
        <Stack screenOptions={{
          headerShown: false,
        }} />
      </LanguageProvider>
    </AuthProvider>
  );
}
