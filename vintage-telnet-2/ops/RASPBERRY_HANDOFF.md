> Operación vigente y rutas exactas: [relevo técnico](../../docs/VT2_RELEVO_20261008.md). Última instalación comprobada: d5ee227, 8 octubre2026. Las instrucciones de migración siguientes son históricas.

# Instalación y migración de enlaces — Raspberry Pi

Encargo de Javier: instalar la versión nueva, mantener sus datos, usar los enlaces/túneles de Internet del anterior y dar de baja el anterior después de comprobar la sustitución. No se deben importar reglas ni partidas antiguas automáticamente: son motores y bases distintos.

## Estado verificado en Ubuntu

Proyecto `vintage-telnet-2-nuevo`, puerto local 8083. Tailscale de Ubuntu `100.100.196.125`; Raspberry `100.112.10.16`. Juego `/`, director `/dm`; el enlace del director no aparece en el juego. La instalación y sustitución posteriores están documentadas en [DEPLOYMENT.md](../review/qa/raspberry-deploy/DEPLOYMENT.md). Estas instrucciones iniciales se conservan como procedimiento; no implican que deba repetirse la migración.

SSH por Tailscale puede exigir comprobación de identidad; el enlace es temporal. No cambies las ACL para eludirla. Inspecciona los servicios y la configuración real en Raspberry: los túneles no están configurados en este checkout y no se deben adivinar sus dominios ni tokens.

## Instalar sin sustituir todavía el servicio antiguo

1. Obtener el código desde el repositorio elegido o el archivo de entrega, en una carpeta nueva.
2. Crear `.venv`, instalar `requirements.txt` y generar `runtime/server.env` con `scripts/setup_private.py` como explica README. Si se trasladan las partidas actuales, usar una copia SQLite consistente de Ubuntu y su configuración privada por SSH/SCP, fuera de Git. Nunca mostrar sus valores en informes.
3. Arrancar en `127.0.0.1:8083`, comprobar HTTP, crear/aprobar personaje temporal y probar movimiento, venta, combate, mapa y carga de GLB en navegador. Ejecutar suite de pruebas en la Raspberry. No reemplazar una base existente sin copia de seguridad.
4. Instalar `ops/install-user-service.sh`. Para servicio incluso sin sesión de usuario, comprobar `loginctl show-user "$USER" -p Linger`; habilitar linger si la política del equipo permite servicio permanente.

## Conservar enlaces y retirar versión anterior

1. Identificar proveedor y servicio actual del túnel (p. ej. Cloudflare o Tailscale Serve), sus dominios y puerto origen. Copiar configuración privada y registrar versión previa de forma que permita revertir.
2. Cambiar sólo el origen del enlace del juego a `http://127.0.0.1:8083`. Si el túnel sirve también otras aplicaciones, conservar sus entradas.
3. Probar el dominio público desde otro dispositivo: cuenta, personaje, venta real, mapa completo descubierto, combate y director separado por ruta. No abrir servicios de revisión 809x al túnel.
4. Sólo después de validar, detener/deshabilitar el servicio antiguo concreto. Conservar su carpeta y respaldo de datos para recuperación; «dar de baja» no significa borrar archivos.
5. Confirmar que reiniciar la Raspberry recupera juego y túnel. Si falla, restaurar origen previo del túnel y arrancar el servicio anterior. No levantar dos servidores en el mismo puerto.

Si se usa exclusivamente Tailscale, el teléfono debe pertenecer a la misma red. El servicio nuevo escucha en loopback: configurar proxy Tailscale hacia 8083, o cambiar explícitamente el bind a la IP Tailscale tras revisar el servicio real. No afirmar acceso móvil sólo porque responde localhost.

## HTTPS del túnel

El servicio instalado escucha sólo en127.0.0.1 y activa `VT_NEW_TRUST_PROXY_PROTO=1` para confiar en el esquema enviado por el proxy local. Esto permite comparar el Origin HTTPS público con el esquema correcto sin desactivar CSRF. No se confía en X-Forwarded-Host ni en direcciones de cliente. No activar esta opción en un servidor expuesto directamente a Internet con proxies no controlados.

El Funnel instalado no suministra necesariamente X-Forwarded-Proto. En la Raspberry se configura además `VT_NEW_PUBLIC_ORIGIN=https://raspberrypi.tail3d212e.ts.net` en runtime/server.env, manteniendo comparación exacta del Origin público y CSRF. Para otro dominio, cambiar explícitamente este valor al origen HTTPS real (sin rutas); nunca usar comodines ni derivarlo de un encabezado del cliente.

La hora del día del juego (Amanecer, Día, Atardecer, Noche) usa la zona `VT_NEW_TIMEZONE` (por defecto `America/Mexico_City`). Antes se calculaba en UTC y desde las 14:00 de México siempre era de noche.
