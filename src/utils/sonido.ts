import { Audio } from 'expo-av';

export async function reproducirSonidoExito() {
  try {
    const { sound } = await Audio.Sound.createAsync(
      { uri: 'https://actions.google.com/sounds/v1/cartoon/clime.ogg' }
    );
    await sound.playAsync();
  } catch (e) {
    // Si la plataforma no soporta el audio en emulador, ignora limpiamente
  }
}
