# 💻🖥️📱 Sistema de Gestión de Recursos de aprendizaje
Proyecto creado con React Native.
La aplicacion hace uso de una API dinamica creada con MockAPI, permite, según el rol (estudiante/docente), listar, editar, agregar y eliminar recursos de tipo academicos como libros, videos, tutoriales, articulos de ingenieria. Además, la API cuenta con endpoint para Registrar nuevos usuarios
#### Credenciales de Usuarios para pruebas:
##### Rol = Docente ----> Email: pablo.ortiz@docente.edu.sv; Contraseña: Pass\*docente\*26
##### Rol = Estudiante -> Email: eduardo.ortiz@estudiante.edu.sv; Contraseña: Pass\*estudiante\*26
## 🌐 Demostración en Vivo

Prueba la aplicación directamente desde tu navegador o teléfono antes de descargar el código fuente.

👉 **[Ver proyecto en Expo Snack](https://snack.expo.dev/@jo5ueo2/-gestion_de_recursos_de_aprendizaje-desafiodps-2026)**

> 📱 Puedes escanear el código QR que aparece en la página de Expo Snack utilizando la app **Expo Go** en tu dispositivo móvil para probar la aplicación.

---

### ⚠️ Nota Importante de Compatibilidad (SDK v54 vs v55)

El proyecto principal en este repositorio utiliza **Expo SDK v55** para aprovechar las últimas características. Sin embargo, debido a limitaciones temporales con la librería `react-native-screens` en entornos web simulados (Expo.dev), la versión de **Expo Snack corre bajo SDK v54**.

Si decides probar la app en tu teléfono físico, ten en cuenta lo siguiente:

* **Para probar el Expo Snack (SDK 54):** Puedes usar la aplicación **Expo Go estándar** descargada directamente desde Google Play Store o Apple App Store.
* **Para clonar y correr el repositorio local (SDK 55):** La versión de Expo Go de la tienda oficial podría no ser compatible aún. Deberás instalar manualmente la versión correcta de Expo Go para tu emulador o descargar el archivo correspondiente desde el [historial de lanzamientos de Expo (GitHub)](https://github.com/expo/expo-go-releases/releases/download/Expo-Go-55.0.7/Expo-Go-55.0.7.apk).

---


## 🚀 Guía de básica para ejecutar localmente

Estos pasos son para clonar el proyecto y ejecutarlo en tu entorno local.

### 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado en tu sistema:
* **Node.js**
* **Git**
* **Expo Go** (App instalada en tu teléfono móvil para pruebas físicas)

---

### 🛠️ Pasos para la Instalación

#### 1. Clonar el repositorio
Abre tu terminal y ejecuta el siguiente comando para descargar el proyecto:
```bash
git clone https://github.com/J05ue21/Gestion_de_Recursos_de_Aprendizaje-WEB-API.git
```

#### 2. Acceder al directorio
Hay que moverse a la carpeta del proyecto que se acaba de crear:
```bash
cd NOMBRE_DE_LA_CARPETA
```

#### 3. Instalar las dependencias
Estando ubicado dentro del directorio de la carpeta de la app, instala todos los paquetes y librerías necesarias del proyecto:
```bash
npm install
```

#### 4. Iniciar el servidor de desarrollo
Lanza el entorno de desarrollo de Expo:
```bash
npx expo start
```

---

### 📱 ¿Cómo visualizar la aplicación?

Una vez que ejecutes `npx expo start`, verás un código QR en la terminal. Elige una opción:

* **Dispositivo Físico:** Abre la app **Expo Go** en tu celular, escanea el código QR y la app se cargará automáticamente.
* **Emulador (Android/iOS):** Presiona `a` en la terminal para abrir el emulador de Android, o `i` para el simulador de iOS.
* **Navegador Web:** Presiona `w` para permitir una versión en el navegador.
