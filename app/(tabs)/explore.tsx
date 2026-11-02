import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { obtenerDeportes, obtenerEspacios } from '../../src/servicios';
import { Deporte } from '../../src/tipos/deporte';
import { Espacio } from '../../src/tipos/espacio';

export default function ExplorarScreen() {
  const router = useRouter();
  const [espacios, setEspacios] = useState<Espacio[]>([]);
  const [deportes, setDeportes] = useState<Deporte[]>([]);
  const [deporteSeleccionado, setDeporteSeleccionado] = useState<string | undefined>();
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    cargarDatos();
  }, [deporteSeleccionado, busqueda]);

  async function cargarDatos() {
    const [listaEspacios, listaDeportes] = await Promise.all([
      obtenerEspacios({ deporteId: deporteSeleccionado, busqueda }),
      obtenerDeportes(),
    ]);
    setEspacios(listaEspacios);
    setDeportes(listaDeportes);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Espacios Deportivos</Text>
      
      <TextInput
        style={styles.searchInput}
        placeholder="Buscar por nombre o complejo..."
        value={busqueda}
        onChangeText={setBusqueda}
      />

      <View style={styles.filtersContainer}>
        <Pressable
          style={[styles.filterChip, !deporteSeleccionado && styles.filterChipActive]}
          onPress={() => setDeporteSeleccionado(undefined)}
        >
          <Text style={!deporteSeleccionado ? styles.chipTextActive : styles.chipText}>Todos</Text>
        </Pressable>
        {deportes.map((dep) => (
          <Pressable
            key={dep.id}
            style={[styles.filterChip, deporteSeleccionado === dep.id && styles.filterChipActive]}
            onPress={() => setDeporteSeleccionado(dep.id)}
          >
            <Text style={deporteSeleccionado === dep.id ? styles.chipTextActive : styles.chipText}>
              {dep.nombre}
            </Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={espacios}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
          onPress={() => router.push({ pathname: '/espacio/[id]', params: { id: item.id } } as any)}
          >
            <Text style={styles.cardTitle}>{item.nombre}</Text>
            <Text style={styles.cardSubtitle}>{item.complejo}</Text>
            <Text style={styles.cardDetails}>
              Capacidad: {item.capacidad} personas | ${item.precioPorHora}/hs
            </Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f5f5f5' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 12, marginTop: 40 },
  searchInput: { backgroundColor: '#fff', padding: 12, borderRadius: 8, marginBottom: 12 },
  filtersContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12, gap: 8 },
  filterChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: '#e0e0e0' },
  filterChipActive: { backgroundColor: '#007AFF' },
  chipText: { color: '#333' },
  chipTextActive: { color: '#fff', fontWeight: 'bold' },
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 8, marginBottom: 12 },
  cardTitle: { fontSize: 18, fontWeight: 'bold' },
  cardSubtitle: { fontSize: 14, color: '#666', marginVertical: 4 },
  cardDetails: { fontSize: 12, color: '#888' },
});