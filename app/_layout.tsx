// import { Stack } from 'expo-router';
// import 'react-native-reanimated';

// export default function RootLayout() {
//   return (
//     <Stack>
//       <Stack.Screen
//         name="(tabs)"
//         options={{ headerShown: false }}
//       />
//     </Stack>
//   );
// }

import { useEffect, useState } from "react";
import { Stack, useRouter } from "expo-router";
import { UsuarioServicio } from "../src/servicios/usuarios";

export default function RootLayout() {
  const router = useRouter();
  const [estaCargando, setEstaCargando] = useState(true);

  useEffect(() => {
    async function verificarSesion() {
      try {
        // Inicializamos la base de datos local SQLite para el soporte offline
        await UsuarioServicio.inicializarBaseDatosLocal();

        // Verificamos si existe un token guardado de una sesión activa previa
        const token = await UsuarioServicio.obtenerTokenDeSesion();

        if (!token) {
          // Usamos la ruta explícita tipada por Expo Router para evitar el error TS2345
          router.replace("./(auth)/login");
        } else {
          // Si el usuario ya está autenticado, pasa directo a las pestañas principales
          router.replace("/(tabs)");
        }
      } catch (error) {
        console.error("Error verificando sesión inicial:", error);
        router.replace("./(auth)/login");
      } finally {
        setEstaCargando(false);
      }
    }

    verificarSesion();
  }, []);

  if (estaCargando) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Definimos únicamente los grupos principales de pantallas aquí en la raíz */}
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}
