import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { cancelarReserva, obtenerReservasUsuario } from '../../src/servicios/reservas';
import { Reserva } from '../../src/tipos/reserva';

export default function PantallaMisReservas() {
  const [pestana, setPestana] = useState<'proximas' | 'pasadas'>('proximas');
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [cargando, setCargando] = useState(true);
  const [procesandoId, setProcesandoId] = useState<string | null>(null);

  const cargarReservas = async () => {
    setCargando(true);
    const lista = await obtenerReservasUsuario(pestana);
    setReservas(lista);
    setCargando(false);
  };

  useEffect(() => {
    cargarReservas();
  }, [pestana]);

  const handleCancelar = (reserva: Reserva) => {
    Alert.alert(
      'Cancelar Reserva',
      '¿Estás seguro de que deseas cancelar este turno?',
      [
        { text: 'Volver', style: 'cancel' },
        {
          text: 'Confirmar Cancelación',
          style: 'destructive',
          onPress: async () => {
            setProcesandoId(reserva.id);
            const resultado = await cancelarReserva(reserva.id);
            setProcesandoId(null);

            if (resultado.exito) {
              if (resultado.requiereEncargado) {
                Alert.alert(
                  'Cancelación Tardía',
                  'Quedan menos de 4 horas para el turno. La solicitud requiere la confirmación de un encargado del complejo.',
                  [{ text: 'Entendido', onPress: cargarReservas }]
                );
              } else {
                Alert.alert('Éxito', 'La reserva fue cancelada correctamente.');
                cargarReservas();
              }
            } else {
              Alert.alert('Error', resultado.mensaje || 'No se pudo cancelar la reserva.');
            }
          },
        },
      ]
    );
  };

  const renderItemReserva = ({ item }: { item: Reserva }) => {
    const esProxima = item.estado === 'confirmada' && pestana === 'proximas';

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.reservaId}>Reserva #{item.id.slice(-6)}</Text>
          <View
            style={[
              styles.estadoBadge,
              item.estado === 'confirmada' ? styles.badgeConfirmada : styles.badgeCancelada,
            ]}
          >
            <Text
              style={[
                styles.estadoText,
                item.estado === 'confirmada' ? styles.textConfirmada : styles.textCancelada,
              ]}
            >
              {item.estado.toUpperCase()}
            </Text>
          </View>
        </View>

        <Text style={styles.detallesText}>📅 Fecha: {(item as any).fecha || 'Fecha programada'}</Text>
        <Text style={styles.detallesText}>
          ⏰ Horario: {(item as any).horaInicio || '18:00'} - {(item as any).horaFin || '19:00'}
        </Text>
        {item.codigoQr && <Text style={styles.qrText}>📱 Código QR: {item.codigoQr}</Text>}

        {esProxima && (
          <TouchableOpacity
            style={styles.btnCancelar}
            onPress={() => handleCancelar(item)}
            disabled={procesandoId === item.id}
          >
            {procesandoId === item.id ? (
              <ActivityIndicator color="#d32f2f" size="small" />
            ) : (
              <Text style={styles.btnCancelarText}>Cancelar Reserva</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Pestañas de Navegación */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, pestana === 'proximas' && styles.tabActiva]}
          onPress={() => setPestana('proximas')}
        >
          <Text style={[styles.tabText, pestana === 'proximas' && styles.tabTextActivo]}>
            Próximas
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, pestana === 'pasadas' && styles.tabActiva]}
          onPress={() => setPestana('pasadas')}
        >
          <Text style={[styles.tabText, pestana === 'pasadas' && styles.tabTextActivo]}>
            Pasadas / Canceladas
          </Text>
        </TouchableOpacity>
      </View>

      {/* Lista de Reservas */}
      {cargando ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#0066cc" />
        </View>
      ) : (
        <FlatList
          data={reservas}
          keyExtractor={(item) => item.id}
          renderItem={renderItemReserva}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No tenés reservas en esta sección.</Text>
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
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e4e6eb',
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActiva: {
    borderBottomColor: '#0066cc',
  },
  tabText: {
    fontSize: 14,
    color: '#65676b',
  },
  tabTextActivo: {
    color: '#0066cc',
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  reservaId: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1c1e21',
  },
  estadoBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeConfirmada: {
    backgroundColor: '#e6f4ea',
  },
  badgeCancelada: {
    backgroundColor: '#fce8e6',
  },
  estadoText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  textConfirmada: {
    color: '#137333',
  },
  textCancelada: {
    color: '#c5221f',
  },
  detallesText: {
    fontSize: 14,
    color: '#3c4043',
    marginBottom: 4,
  },
  qrText: {
    fontSize: 12,
    color: '#1a73e8',
    marginTop: 6,
    fontWeight: '500',
  },
  btnCancelar: {
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#d32f2f',
    alignItems: 'center',
  },
  btnCancelarText: {
    color: '#d32f2f',
    fontWeight: 'bold',
    fontSize: 13,
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
});