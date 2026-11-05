# Reservas Deportivas — Mobile Application (React Native / Expo)

Aplicación móvil desarrollada en React Native con Expo Router para la gestión y reserva de turnos en complejos deportivos. El sistema soporta una arquitectura desacoplada REST API con un mecanismo de fallback local a Mocks para operar offline o ejecutar la suite de pruebas automatizadas.

---

## 🚀 Requisitos e Instalación

### Prerrequisitos
* **Node.js**: v18 o superior
* **PowerShell / Terminal**: Para ejecutar comandos de entorno
* **Expo Go**: App móvil (compatible con SDK 57) instalada en un dispositivo físico o emulador.

### Pasos de Instalación

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/tu-usuario/reservas-deportivas.git
   cd reservas-deportivas
Instalar dependencias:Bashnpm install
⚙️ Configuración de Variables de EntornoCrea un archivo .env en la raíz del proyecto para definir la URL del servidor backend en NestJS:Fragmento de códigoEXPO_PUBLIC_API_URL=http://localhost:3000
Nota: Para probar en dispositivos físicos mediante Expo Go, reemplaza localhost por la IP local de tu máquina (ejemplo: [http://192.168.1.50:3000](http://192.168.1.50:3000)).🧪 Ejecución y Pruebas AutomatizadasLa aplicación cuenta con una suite completa de unit e integration testing implementada con Jest.PowerShell# Verificar tipos con el compilador de TypeScript
npx tsc --noEmit

# Ejecutar la suite completa de pruebas (54 tests passing)
npm test -- --runInBand

# Ejecutar la aplicación en entorno de desarrollo con Expo Go
npx expo start
🏗️ Arquitectura de Software y Capa de ServiciosPatrón Client-Service con Dual Storage (API / Mock Fallback)El cliente HTTP (src/servicios/api.ts) intercepta las peticiones REST. En entornos donde la API remota no responde o durante la ejecución de los tests (process.env.NODE_ENV === 'test'), los servicios conmutan automáticamente a la capa de datos en memoria (src/mocks/), garantizando:Alta Disponibilidad Offline: La aplicación sigue operando en dispositivos sin conectividad.Deterministic Test Suite: Las reglas de negocio (4hs de cancelación, 3 reservas máximas por usuario, filtrado de turnos de la jornada) son validadas en 7 test suites aisladas.Diagrama Simplificado de ArquitecturaPlaintext[ UI Screens (Expo Router) ]
         │
         ▼
[ Capa de Servicios (espacios, reservas, turnos, usuarios) ]
         │
   ┌─────┴────────────────────────────────┐
   │                                      │
(REST API Dispo?)                   (Modo Test / Offline?)
   │                                      │
   ▼                                      ▼
[ NestJS Backend API ]             [ In-Memory Mocks Store ]
(JWT / REST Endpoints)             (Mocks locales + Fallback)

