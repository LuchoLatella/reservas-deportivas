import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { obtenerReservaPorId } from '../src/servicios/reservas';

export default function PantallaEscanerQR() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [escaneado, setEscaneado] = useState(false);
  const [validando, setValidando] = useState(false);

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, [permission]);

  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0066cc" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.mensajeError}>
          Se requiere acceso a la cámara para escanear el código QR.
        </Text>
        <TouchableOpacity style={styles.btnPermiso} onPress={requestPermission}>
          <Text style={styles.btnPermisoTexto}>Otorgar Permiso</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleBarcodeScanned = async ({ data }: { data: string }) => {
    if (escaneado || validando) return;
    setEscaneado(true);
    setValidando(true);

    const idLimpio = data.replace('QR-', '').trim();
    const reserva =
      (await obtenerReservaPorId(idLimpio)) || (await obtenerReservaPorId(data));

    setValidando(false);

    if (reserva) {
      Alert.alert(
        '✅ Reserva Válida',
        `Reserva #${reserva.id}\nEstado: ${reserva.estado.toUpperCase()}\nUsuario: ${reserva.usuarioId}`,
        [
          {
            text: 'Escanear otro',
            onPress: () => setEscaneado(false),
          },
          {
            text: 'Volver',
            onPress: () => router.back(),
          },
        ]
      );
    } else {
      Alert.alert(
        '❌ Reserva No Encontrada',
        `No se encontró una reserva asociada al código escaneado: "${data}".`,
        [
          {
            text: 'Reintentar',
            onPress: () => setEscaneado(false),
          },
        ]
      );
    }
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFill}
        onBarcodeScanned={escaneado ? undefined : handleBarcodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
      />

      <View style={styles.overlay}>
        <View style={styles.marcadorQr} />
        <Text style={styles.instrucciones}>
          Apuntá la cámara al código QR de la reserva
        </Text>
      </View>

      <TouchableOpacity style={styles.btnCerrar} onPress={() => router.back()}>
        <Text style={styles.btnCerrarText}>Volver</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f4f6f8',
  },
  mensajeError: {
    fontSize: 15,
    textAlign: 'center',
    color: '#333',
    marginBottom: 16,
  },
  btnPermiso: {
    backgroundColor: '#0066cc',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  btnPermisoTexto: {
    color: '#fff',
    fontWeight: 'bold',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  marcadorQr: {
    width: 240,
    height: 240,
    borderWidth: 2,
    borderColor: '#00e676',
    backgroundColor: 'transparent',
    borderRadius: 16,
  },
  instrucciones: {
    color: '#fff',
    fontSize: 14,
    marginTop: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  btnCerrar: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  btnCerrarText: {
    color: '#1c1e21',
    fontWeight: 'bold',
    fontSize: 15,
  },
});