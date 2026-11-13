// src/utils/sonido.ts

export async function reproducirSonidoExito(): Promise<void> {
  // Función 'no-op' segura para emulador/Expo Go: 
  // Evita intentar la importación de ExponentAV evitando alertas en consola
  try {
    // Si en un APK compilado se requiere audio nativo, se evalúa dinámicamente
    const globalExpo = (globalThis as any).Expo;
    if (globalExpo && globalExpo.modules && globalExpo.modules.ExponentAV) {
      const expoAV = await import('expo-av');
      const { sound } = await expoAV.Audio.Sound.createAsync(
        { uri: 'https://actions.google.com/sounds/v1/touches/glass_ping.ogg' }
      );
      await sound.playAsync();
    }
  } catch (e) {
    // Silencio absoluto durante la ejecución
  }
}