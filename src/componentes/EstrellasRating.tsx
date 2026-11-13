import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Props {
  puntuacion: number; // Valor de 0 a 5
  alCambiar?: (nuevaPuntuacion: number) => void;
  tamano?: number;
  interactivo?: boolean;
}

export function EstrellasRating({
  puntuacion,
  alCambiar,
  tamano = 18,
  interactivo = false,
}: Props) {
  const estrellas = [1, 2, 3, 4, 5];

  return (
    <View style={styles.container}>
      {estrellas.map((estrella) => {
        const estaLlena = estrella <= Math.round(puntuacion);

        return (
          <TouchableOpacity
            key={estrella}
            disabled={!interactivo}
            onPress={() => alCambiar && alCambiar(estrella)}
            style={styles.estrellaTouch}
          >
            <Text style={[styles.estrellaText, { fontSize: tamano }]}>
              {estaLlena ? '★' : '☆'}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  estrellaTouch: {
    padding: 2,
  },
  estrellaText: {
    color: '#fbc02d', // Amarillo dorado
  },
});