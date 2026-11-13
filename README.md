# ⚽ SportReserve Mobile — Plataforma Integral de Gestión y Reserva de Espacios Deportivos

**SportReserve Mobile** es una solución móvil multiplataforma de nivel empresarial diseñada para modernizar y automatizar la administración de complejos deportivos, municipios y clubes. Desarrollada bajo una arquitectura moderna en **React Native y TypeScript**, ofrece una experiencia de usuario fluida, rápida y confiable, conectando a los deportistas con los predios en tiempo real.

---

## 💡 Propuesta de Valor y Solución de Negocio

* **Gestión Automatizada 24/7:** Elimina la carga administrativa de reservas telefónicas o presenciales mediante una grilla horaria interactiva (08:00 a 24:00 hs) sincronizada en tiempo real.
* **Control de Ausentismo y Reglas Inteligentes:** Motor de reglas de negocio integrado que limita reservas simultáneas (máx. 3 activas por usuario) y aplica políticas de cancelación dinámica (ventana de 4 horas con flujo de autorización administrativa).
* **Control de Acceso Sin Contacto:** Generación instantánea de **pases digitales con código QR** y escáner nativo integrado para validar el ingreso en puerta de forma ágil y segura.
* **Operación Resiliente (Offline-First):** Arquitectura desacoplada con almacenamiento local que garantiza la consulta de reservas y operación continua incluso en predios con baja conectividad.

---

## 📱 Características Principales

### Para el Deportista (Jugador)
* **Exploración y Filtrado Avanzado:** Búsqueda por disciplina deportiva, tipo de superficie, iluminación nocturna, techado y capacidad.
* **Geolocalización y Mapas Interactivos:** Visualización geográfica de todos los complejos deportivos con cálculo de proximidad, pines interactivos y manejo inteligente de permisos GPS.
* **Reserva en 3 Pasos:** Selección de turno, confirmación instantánea, feedback háptico nativo y emisión automática de código QR.
* **Historial y Calificaciones:** Gestión de turnos próximos, historial de asistencia y sistema de valoración de 1 a 5 estrellas para mejora continua del servicio.

### Para la Administración (Encargados y Directivos)
* **Control de Predios y Bloqueos:** Gestión centralizada de mantenimiento, condiciones climáticas (lluvia) y asignación de turnos fijos.
* **Validación en Puerta:** Lectura de códigos QR mediante la cámara del dispositivo para el registro inmediato de asistencia o ausencias.
* **Excepciones Administrativas:** Flujo dedicado para aprobar cancelaciones fuera de término sin fricciones operativas.

---

## 🛠️ Stack Tecnológico y Capacidades Nativas

La aplicación está construida sobre estándares de la industria móvil para garantizar escalabilidad, seguridad y rendimiento nativo en **Android** e **iOS**:

* **Core & Framework:** React Native (Expo SDK 57) con enrutamiento basado en archivos (**Expo Router**).
* **Lenguaje:** TypeScript (tipado estricto de punta a punta para minimizar errores en producción).
* **Comunicaciones & API:** Cliente HTTP **Axios** centralizado con interceptores JWT, manejo estandarizado de respuestas y tolerancia a fallos.
* **Mapas y Geolocalización:** Integración nativa con `expo-location` y `react-native-maps` (con soporte de fallback interactivo) para renderizado fluido de coordenadas, zoom y marcadores personalizados.
* **Hardware y Sensores:**
  * **Cámara & QR:** `expo-camera` (`CameraView`) para escaneo óptico de alta velocidad.
  * **Feedback Sensorial:** `expo-haptics` y `expo-av` para confirmaciones táctiles y sonoras.
* **Seguridad y Persistencia:**
  * `expo-secure-store` para el resguardo encriptado de credenciales y tokens de sesión.
  * `expo-sqlite` para persistencia local estructurada y operación sin conexión.
* **Calidad de Software (QA):** Suite automatizada con **Jest** (54 pruebas unitarias y de integración certificadas) y análisis estático con `tsc`.
* **Despliegue:** Pipeline listo para empaquetado nativo en la nube mediante **EAS Build** (generación de binarios `.apk` / `.aab`).

---

## 🏗️ Arquitectura del Sistema

```text
┌─────────────────────────────────────────────────────────────┐
│                    APLICACIÓN MÓVIL (Cliente)               │
│                 React Native + Expo + TypeScript            │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│              CAPA DE SERVICIOS (Patrón Client-Service)      │
│   [ Espacios ]   [ Turnos ]   [ Reservas ]   [ Seguridad ]  │
└──────────────┬───────────────────────────────┬──────────────┘
               │ (Conexión Online)             │ (Modo Resiliencia)
               ▼                               ▼
┌──────────────────────────────┐ ┌────────────────────────────┐
│     API REST (NestJS)        │ │   Almacenamiento Local     │
│  PostgreSQL + Docker + JWT   │ │  SQLite + SecureStore      │
└──────────────────────────────┘ └────────────────────────────┘


🚀 Guía de Despliegue y Arranque Rápido
1. Requisitos del Entorno
Node.js (v18 LTS o v24+)

Docker Desktop (para el despliegue del servidor backend)

Android Studio (Emulador Pixel 7) o dispositivo físico Android/iOS con Expo Go

2. Levantamiento del Servidor Backend (API + Base de Datos)
El entorno servidor está contenedorizado para un despliegue inmediato en cualquier infraestructura:

# Ingresar al directorio del servidor
cd api-reservas-deportivas

# Configurar variables de entorno y levantar servicios
cp .env.example .env
docker-compose up -d

3. Instalación y Arranque de la Aplicación Móvil

# Clonar el repositorio e instalar dependencias
git clone [https://github.com/tu-organizacion/reservas-deportivas.git](https://github.com/tu-organizacion/reservas-deportivas.git)
cd reservas-deportivas
npm install

4. Configuración de Conectividad (src/config/env.ts)
Ajuste el endpoint según el entorno de ejecución deseado:

// Entorno de Emulación Local (Android Studio):
export const API_BASE_URL = '[http://10.0.2.2:3000](http://10.0.2.2:3000)';

// Entorno de Red Local Wi-Fi (Dispositivos físicos en predio):
// export const API_BASE_URL = '[http://192.168.0.](http://192.168.0.)X:3000';

// Entorno Producción / Nube:
// export const API_BASE_URL = '[https://api.tudominio.com](https://api.tudominio.com)';

5. Ejecución de la Aplicación

# Iniciar el servidor de desarrollo Expo
npx expo start

🧪 Certificación de Calidad y Compilación
Verificación de Código y Tests Automatizados de la app

# Validación de tipos en TypeScript
npx tsc --noEmit

# Ejecución de la suite completa de pruebas (54/54 tests aprobados)
npm test -- --runInBand

Generación de Instalador Nativo (APK para Android)

# Instalar herramienta de compilación y autenticar
npm install -g eas-cli
eas login

# Compilar binario listo para distribución
eas build -p android --profile preview