import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { UsuarioServicio } from "../../src/servicios/usuarios";

export default function RegistroPantalla() {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [contrasenia, setContrasenia] = useState("");
  const [cargando, setCargando] = useState(false);

  const manejarRegistro = async () => {
    if (!nombre || !email || !telefono || !contrasenia) {
      Alert.alert(
        "Campos incompletos",
        "Por favor completá todos los campos para registrarte.",
      );
      return;
    }

    setCargando(true);
    try {
      // Registra al usuario y crea la persistencia local coordinada en SQLite
      await UsuarioServicio.registrar(nombre, email, telefono, contrasenia);

      Alert.alert(
        "Cuenta Creada",
        "Tu registro offline/local se completó. Ya podés iniciar sesión con tus credenciales.",
        [{ text: "OK", onPress: () => router.replace("/(auth)/login") }],
      );
    } catch (err: any) {
      const mensajeError =
        err?.error?.mensaje || "Error al procesar el alta de usuario.";
      Alert.alert("Error de Registro", mensajeError);
    } finally {
      setCargando(false);
    }
  };

  return (
    <View style={styles.contenedor}>
      <Text style={styles.titulo}>Nueva Cuenta</Text>
      <Text style={styles.subtitulo}>
        Registrate para empezar a reservar canchas
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Nombre y Apellido"
        placeholderTextColor="#999"
        value={nombre}
        onChangeText={setNombre}
        editable={!cargando}
      />

      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        placeholderTextColor="#999"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        editable={!cargando}
      />

      <TextInput
        style={styles.input}
        placeholder="Teléfono de contacto (ej: 3455-401122)"
        placeholderTextColor="#999"
        value={telefono}
        onChangeText={setTelefono}
        keyboardType="phone-pad"
        editable={!cargando}
      />

      <TextInput
        style={styles.input}
        placeholder="Escribí una contraseña segura"
        placeholderTextColor="#999"
        value={contrasenia}
        onChangeText={setContrasenia}
        secureTextEntry
        editable={!cargando}
      />

      {cargando ? (
        <ActivityIndicator size="large" color="#2E7D32" style={styles.loader} />
      ) : (
        <TouchableOpacity
          style={styles.botonPrincipal}
          onPress={manejarRegistro}
        >
          <Text style={styles.textoBoton}>Registrarme</Text>
        </TouchableOpacity>
      )}
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
    fontSize: 24,
    fontWeight: "bold",
    color: "#1B5E20",
    marginBottom: 4,
  },
  subtitulo: {
    fontSize: 14,
    color: "#666",
    marginBottom: 32,
    textAlign: "center",
  },
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
  loader: { marginVertical: 20 },
});
