// src/utils/sonido.ts

export async function reproducirSonidoExito() {
  try {
    // 1. Intentar requerir expo-av de forma segura
    const expoAv = require('expo-av');
    if (!expoAv || !expoAv.Audio) return;

    // 2. Reproducir el audio si el módulo nativo está disponible
    const { sound } = await expoAv.Audio.Sound.createAsync({
      uri: 'https://actions.google.com/sounds/v1/cartoon/clime.ogg',
    });
    await sound.playAsync();
  } catch (error) {
    // Si la plataforma no soporta el audio nativo, continúa el flujo sin romper la app
    console.log('Audio no disponible en este cliente nativo');
  }
}