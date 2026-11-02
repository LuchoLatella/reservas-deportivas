import { Stack } from "expo-router";
import { useColorScheme } from "react-native";

export default function AuthLayout() {
  const colorScheme = useColorScheme();
  const esOscuro = colorScheme === "dark";

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: esOscuro ? "#121212" : "#FFFFFF",
        },
        headerTintColor: esOscuro ? "#FFFFFF" : "#000000",
        headerTitleStyle: {
          fontWeight: "bold",
        },
        // Animación suave de transición entre login y registro
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen
        name="login"
        options={{
          title: "Iniciar Sesión",
          headerShown: false, // Ocultamos barra superior para un diseño más limpio
        }}
      />
      <Stack.Screen
        name="registro"
        options={{
          title: "Crear Cuenta",
          headerBackTitle: "Volver",
        }}
      />
    </Stack>
  );
}
