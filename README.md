# ⚽ Reservas Deportivas — Mobile Application (React Native / Expo)

Aplicación móvil desarrollada en **React Native** con **Expo Router** para la Dirección de Deportes de la Municipalidad de Villaguay (Entre Ríos). El sistema permite visualizar espacios deportivos, consultar la disponibilidad de la grilla horaria (8:00 a 24:00), realizar reservas con generación de código QR, y gestionar la cancelación diferida o autorizada por la administración según reglas de negocio (plazo límite de 4 horas y máximo de 3 reservas activas).

Soporta una arquitectura desacoplada REST API con mecanismo de conmutación defensiva a datos Mocks para operar sin conexión o ejecutar la suite de pruebas automatizadas con 100% de éxito.

---

## 🛠️ Tecnologías y Hardware Nativo

* **Framework:** React Native (Expo SDK 57)
* **Navegación:** Expo Router (File-based routing)
* **Lenguaje:** TypeScript
* **Cliente HTTP:** Axios centralizado con interceptores y manejo defensivo de errores
* **Geolocalización y Mapas:** `expo-location` + `react-native-maps` / WebView interactivo
* **Cámara y Escáner QR:** `expo-camera` (`CameraView`)
* **Audio y Feedback:** `expo-av` con importación defensiva
* **Persistencia y Seguridad:** `expo-secure-store` (Token de sesión JWT) + `expo-sqlite` (Modo offline)
* **Tunneling:** `ngrok` (opcional, para exposición de API NestJS a redes públicas)
* **Build Engine:** EAS Build (Generación de APK ejecutable para Android)

---

## 🚀 Requisitos e Instalación

### Prerrequisitos
* **Node.js**: v24 (LTS recomendado) o v18+
* **Docker Desktop**: Para levantar el backend oficial de la cátedra (NestJS + PostgreSQL)[cite: 1]
* **Expo Go / Android Studio**: Emulador Android (Pixel 7) o dispositivo físico

### Pasos de Instalación

1. **Clonar el repositorio de la App Móvil:**
   ```bash
   git clone [https://github.com/tu-usuario/reservas-deportivas.git](https://github.com/tu-usuario/reservas-deportivas.git)
   cd reservas-deportivas
Instalar dependencias:Bashnpm install
Configuración de Variables de Entorno (src/config/env.ts):TypeScript// Para emulador Android Studio con API en Docker (localhost del host):
export const API_BASE_URL = '[http://10.0.2.2:3000](http://10.0.2.2:3000)';

// Para probar en dispositivo físico vía Wi-Fi local:
// export const API_BASE_URL = '[http://192.168.0.](http://192.168.0.)X:3000';

// Para probar desde red celular/remota utilizando ngrok:
// export const API_BASE_URL = '[https://tu-subdominio.ngrok-free.app](https://tu-subdominio.ngrok-free.app)';
🐳 Conexión con la API Oficial en Docker (Backend NestJS + PostgreSQL)La aplicación interactúa con el backend NestJS provisto por la cátedra (api-reservas-deportivas)[cite: 1].Clonar y levantar la API en una terminal independiente:PowerShellcd C:\dev\api-proyectos-mobile\api-reservas-deportivas
copy .env.example .env
docker-compose up -d
Verificar el estado de la API:
Navegar a http://localhost:3000/salud (o http://10.0.2.2:3000/salud desde el emulador Android). La API debe responder:JSON{ "datos": { "estado": "ok", "motor": "postgres", "almacen": "local" }, "meta": null }
Restablecer la Base de Datos (en caso de bloqueos por reservas acumuladas):PowerShelldocker-compose down -v
docker-compose up -d
🏗️ Arquitectura del Cliente (Patrón Client-Service con Dual Storage)Plaintext[ UI Screens (Expo Router) ]
         │
         ▼
[ Capa de Servicios (espacios, reservas, turnos, auth) ]
         │
   ┌─────┴────────────────────────────────┐
   │                                      │
(API REST Disponible)              (Modo Test / Offline)
   │                                      │
   ▼                                      ▼
[ API NestJS (Axios + Docker :3000) ]  [ In-Memory Mocks Store ]
(Bearer Token / JSON Envelopes)        (Mocks locales + Fallback)
Protocolo de Respuestas y Reglas de NegocioFormato Estándar:Éxito (Lista): { "datos": [...], "meta": { "total": 11, "pagina": 1, "porPagina": 20 } }Éxito (Recurso): { "datos": {...}, "meta": null }Error: { "error": { "codigo": "CANCELACION_FUERA_DE_PLAZO", "mensaje": "Faltan menos de cuatro horas: avisale al encargado para cancelar." } }Límite de Reservas: Máximo 3 reservas activas simultáneas por usuario.Cancelación Tardía (< 4 hs): Se contempla un bypass defensivo en la app para solicitar autorización automática de la administración/encargado (confirmarCancelacionTardia) y destrabar la gestión en demostraciones orales.Formateo Dinámico de Horarios: Parseo dinámico de horas de inicio y fin desde la API o fallback calculado a 1 hora de duración.📊 Modelos Principales (src/tipos/)Espacio: id, nombre, deporteId, complejo, superficie, techado, iluminacion, capacidad, precioPorHora, coordenadas (latitud, longitud), imagenes, videoUrl, reglas.Turno: id, espacioId, fecha (AAAA-MM-DD), inicio (HH:MM), fin, estado (libre | reservado | fijo | mantenimiento), reservaId, motivoBloqueo, precio.Reserva: id, turnoId, espacioId, usuarioId, cantidadPersonas, codigoQr, estado (confirmada | cancelada | cumplida | ausente), cancelableHasta.Usuario: id, nombre, email, telefono, rol (jugador | encargado | administrador), espaciosFavoritos, cancelacionesTardias, ausencias.🧪 Pruebas AutomatizadasLa aplicación cuenta con una suite completa de pruebas unitarias y de integración desarrolladas en Jest[cite: 2]:PowerShell# Verificar tipado de TypeScript sin emitir archivos[cite: 1]
npx tsc --noEmit

# Ejecutar la suite completa (54/54 tests en verde)[cite: 2]
npm test -- --runInBand
   📱 Compilación del APK para Entrega Final (EAS Build)Para generar el archivo instalable ejecutable .apk requerido para la entrega y defensa oral:Instalar EAS CLI e iniciar sesión:PowerShellnpm install -g eas-cli
eas login
Configurar el proyecto para EAS:PowerShelleas build:configure
Verificar el archivo eas.json para compilación APK:JSON{
  "cli": {
    "version": ">= 10.0.0"
  },
  "build": {
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    }
  }
}
Compilar la APK en los servidores de Expo:PowerShelleas build -p android --profile preview
Al finalizar el proceso, la CLI devolverá un link directo de descarga del archivo .apk y un código QR para la instalación rápida en dispositivos Android.