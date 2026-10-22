# Senku 2 — Guía de Instalación PWA (Móvil / Tableta)

Senku 2 está diseñado como una Aplicación Web Progresiva (PWA) de pantalla completa en orientación horizontal (*landscape*), con almacenamiento local tolerante y soporte para jugar sin conexión (*offline*).

---

## 1. Requisitos de Ejecución

- Navegador web moderno con soporte para Service Workers y Web App Manifest.
- Servido bajo protocolo seguro (`https://`) o `http://localhost` / `http://127.0.0.1`.

---

## 2. Instalación en Dispositivos

### Apple iPad y iPhone (Safari)
1. Abre el enlace del juego (`/senku/v2/index.html`) en Safari.
2. Pulsa el botón **Compartir** (icono con un cuadrado y una flecha apuntando hacia arriba).
3. Desplázate hacia abajo y selecciona **"Agregar a pantalla de inicio"** (*Add to Home Screen*).
4. Confirma el nombre (por defecto "Senku 2") y pulsa **Agregar**.
5. Abre el juego desde el icono creado en la pantalla de inicio: se iniciará a pantalla completa sin la barra de direcciones de Safari ni pestañas, adaptándose al *notch* o barra de inicio de iOS.

### Dispositivos Android (Google Chrome)
1. Abre el enlace del juego en Chrome.
2. Pulsa el menú de opciones (tres puntos verticales en la esquina superior derecha).
3. Selecciona **"Instalar aplicación"** o **"Agregar a la pantalla principal"**.
4. Pulsa **Instalar** en el aviso emergente.
5. Abre "Senku 2" desde la lista de aplicaciones o pantalla principal: se abrirá en horizontal nativo a pantalla completa sin controles del navegador.

---

## 3. Pantalla Completa y Notch (Safe Area)

- **Viewport:** Configurado con `viewport-fit=cover` para aprovechar pantallas panorámicas modernas de borde a borde.
- **Áreas Seguras (*Safe Area*):** El CSS utiliza `env(safe-area-inset-*)` dinámico para garantizar que ni el *notch*, ni la *Isla Dinámica*, ni la barra gestual inferior de iOS/Android tapen el HUD superior (saldo de Churus / traje) ni los botones táctiles de dirección y salto.
- **Letterbox Responsivo:** El lienzo preserva la relación de aspecto lógica (16:9) mediante franjas de fondo adaptadas al formato del dispositivo.

---

## 4. Funcionamiento Sin Conexión (Offline)

- El archivo `sw.js` registra una caché versionada (`senku2-v1`).
- Tras la primera carga, los recursos críticos (código del motor, escenas, datos y estilos) quedan guardados localmente. Si el dispositivo pierde la conexión a internet, el juego sigue funcionando normalmente.
- Cuando se libere una nueva versión del juego, el Service Worker actualiza la versión y purga automáticamente los cachés obsoletos.

---

## 5. Pendientes Creativos / Arte

- **TODO Ícono 512x512:** El manifest actual reutiliza el activo existente `assets/icon/senku-icon-192.png` y `matiasgamelab-icon-192.png`. Queda pendiente generar un icono dedicado en resolución 512x512 cuando Javier y Matías proporcionen el arte final.
