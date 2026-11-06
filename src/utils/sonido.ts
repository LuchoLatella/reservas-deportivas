// src/utils/sonido.ts
export async function reproducirSonidoExito(): Promise<void> {
  try {
    // Import dinámico para prevenir que el ejecutable colapse si no existe ExponentAV
    const { Audio } = await import('expo-av');
    
    if (Audio && Audio.Sound) {
      const { sound } = await Audio.Sound.createAsync(
        // Si tenés un archivo de audio local, podés referenciarlo aquí
        // require('../../assets/exito.mp3')
        { uri: 'https://actions.google.com/sounds/v1/touches/glass_ping.ogg' }
      );
      await sound.playAsync();
    }
  } catch (error) {
    // Si la plataforma no soporta audio nativo o falta ExponentAV, continúa en silencio sin crash
    console.log('Audio nativo no disponible en esta sesión/plataforma.');
  }
}