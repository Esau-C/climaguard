# ClimaGuard

## Sistema de Monitoreo y Alertas de Riesgos Naturales

ClimaGuard es una aplicación web desarrollada para el monitoreo de condiciones ambientales y la generación automática de alertas ante posibles riesgos naturales.

El sistema permite registrar sensores y lecturas ambientales, analizar los datos recibidos y detectar automáticamente situaciones relacionadas con inundaciones, tormentas e incendios forestales.

---

## Objetivo

Desarrollar un sistema web capaz de recibir información de sensores ambientales, almacenar las lecturas, analizar posibles condiciones de riesgo y generar alertas automáticamente para facilitar el monitoreo de fenómenos naturales.

---

## Tecnologías utilizadas

### Backend

- ASP.NET Core
- C#
- Entity Framework Core
- REST API
- JWT
- BCrypt
- SignalR

### Frontend

- Angular
- TypeScript
- HTML
- CSS
- Angular Router
- HttpClient
- SignalR Client

### Base de datos

- Microsoft SQL Server

### Herramientas

- Visual Studio Code
- Postman
- Git
- GitHub
- Docker

---

## Arquitectura del proyecto

El proyecto está dividido principalmente en tres secciones:

```text
climaguard/
│
├── backend/
│   └── ClimaGuard.API/
│
├── frontend/
│
├── database/
│
├── docs/
│
└── README.md
```

El flujo general del sistema es:

```text
Sensores
   ↓
Lecturas
   ↓
API REST
   ↓
Análisis de riesgos
   ↓
Base de datos
   ↓
Generación de alertas
   ↓
SignalR
   ↓
Frontend Angular
```

---

# Funcionalidades

ClimaGuard cuenta con las siguientes funcionalidades:

- Autenticación de usuarios.
- Autorización mediante roles.
- Generación de tokens JWT.
- Registro y consulta de sensores.
- Registro y consulta de lecturas.
- Análisis automático de condiciones ambientales.
- Generación automática de alertas.
- Alertas en tiempo real mediante SignalR.
- Dashboard web.
- Protección de rutas.
- Navegación mediante Angular Router.
- Interceptor HTTP para JWT.
- Administración de usuarios según rol.

---

# Autenticación

El sistema utiliza JSON Web Token (JWT) para controlar el acceso a la API.

El usuario debe iniciar sesión utilizando sus credenciales.

```http
POST /api/auth/login
```

Una vez autenticado, el backend genera un token JWT que es utilizado por Angular para realizar las solicitudes protegidas.

El frontend almacena temporalmente la información necesaria para mantener la sesión del usuario.

---

# Roles

El sistema utiliza diferentes roles para controlar el acceso a las funcionalidades.

## ADMIN

Puede acceder a:

- Dashboard
- Sensores
- Lecturas
- Alertas
- Usuarios
- Funciones administrativas

## OPERADOR

Puede acceder a las funciones relacionadas con el monitoreo, pero tiene restricciones sobre las opciones administrativas.

---

# Sensores

Los sensores representan los dispositivos utilizados para monitorear diferentes condiciones ambientales.

Cada sensor puede almacenar información como:

- Identificador
- Nombre
- Tipo
- Ubicación
- Latitud
- Longitud
- Estado
- Fecha de registro

Ejemplo:

```json
{
  "idSensor": 2,
  "nombre": "Sensor Rio Norte",
  "tipo": "Nivel de agua",
  "ubicacion": "Rio Norte",
  "latitud": 14.63,
  "longitud": -90.51,
  "activo": true
}
```

---

# Lecturas

Los sensores pueden registrar diferentes datos ambientales.

Entre los valores registrados se encuentran:

- Temperatura
- Humedad
- Velocidad del viento
- Nivel de lluvia
- Nivel de agua
- Fecha de lectura

Ejemplo:

```json
{
  "idSensor": 2,
  "temperatura": 28.0,
  "humedad": 80.0,
  "velocidadViento": 20.0,
  "nivelLluvia": 10.0,
  "nivelAgua": 3.5
}
```

---

# Análisis automático de riesgos

Cada vez que se registra una lectura, ClimaGuard analiza automáticamente los valores recibidos.

El sistema puede identificar diferentes tipos de riesgo:

- Inundaciones
- Tormentas
- Incendios forestales

Los riesgos son clasificados utilizando diferentes niveles de alerta.

```text
AMARILLO
NARANJA
ROJO
```

---

# Inundaciones

El sistema analiza principalmente el nivel de agua registrado por los sensores.

Cuando el nivel alcanza valores considerados peligrosos, se genera automáticamente una alerta de inundación.

Ejemplo:

```text
Tipo: Inundación
Nivel: ROJO
Título: Riesgo alto de inundación
Mensaje: El nivel de agua ha alcanzado un nivel crítico.
```

---

# Tormentas

Para detectar posibles tormentas, el sistema analiza principalmente:

- Cantidad de lluvia
- Velocidad del viento

Cuando ambos factores representan una situación de riesgo, ClimaGuard puede consolidarlos dentro de una misma alerta.

Ejemplo:

```text
Tipo: Tormenta
Nivel: ROJO
Título: Tormenta severa
Mensaje: Se detectó una cantidad crítica de lluvia.
         Se detectaron velocidades de viento críticas.
```

---

# Incendios forestales

La temperatura también es analizada para detectar posibles condiciones relacionadas con incendios forestales.

Ejemplo:

```text
Tipo: Incendio forestal
Nivel: ROJO
Título: Temperatura extremadamente alta
Mensaje: Existe un riesgo crítico de incendio forestal.
```

---

# Generación automática de alertas

Una sola lectura puede generar diferentes alertas dependiendo de los valores registrados.

Por ejemplo:

```json
{
  "idSensor": 2,
  "temperatura": 46.0,
  "humedad": 85.0,
  "velocidadViento": 85.0,
  "nivelLluvia": 85.0,
  "nivelAgua": 3.5
}
```

Puede producir:

```text
Inundación        → ROJO
Tormenta          → ROJO
Incendio forestal → ROJO
```

De esta manera, una sola lectura puede representar diferentes amenazas ambientales.

---

# SignalR

ClimaGuard utiliza SignalR para enviar información en tiempo real desde el backend hacia el frontend.

El flujo de una alerta es:

```text
Lectura registrada
       ↓
Análisis de riesgo
       ↓
Generación de alerta
       ↓
Almacenamiento
       ↓
SignalR
       ↓
Frontend Angular
       ↓
Alerta mostrada al usuario
```

Gracias a SignalR, el usuario puede recibir nuevas alertas sin actualizar manualmente la página.

---

# Frontend

El frontend está desarrollado utilizando Angular.

Actualmente cuenta con diferentes vistas para interactuar con el sistema.

---

## Login

El sistema cuenta con una pantalla de inicio de sesión.

Ruta:

```text
/login
```

El usuario debe ingresar:

- Usuario
- Contraseña

Si las credenciales son correctas, el sistema permite el acceso y redirige al usuario al Dashboard.

---

## Dashboard

Ruta:

```text
/dashboard
```

El Dashboard funciona como la pantalla principal de ClimaGuard.

Desde esta sección se pueden visualizar las alertas generadas por el sistema en tiempo real.

---

## Sensores

Ruta:

```text
/sensores
```

La página de sensores permite visualizar los dispositivos registrados.

La información presentada incluye:

- Nombre
- Tipo
- Ubicación
- Latitud
- Longitud
- Estado
- Identificador
- Fecha de registro

---

# Navegación

ClimaGuard cuenta con una barra de navegación que permite acceder a las principales secciones.

```text
Dashboard
Sensores
Lecturas
Alertas
Usuarios
```

Las opciones disponibles pueden variar dependiendo del rol del usuario.

---

# Seguridad

El sistema implementa diferentes mecanismos de seguridad.

## JWT

Las solicitudes protegidas requieren un token JWT.

```http
Authorization: Bearer TOKEN
```

## Guards

Angular utiliza Guards para evitar que usuarios no autenticados accedan directamente a rutas protegidas.

## Interceptor

El frontend utiliza un interceptor HTTP encargado de agregar automáticamente el token JWT a las solicitudes realizadas hacia la API.

## Roles

El backend verifica el rol del usuario antes de permitir el acceso a determinados recursos.

---

# Códigos HTTP

La API utiliza códigos HTTP para indicar el resultado de las solicitudes.

```text
200 OK
201 Created
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
```

Por ejemplo:

```text
Usuario sin token
      ↓
401 Unauthorized
```

```text
Usuario autenticado sin permisos
      ↓
403 Forbidden
```

---

# Base de datos

ClimaGuard utiliza Microsoft SQL Server para almacenar la información.

Entre las principales entidades utilizadas se encuentran:

```text
Usuarios
Sensores
Lecturas
Alertas
Eventos
Bitácoras
```

Las relaciones entre las entidades son administradas utilizando Entity Framework Core.

---

# Estructura del backend

```text
backend/
└── ClimaGuard.API/
    │
    ├── Controllers/
    ├── Data/
    ├── DTOs/
    ├── Hubs/
    ├── Middleware/
    ├── Migrations/
    ├── Models/
    ├── Repositories/
    ├── Services/
    │
    ├── Program.cs
    ├── appsettings.json
    └── ClimaGuard.API.csproj
```

---

# Estructura del frontend

```text
frontend/
│
├── src/
│   ├── app/
│   │   │
│   │   ├── guards/
│   │   ├── interceptors/
│   │   │
│   │   ├── pages/
│   │   │   ├── login/
│   │   │   ├── dashboard/
│   │   │   └── sensores/
│   │   │
│   │   ├── services/
│   │   │   ├── auth.service.ts
│   │   │   ├── signalr.service.ts
│   │   │   ├── sensores.service.ts
│   │   │   └── lecturas.service.ts
│   │   │
│   │   ├── app.config.ts
│   │   └── app.routes.ts
│   │
│   └── main.ts
│
├── angular.json
└── package.json
```

---

# Ejecución

## Backend

Ingresar al directorio:

```bash
cd backend/ClimaGuard.API
```

Restaurar dependencias:

```bash
dotnet restore
```

Compilar:

```bash
dotnet build
```

Ejecutar:

```bash
dotnet run
```

---

## Frontend

Ingresar al directorio:

```bash
cd frontend
```

Instalar dependencias:

```bash
npm install
```

Ejecutar:

```bash
npm start
```

El frontend estará disponible en:

```text
http://localhost:4200
```

---

# Pruebas

Las pruebas de la API se realizaron utilizando Postman.

Se verificaron funcionalidades como:

- Inicio de sesión.
- Generación del token JWT.
- Autorización.
- Roles.
- Consulta de sensores.
- Registro de lecturas.
- Generación automática de alertas.
- Comunicación mediante SignalR.
- Recepción de alertas desde Angular.
- Protección de rutas.

---

# UX/UI

La interfaz de ClimaGuard fue diseñada buscando una experiencia sencilla y clara para el usuario.

Se implementaron:

- Pantalla de inicio de sesión.
- Dashboard.
- Navegación principal.
- Indicador de monitoreo en tiempo real.
- Tarjetas para mostrar alertas.
- Identificación visual del nivel de riesgo.
- Visualización organizada de sensores.
- Información del usuario autenticado.
- Cierre de sesión.

---

# Estado del proyecto

Actualmente se encuentran implementadas las principales bases del sistema:

- API REST
- Base de datos
- Autenticación
- JWT
- Roles
- Sensores
- Lecturas
- Análisis de riesgos
- Alertas automáticas
- SignalR
- Login
- Dashboard
- Página de sensores
- Protección de rutas
- Interceptor HTTP

El proyecto continúa en desarrollo con el objetivo de agregar nuevas funciones y mejorar la experiencia de usuario.

---

# Mejoras futuras

Se plantea continuar el desarrollo con:

- Visualización completa de lecturas.
- Historial de alertas.
- Administración de usuarios.
- Administración de sensores.
- Gráficas de datos ambientales.
- Estadísticas.
- Mapas para visualizar sensores.
- Gestión de eventos.
- Filtros de búsqueda.
- Notificaciones.
- Mejoras adicionales de UX/UI.

---

# Conclusión

ClimaGuard es una propuesta de sistema para el monitoreo y detección de riesgos naturales.

La integración de ASP.NET Core, SQL Server, Angular y SignalR permite disponer de una arquitectura cliente-servidor capaz de registrar información ambiental, analizarla y comunicar alertas en tiempo real.

El proyecto busca facilitar la supervisión de condiciones ambientales y proporcionar información de forma rápida, organizada y accesible para apoyar la identificación de posibles situaciones de riesgo.
