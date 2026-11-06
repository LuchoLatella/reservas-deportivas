import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { EstrellasRating } from '../../src/componentes/EstrellasRating';
import { obtenerEspacioPorId } from '../../src/servicios/espacios';
import { crearReserva } from '../../src/servicios/reservas';
import { obtenerTurnosDisponibles } from '../../src/servicios/turnos';
import { Espacio } from '../../src/tipos/espacio';
import { Turno } from '../../src/tipos/turno';
import { reproducirSonidoExito } from '../../src/utils/sonido';

const IMAGEN_DEFAULT =
  'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&auto=format&fit=crop&q=80';

export default function PantallaDetalleEspacio() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [espacio, setEspacio] = useState<Espacio | null>(null);
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [cargando, setCargando] = useState(true);
  const [turnoSeleccionado, setTurnoSeleccionado] = useState<string | null>(null);
  const [reservando, setReservando] = useState(false);

  // Estados de Calificación
  const [miPuntuacion, setMiPuntuacion] = useState(5);
  const [comentario, setComentario] = useState('');
  const [reseniaEnviada, setReseniaEnviada] = useState(false);

  const fechaHoy = new Date().toISOString().split('T')[0];

  const cargarDatos = async () => {
    if (!id) return;
    setCargando(true);
    const esp = await obtenerEspacioPorId(id);
    setEspacio(esp);

    const listaTurnos = await obtenerTurnosDisponibles(id, fechaHoy);
    setTurnos(listaTurnos);
    setCargando(false);
  };

  useEffect(() => {
    cargarDatos();
  }, [id]);

  const handleReservar = async () => {
    if (!turnoSeleccionado) {
      Alert.alert('Seleccionar turno', 'Por favor selecciona un turno disponible.');
      return;
    }

    setReservando(true);
    const resultado = await crearReserva(turnoSeleccionado, 2);
    setReservando(false);

    if (resultado.exito) {
      await reproducirSonidoExito(); //  Efecto sonoro de éxito
      Alert.alert(
        '¡Reserva Confirmada!',
        'Tu turno fue reservado con éxito. Podés revisarlo en la sección Mis Reservas.',
        [{ text: 'Ir a Mis Reservas', onPress: () => router.push('/(tabs)/reservas') }]
      );
    } else {
      Alert.alert('Error', resultado.mensaje || 'No se pudo procesar la reserva.');
    }
  };

  const handleEnviarResenia = () => {
    if (!miPuntuacion) {
      Alert.alert('Atención', 'Seleccioná al menos 1 estrella.');
      return;
    }
    setReseniaEnviada(true);
    Alert.alert('¡Gracias!', 'Tu valoración fue registrada correctamente.');
  };

  if (cargando) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0066cc" />
      </View>
    );
  }

  if (!espacio) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>No se encontró el espacio solicitado.</Text>
      </View>
    );
  }

  const promedioEstrellas = (espacio as any).valoracionPromedio ?? 4.5;
  const urlFoto =
    espacio.imagenes && espacio.imagenes.length > 0
      ? espacio.imagenes[0]
      : (espacio as any).imagenUrl || IMAGEN_DEFAULT;

  return (
    <ScrollView style={styles.container}>
      {/* Banner / Foto Principal */}
      <Image source={{ uri: urlFoto }} style={styles.heroImagen} resizeMode="cover" />

      {/* Encabezado e Info General */}
      <View style={styles.cardHeader}>
        <Text style={styles.titulo}>{espacio.nombre}</Text>
        <Text style={styles.complejo}>{espacio.complejo}</Text>

        <View style={styles.ratingRow}>
          <EstrellasRating puntuacion={promedioEstrellas} tamano={20} />
          <Text style={styles.ratingTexto}>{promedioEstrellas.toFixed(1)} / 5.0</Text>
        </View>

        <View style={styles.badgesRow}>
          {espacio.techado && <Text style={styles.badge}>Techado</Text>}
          {espacio.iluminacion && <Text style={styles.badge}>Con Iluminación</Text>}
          <Text style={styles.badgeCapacidad}>Capacidad: {espacio.capacidad} personas</Text>
        </View>

        <Text style={styles.precioText}>${espacio.precioPorHora} / hora</Text>
      </View>

      {/* Detalles Técnicos y Reglas */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Detalles del Espacio</Text>
        <Text style={styles.detallesText}>
          🌱 Superficie: {espacio.superficie || 'No especificada'}
        </Text>

        {espacio.reglas && espacio.reglas.length > 0 && (
          <View style={styles.reglasBox}>
            <Text style={styles.reglasTitle}>📋 Reglas de la cancha:</Text>
            {espacio.reglas.map((regla, index) => (
              <Text key={index} style={styles.reglaItem}>
                • {regla}
              </Text>
            ))}
          </View>
        )}
      </View>

      {/* Selección de Turnos Disponibles */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Turnos Disponibles (Hoy)</Text>
        {turnos.length === 0 ? (
          <Text style={styles.noTurnosText}>No hay turnos disponibles para el día de hoy.</Text>
        ) : (
          <View style={styles.turnosGrid}>
            {turnos.map((t) => {
              const seleccionado = turnoSeleccionado === t.id;
              const horaInicio = (t as any).horaInicio || t.inicio || '18:00';
              const horaFin = (t as any).horaFin || t.fin || '19:00';

              return (
                <TouchableOpacity
                  key={t.id}
                  style={[styles.turnoChip, seleccionado && styles.turnoChipSeleccionado]}
                  onPress={() => setTurnoSeleccionado(t.id)}
                >
                  <Text style={[styles.turnoText, seleccionado && styles.turnoTextSeleccionado]}>
                    {horaInicio} - {horaFin}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        <TouchableOpacity
          style={[styles.btnReservar, (!turnoSeleccionado || reservando) && styles.btnDisabled]}
          onPress={handleReservar}
          disabled={!turnoSeleccionado || reservando}
        >
          {reservando ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnReservarText}>Confirmar Reserva</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Sección para Calificar el Espacio */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Calificar este Espacio</Text>

        {reseniaEnviada ? (
          <View style={styles.graciasBox}>
            <Text style={styles.graciasText}>✓ ¡Gracias por dejar tu opinión!</Text>
          </View>
        ) : (
          <View>
            <Text style={styles.labelRating}>Tu puntuación:</Text>
            <View style={styles.ratingSelector}>
              <EstrellasRating
                puntuacion={miPuntuacion}
                alCambiar={setMiPuntuacion}
                tamano={28}
                interactivo={true}
              />
            </View>

            <TextInput
              style={styles.inputComentario}
              placeholder="Escribí una opinión sobre la cancha o el complejo (opcional)..."
              value={comentario}
              onChangeText={setComentario}
              multiline
              numberOfLines={3}
            />

            <TouchableOpacity style={styles.btnEnviarResenia} onPress={handleEnviarResenia}>
              <Text style={styles.btnEnviarText}>Enviar Calificación</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6f8',
  },
  heroImagen: {
    width: '100%',
    height: 180,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardHeader: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e4e6eb',
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1c1e21',
  },
  complejo: {
    fontSize: 15,
    color: '#65676b',
    marginTop: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  ratingTexto: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#555',
  },
  badgesRow: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
    alignItems: 'center',
  },
  badge: {
    fontSize: 12,
    backgroundColor: '#e7f3ff',
    color: '#1877f2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    fontWeight: '600',
  },
  badgeCapacidad: {
    fontSize: 12,
    color: '#65676b',
    marginLeft: 'auto',
  },
  precioText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginTop: 12,
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1c1e21',
    marginBottom: 10,
  },
  detallesText: {
    fontSize: 14,
    color: '#444',
  },
  reglasBox: {
    marginTop: 10,
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
  },
  reglasTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  reglaItem: {
    fontSize: 13,
    color: '#555',
    marginBottom: 2,
  },
  noTurnosText: {
    color: '#65676b',
    fontStyle: 'italic',
  },
  turnosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  turnoChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#f0f2f5',
    borderWidth: 1,
    borderColor: '#e4e6eb',
  },
  turnoChipSeleccionado: {
    backgroundColor: '#0066cc',
    borderColor: '#0066cc',
  },
  turnoText: {
    fontSize: 13,
    color: '#1c1e21',
    fontWeight: '500',
  },
  turnoTextSeleccionado: {
    color: '#fff',
    fontWeight: 'bold',
  },
  btnReservar: {
    backgroundColor: '#2e7d32',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnDisabled: {
    opacity: 0.5,
  },
  btnReservarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  labelRating: {
    fontSize: 13,
    color: '#65676b',
    marginBottom: 6,
  },
  ratingSelector: {
    marginBottom: 12,
  },
  inputComentario: {
    backgroundColor: '#f0f2f5',
    padding: 12,
    borderRadius: 8,
    fontSize: 14,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  btnEnviarResenia: {
    backgroundColor: '#0066cc',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnEnviarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  graciasBox: {
    backgroundColor: '#e6f4ea',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  graciasText: {
    color: '#137333',
    fontWeight: 'bold',
    fontSize: 14,
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 16,
  },
});