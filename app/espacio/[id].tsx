import { crearReserva, obtenerEspacioPorId, obtenerTurnosDisponibles } from '@/servicios';
import { Espacio } from '@/tipos/espacio';
import { Turno } from '@/tipos/turno';
import { obtenerFechaRelativa } from '@/utils/fechas';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

export default function DetalleEspacioScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [espacio, setEspacio] = useState<Espacio | null>(null);
  const [fechaSeleccionada, setFechaSeleccionada] = useState(obtenerFechaRelativa(0));
  const [turnos, setTurnos] = useState<Turno[]>([]);

  useEffect(() => {
    if (id) {
      obtenerEspacioPorId(id).then(setEspacio);
      cargarTurnos(fechaSeleccionada);
    }
  }, [id, fechaSeleccionada]);

  async function cargarTurnos(fecha: string) {
    if (id) {
      const disponibles = await obtenerTurnosDisponibles(id, fecha);
      setTurnos(disponibles);
    }
  }

  async function handleReservar(turnoId: string) {
    try {
      // Usamos el usuario de prueba 'usr-01'
      const nuevaReserva = await crearReserva(turnoId, 'usr-01', 4);
      Alert.alert('¡Éxito!', 'Reserva realizada correctamente.', [
        { text: 'Ver Reserva', onPress: () => router.push({ pathname: '/reserva/[id]', params: { id: nuevaReserva.id } }) },
      ]);
    } catch (error: any) {
      Alert.alert('Error al reservar', error.message);
    }
  }

  if (!espacio) return <View style={styles.container}><Text>Cargando espacio...</Text></View>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{espacio.nombre}</Text>
      <Text style={styles.subtitle}>{espacio.complejo} - {espacio.superficie}</Text>
      <Text style={styles.price}>${espacio.precioPorHora} / hora</Text>

      <Text style={styles.sectionTitle}>Reglas del espacio:</Text>
      {espacio.reglas.map((r, i) => (
        <Text key={i} style={styles.ruleItem}>• {r}</Text>
      ))}

      <Text style={styles.sectionTitle}>Seleccionar Turno ({fechaSeleccionada}):</Text>
      <FlatList
        data={turnos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.turnoRow}>
            <Text>{item.inicio} - {item.fin}</Text>
            <Pressable style={styles.btnReservar} onPress={() => handleReservar(item.id)}>
              <Text style={styles.btnText}>Reservar</Text>
            </Pressable>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No hay turnos disponibles para esta fecha.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginTop: 20 },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 8 },
  price: { fontSize: 18, color: '#007AFF', fontWeight: 'bold', marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginTop: 16, marginBottom: 8 },
  ruleItem: { fontSize: 14, color: '#444' },
  turnoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderWidth: 1, borderColor: '#eee', borderRadius: 8, marginBottom: 8 },
  btnReservar: { backgroundColor: '#28a745', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6 },
  btnText: { color: '#fff', fontWeight: 'bold' },
  emptyText: { color: '#888', fontStyle: 'italic', marginTop: 12 },
});