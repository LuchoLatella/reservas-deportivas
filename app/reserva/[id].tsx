import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { cancelarReserva, obtenerReservaPorId } from '../../src/servicios';
import { Reserva } from '../../src/tipos/reserva';

export default function DetalleReservaScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [reserva, setReserva] = useState<Reserva | null>(null);

  useEffect(() => {
    if (id) obtenerReservaPorId(id).then(setReserva);
  }, [id]);

  async function handleCancelar() {
    if (!reserva) return;
    try {
      const res = await cancelarReserva(reserva.id, 'usr-01');
      Alert.alert('Resultado', res.mensaje);
      setReserva(res.reserva);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  }

  if (!reserva) return <View style={styles.container}><Text>Cargando detalle...</Text></View>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Detalle de Reserva</Text>
      <Text style={styles.code}>Código QR: {reserva.codigoQr}</Text>
      <Text style={styles.status}>Estado: {reserva.estado.toUpperCase()}</Text>

      {reserva.estado === 'confirmada' && (
        <Pressable style={styles.btnCancelar} onPress={handleCancelar}>
          <Text style={styles.btnText}>Cancelar Reserva</Text>
        </Pressable>
      )}

      <Pressable style={styles.btnVolver} onPress={() => router.back()}>
        <Text style={styles.btnVolverText}>Volver</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  code: { fontSize: 18, fontWeight: 'bold', color: '#007AFF', marginBottom: 8 },
  status: { fontSize: 16, marginBottom: 24 },
  btnCancelar: { backgroundColor: '#dc3545', padding: 12, borderRadius: 8, width: '80%', alignItems: 'center', marginBottom: 12 },
  btnVolver: { padding: 12, width: '80%', alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold' },
  btnVolverText: { color: '#007AFF' },
});