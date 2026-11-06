import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { Callout, Marker } from 'react-native-maps';
import { FiltrosEspacio, obtenerEspacios } from '../../src/servicios/espacios';
import { Espacio } from '../../src/tipos/espacio';
import { calcularDistanciaKm } from '../../src/utils/distancia';

const IMAGEN_DEFAULT =
  'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&auto=format&fit=crop&q=80';

export default function PantallaCatalogo() {
  const router = useRouter();
  const [espacios, setEspacios] = useState<Espacio[]>([]);
  const [cargando, setCargando] = useState(true);
  const [vistaMapa, setVistaMapa] = useState(false);

  // Estado de Ubicación del Usuario
  const [ubicacionUsuario, setUbicacionUsuario] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  // Estados para filtros
  const [busqueda, setBusqueda] = useState('');
  const [soloTechado, setSoloTechado] = useState(false);
  const [soloIluminado, setSoloIluminado] = useState(false);

  // Obtener permisos y coordenadas GPS del dispositivo
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({});
          setUbicacionUsuario({
            lat: loc.coords.latitude,
            lng: loc.coords.longitude,
          });
        }
      } catch (e) {
        // En emuladores o sin permisos, continúa sin ubicación de forma limpia
      }
    })();
  }, []);

  const cargarDatos = async () => {
    setCargando(true);
    const filtros: FiltrosEspacio = {
      busqueda: busqueda.trim() || undefined,
      techado: soloTechado ? true : undefined,
      iluminacion: soloIluminado ? true : undefined,
    };
    const lista = await obtenerEspacios(filtros);
    setEspacios(lista);
    setCargando(false);
  };

  useEffect(() => {
    cargarDatos();
  }, [busqueda, soloTechado, soloIluminado]);

  const regionInicial = {
    latitude: ubicacionUsuario?.lat ?? -31.8495,
    longitude: ubicacionUsuario?.lng ?? -59.0267,
    latitudeDelta: 0.03,
    longitudeDelta: 0.03,
  };

  const renderItemEspacio = ({ item }: { item: Espacio }) => {
    const urlFoto =
      item.imagenes && item.imagenes.length > 0
        ? item.imagenes[0]
        : (item as any).imagenUrl || IMAGEN_DEFAULT;

    const latCancha = item.coordenadas?.latitud ?? (item as any).latitud;
    const lngCancha = item.coordenadas?.longitud ?? (item as any).longitud;

    const distancia =
      ubicacionUsuario && latCancha && lngCancha
        ? calcularDistanciaKm(
            ubicacionUsuario.lat,
            ubicacionUsuario.lng,
            latCancha,
            lngCancha
          )
        : null;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push(`/espacio/${item.id}` as any)}
      >
        <Image source={{ uri: urlFoto }} style={styles.cardImagen} resizeMode="cover" />
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{item.nombre}</Text>
            <Text style={styles.cardPrecio}>${item.precioPorHora}/h</Text>
          </View>
          <Text style={styles.cardSub}>
            {item.complejo} • {item.superficie || 'Sintético'}
          </Text>

          {distancia !== null && (
            <Text style={styles.distanciaText}>📍 A {distancia} km de vos</Text>
          )}

          <View style={styles.badgesContainer}>
            {item.techado && <Text style={styles.badge}>Techado</Text>}
            {item.iluminacion && <Text style={styles.badge}>Iluminación</Text>}
            <Text style={styles.badgeInfo}>Capacidad: {item.capacidad} pers.</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header Destacado */}
      <View style={styles.headerBanner}>
        <Text style={styles.headerSaludo}>¡Hola, Jugador! 👋</Text>
        <Text style={styles.headerSubtitulo}>
          Encontrá y reservá tu cancha ideal en segundos
        </Text>
      </View>

      {/* Buscador */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.inputBusqueda}
          placeholder="Buscar por cancha o complejo..."
          value={busqueda}
          onChangeText={setBusqueda}
        />
      </View>

      {/* Botones de Filtros Rápidos */}
      <View style={styles.filtrosContainer}>
        <TouchableOpacity
          style={[styles.chip, soloTechado && styles.chipActivo]}
          onPress={() => setSoloTechado(!soloTechado)}
        >
          <Text style={[styles.chipText, soloTechado && styles.chipTextActivo]}>
            Techado
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.chip, soloIluminado && styles.chipActivo]}
          onPress={() => setSoloIluminado(!soloIluminado)}
        >
          <Text style={[styles.chipText, soloIluminado && styles.chipTextActivo]}>
            Con Luz
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.toggleVistaBtn}
          onPress={() => setVistaMapa(!vistaMapa)}
        >
          <Text style={styles.toggleVistaText}>
            {vistaMapa ? 'Ver Lista' : 'Ver Mapa'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Contenido principal: Carga, Lista o Mapa */}
      {cargando ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#0066cc" />
        </View>
      ) : vistaMapa ? (
        <MapView style={styles.mapa} initialRegion={regionInicial}>
          {ubicacionUsuario && (
            <Marker
              coordinate={{
                latitude: ubicacionUsuario.lat,
                longitude: ubicacionUsuario.lng,
              }}
              title="Tu Ubicación"
              pinColor="blue"
            />
          )}

          {espacios.map((espacio) => {
            const lat =
              espacio.coordenadas?.latitud ?? (espacio as any).latitud ?? -31.8495;
            const lng =
              espacio.coordenadas?.longitud ?? (espacio as any).longitud ?? -59.0267;

            return (
              <Marker
                key={espacio.id}
                coordinate={{ latitude: lat, longitude: lng }}
                title={espacio.nombre}
                description={`${espacio.complejo} - $${espacio.precioPorHora}/h`}
              >
                <Callout onPress={() => router.push(`/espacio/${espacio.id}` as any)}>
                  <View style={styles.calloutBox}>
                    <Text style={styles.calloutTitle}>{espacio.nombre}</Text>
                    <Text style={styles.calloutSub}>{espacio.complejo}</Text>
                    <Text style={styles.calloutVer}>Toca para ver turnos</Text>
                  </View>
                </Callout>
              </Marker>
            );
          })}
        </MapView>
      ) : (
        <FlatList
          data={espacios}
          keyExtractor={(item) => item.id}
          renderItem={renderItemEspacio}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              No se encontraron canchas con los filtros seleccionados.
            </Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6f8',
  },
  headerBanner: {
    backgroundColor: '#0066cc',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 14,
  },
  headerSaludo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerSubtitulo: {
    fontSize: 13,
    color: '#e0e0e0',
    marginTop: 2,
  },
  searchContainer: {
    padding: 12,
    backgroundColor: '#fff',
  },
  inputBusqueda: {
    backgroundColor: '#f0f2f5',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    fontSize: 14,
  },
  filtrosContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingBottom: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#e4e6eb',
  },
  chipActivo: {
    backgroundColor: '#0066cc',
  },
  chipText: {
    fontSize: 13,
    color: '#333',
  },
  chipTextActivo: {
    color: '#fff',
    fontWeight: 'bold',
  },
  toggleVistaBtn: {
    marginLeft: 'auto',
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: '#2e7d32',
    borderRadius: 20,
  },
  toggleVistaText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 14,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  cardImagen: {
    width: '100%',
    height: 140,
  },
  cardContent: {
    padding: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1c1e21',
  },
  cardPrecio: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  cardSub: {
    fontSize: 13,
    color: '#65676b',
    marginTop: 2,
  },
  distanciaText: {
    fontSize: 12,
    color: '#1877f2',
    fontWeight: '600',
    marginTop: 4,
  },
  badgesContainer: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 6,
    alignItems: 'center',
  },
  badge: {
    fontSize: 11,
    backgroundColor: '#e7f3ff',
    color: '#1877f2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    fontWeight: '600',
  },
  badgeInfo: {
    fontSize: 11,
    color: '#65676b',
    marginLeft: 'auto',
  },
  mapa: {
    width: Dimensions.get('window').width,
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: '#65676b',
  },
  calloutBox: {
    padding: 6,
    width: 140,
  },
  calloutTitle: {
    fontWeight: 'bold',
    fontSize: 13,
  },
  calloutSub: {
    fontSize: 11,
    color: '#555',
  },
  calloutVer: {
    fontSize: 10,
    color: '#0066cc',
    marginTop: 4,
    fontWeight: 'bold',
  },
});