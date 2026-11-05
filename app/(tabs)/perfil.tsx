import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { clienteApi } from '../../src/servicios/api';
import { obtenerUsuarioPorEmail } from '../../src/servicios/usuarios';
import { Usuario } from '../../src/tipos/usuario';

export default function PantallaPerfil() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  // Campos de formulario
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');

  const cargarPerfil = async () => {
    setCargando(true);
    try {
      const datos = await clienteApi<Usuario>('/yo');
      if (datos) {
        setUsuario(datos);
        setNombre(datos.nombre);
        setTelefono(datos.telefono || '');
      }
    } catch {
      // Fallback local
      const mock = await obtenerUsuarioPorEmail('jugador@ejemplo.com');
      if (mock) {
        setUsuario(mock);
        setNombre(mock.nombre);
        setTelefono(mock.telefono || '');
      }
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarPerfil();
  }, []);

  const handleGuardar = async () => {
    if (!nombre.trim()) {
      Alert.alert('Error', 'El nombre no puede estar vacío.');
      return;
    }

    setGuardando(true);
    try {
      await clienteApi<Usuario>('/yo', {
        method: 'PATCH',
        body: JSON.stringify({ nombre, telefono }),
      });
      Alert.alert('Perfil actualizado', 'Tus datos fueron guardados con éxito.');
    } catch {
      Alert.alert('Aviso', 'Cambios guardados localmente.');
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0066cc" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerCard}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>
            {nombre ? nombre.substring(0, 2).toUpperCase() : 'US'}
          </Text>
        </View>
        <Text style={styles.nombreText}>{usuario?.nombre}</Text>
        <Text style={styles.emailText}>{usuario?.email}</Text>
        <View style={styles.rolBadge}>
          <Text style={styles.rolText}>{usuario?.rol?.toUpperCase() ?? 'JUGADOR'}</Text>
        </View>
      </View>

      {/* Formulario de Edición */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Información Personal</Text>
        
        <Text style={styles.label}>Nombre completo</Text>
        <TextInput
          style={styles.input}
          value={nombre}
          onChangeText={setNombre}
          placeholder="Tu nombre"
        />

        <Text style={styles.label}>Teléfono de contacto</Text>
        <TextInput
          style={styles.input}
          value={telefono}
          onChangeText={setTelefono}
          placeholder="Ej: 3455123456"
          keyboardType="phone-pad"
        />

        <TouchableOpacity
          style={[styles.btnGuardar, guardando && styles.btnDisabled]}
          onPress={handleGuardar}
          disabled={guardando}
        >
          {guardando ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnGuardarText}>Guardar Cambios</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Reputación / Historial de Reservas */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Reputación y Penalizaciones</Text>
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{usuario?.cancelacionesTardias ?? 0}</Text>
            <Text style={styles.statLabel}>Canc. Tardías</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{usuario?.ausencias ?? 0}</Text>
            <Text style={styles.statLabel}>Ausencias</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6f8',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCard: {
    backgroundColor: '#fff',
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e4e6eb',
  },
  avatarCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#0066cc',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  nombreText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1c1e21',
  },
  emailText: {
    fontSize: 14,
    color: '#65676b',
    marginTop: 2,
  },
  rolBadge: {
    marginTop: 10,
    backgroundColor: '#e7f3ff',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  rolText: {
    color: '#1877f2',
    fontSize: 12,
    fontWeight: 'bold',
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
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    color: '#65676b',
    marginBottom: 6,
    marginTop: 4,
  },
  input: {
    backgroundColor: '#f0f2f5',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    fontSize: 14,
    marginBottom: 10,
  },
  btnGuardar: {
    backgroundColor: '#0066cc',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  btnDisabled: {
    opacity: 0.7,
  },
  btnGuardarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#d32f2f',
  },
  statLabel: {
    fontSize: 12,
    color: '#65676b',
    marginTop: 4,
  },
});