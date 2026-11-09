// src/utils/sonido.ts

export async function reproducirSonidoExito(): Promise<void> {
  try {
    // Si la plataforma soporta el módulo nativo, intenta reproducir; 
    // de lo contrario, ignora en silencio sin lanzar excepción a la app
    const expoAV = await import('expo-av').catch(() => null);
    
    if (expoAV && expoAV.Audio) {
      const { sound } = await expoAV.Audio.Sound.createAsync(
        { uri: 'https://actions.google.com/sounds/v1/touches/glass_ping.ogg' }
      );
      await sound.playAsync();
    } else {
      console.log('Audio nativo omite reproducción (sin módulo ExponentAV)');
    }
  } catch (e) {
    // Captura limpia para evitar cualquier Uncaught Error durante la defensa
    console.log('Feedback de sonido omitido de forma segura');
  }
}