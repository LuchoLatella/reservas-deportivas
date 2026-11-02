import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { UsuarioServicio } from "../../src/servicios/usuarios";

export default function LoginPantalla() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [contrasenia, setContrasenia] = useState("");
  const [cargando, setCargando] = useState(false);

  // Intentar reingreso biométrico automático al abrir la pantalla
  useEffect(() => {
    async function iniciarBiometriaAutomatica() {
      const resultado = await UsuarioServicio.autenticarBiometria();
      if (resultado && resultado.exito && resultado.usuario) {
        Alert.alert(
          "Éxito",
          `Bienvenido de vuelta, ${resultado.usuario.nombre}`,
        );
        router.replace("/(tabs)");
      }
    }
    iniciarBiometriaAutomatica();
  }, []);

  const manejarLoginClasico = async () => {
    if (!email || !contrasenia) {
      Alert.alert(
        "Campos incompletos",
        "Por favor ingresá tu email y contraseña.",
      );
      return;
    }

    setCargando(true);
    try {
      const respuesta = await UsuarioServicio.iniciarSesion(email, contrasenia);
      if (respuesta.exito && respuesta.usuario) {
        Alert.alert(
          "Ingreso Exitoso",
          `Hola, ${respuesta.usuario.nombre} (${respuesta.usuario.rol})`,
        );
        router.replace("/(tabs)");
      } else {
        Alert.alert("Error de Autenticación", respuesta.mensaje || "Credenciales inválidas.");
      }
    } catch (err: any) {
      const mensajeError =
        err?.error?.mensaje || "Ocurrió un error inesperado al iniciar sesión.";
      Alert.alert("Error de Autenticación", mensajeError);
    } finally {
      setCargando(false);
    }
  };

  const lanzarBiometriaManual = async () => {
    const resultado = await UsuarioServicio.autenticarBiometria();
    if (resultado && resultado.exito && resultado.usuario) {
      router.replace("/(tabs)");
    } else {
      Alert.alert(
        "Aviso",
        "No se pudo verificar la identidad biométrica. Usá tu contraseña.",
      );
    }
  };

  return (
    <View style={styles.contenedor}>
      <Text style={styles.titulo}>Reservas Deportivas</Text>
      <Text style={styles.subtitulo}>Ingresá a tu cuenta</Text>

      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        placeholderTextColor="#999"
        value={email}
        onChangeText={(texto) => setEmail(texto)}
        autoCapitalize="none"
        keyboardType="email-address"
        editable={!cargando}
      />

      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        placeholderTextColor="#999"
        value={contrasenia}
        onChangeText={(texto) => setContrasenia(texto)}
        secureTextEntry
        editable={!cargando}
      />

      {cargando ? (
        <ActivityIndicator size="large" color="#2E7D32" style={styles.loader} />
      ) : (
        <>
          <TouchableOpacity
            style={styles.botonPrincipal}
            onPress={manejarLoginClasico}
          >
            <Text style={styles.textoBoton}>Ingresar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.botonBiometria}
            onPress={lanzarBiometriaManual}
          >
            <Text style={styles.textoBotonBiometria}>
              Fingerprint / Face ID 👤
            </Text>
          </TouchableOpacity>
        </>
      )}

      <TouchableOpacity
        style={styles.botonEnlace}
        onPress={() => router.push("/(auth)/registro" as any)}
        disabled={cargando}
      >
        <Text style={styles.textoEnlace}>
          ¿No tenés cuenta todavía? Registrate acá
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    padding: 24,
  },
  titulo: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1B5E20",
    marginBottom: 4,
  },
  subtitulo: { fontSize: 14, color: "#666", marginBottom: 32 },
  input: {
    width: "100%",
    height: 50,
    backgroundColor: "#FFF",
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    fontSize: 16,
    color: "#333",
  },
  botonPrincipal: {
    width: "100%",
    height: 50,
    backgroundColor: "#2E7D32",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    elevation: 2,
  },
  textoBoton: { color: "#FFF", fontSize: 16, fontWeight: "bold" },
  botonBiometria: {
    width: "100%",
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
    borderWidth: 1.5,
    borderColor: "#2E7D32",
  },
  textoBotonBiometria: { color: "#2E7D32", fontSize: 15, fontWeight: "600" },
  botonEnlace: { marginTop: 24, padding: 8 },
  textoEnlace: { color: "#1565C0", fontSize: 14, fontWeight: "500" },
  loader: { marginVertical: 20 },
});