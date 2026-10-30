import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { obtenerReservasPorUsuario } from '../../src/servicios';
import { Reserva } from '../../src/tipos/reserva';

export default function MisReservasScreen() {
  const router = useRouter();
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [tab, setTab] = useState<'proximas' | 'anteriores'>('proximas');

  useEffect(() => {
    cargarReservas();
  }, []);

  async function cargarReservas() {
    const lista = await obtenerReservasPorUsuario('usr-01');
    setReservas(lista);
  }

  const filtradas = reservas.filter((r) =>
    tab === 'proximas' ? r.estado === 'confirmada' : r.estado !== 'confirmada'
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mis Reservas</Text>

      <View style={styles.tabs}>
        <Pressable style={[styles.tab, tab === 'proximas' && styles.activeTab]} onPress={() => setTab('proximas')}>
          <Text style={tab === 'proximas' ? styles.activeTabText : styles.tabText}>Próximas</Text>
        </Pressable>
        <Pressable style={[styles.tab, tab === 'anteriores' && styles.activeTab]} onPress={() => setTab('anteriores')}>
          <Text style={tab === 'anteriores' ? styles.activeTabText : styles.tabText}>Anteriores</Text>
        </Pressable>
      </View>

      <FlatList
        data={filtradas}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => router.push({ pathname: '/reserva/[id]', params: { id: item.id } } as any)}
          >
            <Text style={styles.cardTitle}>Reserva #{item.id}</Text>
            <Text style={styles.cardStatus}>Estado: {item.estado.toUpperCase()}</Text>
            <Text style={styles.cardQr}>QR: {item.codigoQr}</Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f5f5f5' },
  title: { fontSize: 24, fontWeight: 'bold', marginTop: 40, marginBottom: 16 },
  tabs: { flexDirection: 'row', marginBottom: 16 },
  tab: { flex: 1, padding: 12, alignItems: 'center', backgroundColor: '#e0e0e0' },
  activeTab: { backgroundColor: '#007AFF' },
  tabText: { color: '#333' },
  activeTabText: { color: '#fff', fontWeight: 'bold' },
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 8, marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: 'bold' },
  cardStatus: { color: '#007AFF', marginVertical: 4 },
  cardQr: { fontSize: 12, color: '#888' },
});