# ⚽ Reservas Deportivas — Mobile Application (React Native / Expo)

Aplicación móvil desarrollada en **React Native** con **Expo Router** para la Dirección de Deportes de la Municipalidad de Villaguay (Entre Ríos). El sistema permite visualizar espacios deportivos, consultar la disponibilidad de la grilla horaria (8:00 a 24:00), realizar reservas con código QR de ingreso, y gestionar bloqueos por lluvia o mantenimiento.

Soporta una arquitectura desacoplada REST API con mecanismo de conmutación defensiva a datos Mocks para operar sin conexión o ejecutar la suite de pruebas automatizadas con 100% de éxito.

---

## 🛠️ Tecnologías y Hardware Nativo

* **Framework:** React Native (Expo SDK 57)
* **Navegación:** Expo Router (File-based routing)
* **Lenguaje:** TypeScript
* **Geolocalización y Mapas:** `expo-location` + `react-native-maps`
* **Cámara y Escáner QR:** `expo-camera` (`CameraView`)
* **Audio y Feedback:** `expo-av` con importación defensiva
* **Persistencia y Seguridad:** `expo-secure-store` (Token de sesión JWT) + `expo-sqlite` (Modo offline)
* **Build Engine:** EAS Build (APK ejecutable para Android)

---

## 🚀 Requisitos e Instalación

### Prerrequisitos
* **Node.js**: v24 (LTS recomendado) o v18+
* **Docker Desktop**: Para levantar el backend oficial de la cátedra
* **Expo Go / Android Studio**: Emulador Android (Pixel 7) o dispositivo físico en la misma red Wi-Fi

### Pasos de Instalación

1. **Clonar el repositorio de la App Móvil:**
   ```bash
   git clone [https://github.com/tu-usuario/reservas-deportivas.git](https://github.com/tu-usuario/reservas-deportivas.git)
   cd reservas-deportivas
Instalar dependencias:

Bash
npm install
Configuración de Variables de Entorno (src/config/env.ts):

TypeScript
// Para emulador Android Studio con API en Docker (localhost del host):
export const API_BASE_URL = '[http://10.0.2.2:3000](http://10.0.2.2:3000)';

// Para probar en dispositivo físico vía Expo Go (Wi-Fi):
// export const API_BASE_URL = '[http://192.168.0.](http://192.168.0.)X:3000';
🐳 Conexión con la API Oficial en Docker (Backend NestJS)
La aplicación interactúa con el backend NestJS provisto por la cátedra (api-reservas-deportivas).

Clonar y levantar la API en una terminal independiente:

PowerShell
cd C:\dev\api-proyectos-mobile\api-reservas-deportivas
copy .env.example .env
docker compose up
Verificar estado de la API:
Navegar a http://localhost:3000/salud (o http://10.0.2.2:3000/salud desde el emulador Android). La API debe responder:

JSON
{ "datos": { "estado": "ok", "motor": "better-sqlite3", "almacen": "local" }, "meta": null }
🏗️ Arquitectura del Cliente (Patrón Client-Service con Dual Storage)
[ UI Screens (Expo Router) ]
         │
         ▼
[ Capa de Servicios (espacios, reservas, turnos, auth) ]
         │
   ┌─────┴────────────────────────────────┐
   │                                      │
(API REST Disponible)              (Modo Test / Offline)
   │                                      │
   ▼                                      ▼
[ API NestJS (Docker :3000) ]      [ In-Memory Mocks Store ]
(Bearer Token / JSON Envelopes)    (Mocks locales + Fallback)
Protocolo de Respuestas de la API
Toda llamada REST viene envuelta en la estructura estándar de la cátedra:

Éxito (Lista): { "datos": [...], "meta": { "total": 11, "pagina": 1, "porPagina": 20 } }

Éxito (Recurso): { "datos": {...}, "meta": null }

Error: { "error": { "codigo": "TURNO_OCUPADO", "mensaje": "Ese turno ya fue reservado." } }

📊 Modelos Principales (Tipos en src/tipos/)
Espacio: id, nombre, deporteId, complejo, superficie, techado, iluminacion, capacidad, precioPorHora, coordenadas (latitud, longitud), imagenes, videoUrl, reglas.

Turno: id, espacioId, fecha (AAAA-MM-DD), inicio (HH:MM), fin, estado (libre | reservado | fijo | mantenimiento), reservaId, motivoBloqueo, precio.

Reserva: id, turnoId, espacioId, usuarioId, cantidadPersonas, codigoQr, estado (confirmada | cancelada | cumplida | ausente), cancelableHasta.

Usuario: id, nombre, email, telefono, rol (jugador | encargado | administrador), espaciosFavoritos, cancelacionesTardias, ausencias.

🧪 Pruebas Automatizadas
La aplicación cuenta con una suite completa de pruebas unitarias y de integración desarrolladas en Jest:

PowerShell
# Verificar tipado de TypeScript
npx tsc --noEmit

# Ejecutar la suite completa (54/54 tests en verde)
npm test -- --runInBand
📱 Compilación del APK para Entrega Final (EAS Build)
Para generar el archivo instalable ejecutable .apk requerido para la entrega y defensa oral:

Instalar EAS CLI y autenticarse:

PowerShell
npm install -g eas-cli
eas login