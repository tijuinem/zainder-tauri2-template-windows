# 📘 NOTA TÉCNICA INTERNA: GUÍA DE COMPILACIÓN WINDOWS (TAURI v2 + RUST)
**Fecha de validación**: 24 de Octubre de 2026  
**Entorno**: Windows 11 / Windows 10 x64, Tauri v2.x, Rust 1.99.x, Vite 8.x, React 19.x  
**Estado verificado**:
- ✅ **Setup (.exe con NSIS)**: Pregunta confirmación para acceso directo al escritorio, instala sin problemas y se desinstala al 100% sin dejar procesos ni archivos bloqueados.
- ✅ **Portable (.exe)**: Arranca instantáneo con simple **doble clic**, sin pedir privilegios de Administrador (UAC `asInvoker`), sin dependencias externas y sin ensuciar el sistema.
- ✅ **Instancia Única (Single Instance Lock)**: Si la app ya está abierta, un nuevo doble clic no duplica procesos; enfoca y trae la ventana al frente.
- ✅ **Persistencia real en AppData**: Configuración guardada en `%APPDATA%\<App>\settings.json` mediante comandos nativos de Rust.
- ✅ **Ventana Frameless**: Barra de título integrada en el Navbar con zona de arrastre (`nativeApi.startDragging`) y botones nativos Minimizar, Maximizar y Cerrar.
- ✅ **Diálogo nativo de Windows**: Selector nativo de carpetas con `tauri-plugin-dialog`.
- ✅ **Notificaciones nativas de Windows**: Avisos toast en segundo plano con `tauri-plugin-notification`.
- ✅ **Logs persistentes en disco**: Registro rotativo diario (`%APPDATA%\logs\YYYY-MM-DD.log`) para errores/advertencias con botón para abrir la carpeta directamente desde el visor de logs.
- ✅ **Script de renombrado automático**: `npm run rename -- "NuevoNombre" "com.empresa.app"` para rebrandear la plantilla en 2 segundos.

---

## 1. 🛑 LOS DOS GRANDES PROBLEMAS HISTÓRICOS Y SU SOLUCIÓN

### Problema A: El Portable no abre con doble clic o pide "Ejecutar como Administrador"

#### ¿Por qué ocurría antes?
1. **Llamadas internas a PowerShell o APIs privilegiadas al arrancar**: Si el código Rust (`lib.rs` o `main.rs`) ejecuta en su arranque rutinas que intentan tocar el Escritorio, crear accesos directos o consultar el registro con comandos del sistema (ej: `powershell.exe -Command ...`), Windows SmartScreen / UAC detecta comportamiento anómalo y bloquea el proceso o fuerza la elevación de privilegios.
2. **Nombre del ejecutable**: Si el binario contiene palabras reservadas como `setup`, `install`, `update` o `patch`, la tecnología de compatibilidad de Windows (UAC Installer Detection) asume que es un instalador y fuerza el escudo de administrador.
3. **Ubicación del binario**: Tauri solo deposita en `src-tauri/target/release/bundle/nsis/` el instalador `setup.exe`. El ejecutable standalone real queda en `src-tauri/target/release/Zainder.exe`.

#### Solución aplicada:
- En `src-tauri/src/lib.rs`:
  Se **eliminó** la llamada automática `ensure_desktop_shortcut()` dentro de la función `pub fn run()`.
  El portable ahora es **100% puro y pasivo**: solo inicializa Tauri y carga el frontend embebido.
- Manifiesto estándar con nivel `asInvoker` (por defecto en Tauri si no se fuerza elevación).
- El binario portable es un archivo único (~11.2 MB) que corre como usuario estándar sin tocar nada del sistema operativo.

---

### Problema B: El Setup no se desinstala limpiamente o falla la desinstalación

#### ¿Por qué ocurría antes?
1. **Procesos huérfanos / bloqueados**: Si la aplicación sigue abierta o quedó un subproceso de WebView2 colgado en segundo plano, el desinstalador de Windows intenta borrar `Zainder.exe` y falla con error "El archivo está en uso por otro proceso". El desinstalador aborta a medias y la app queda corrupta en el sistema.
2. **Accesos directos no registrados**: Los accesos directos creados fuera del flujo estándar de NSIS no son rastreados por el desinstalador y quedan huérfanos en el Escritorio tras desinstalar.
3. **Permisos de instalación desalineados**: Si se instala en `Program Files` sin permisos o si `installMode` no está bien definido, el desinstalador no tiene permisos para borrar `$INSTDIR`.

#### Solución aplicada:
Se configuró `src-tauri/windows/hooks.nsh` con macros críticas de ciclo de vida:

```nsis
!macro NSIS_HOOK_PREINSTALL
  ; 1. Cerrar preventivamente cualquier instancia previa que bloquee archivos
  nsExec::Exec 'taskkill /F /IM Zainder.exe /T'
  nsExec::Exec 'taskkill /F /IM Zainder.exe /T'
!macroend

!macro NSIS_HOOK_POSTINSTALL
  ; 2. Preguntar explícitamente al usuario por el acceso directo al escritorio
  MessageBox MB_YESNO|MB_ICONQUESTION "¿Desea crear un acceso directo en el Escritorio?" IDNO skip_desktop
  CreateShortCut "$DESKTOP\Zainder.lnk" "$INSTDIR\Zainder.exe" "" "$INSTDIR\Zainder.exe" 0
  skip_desktop:
!macroend

!macro NSIS_HOOK_PREUNINSTALL
  ; 3. Al desinstalar, matar el proceso de forma forzada para liberar cualquier archivo
  nsExec::Exec 'taskkill /F /IM Zainder.exe /T'
  nsExec::Exec 'taskkill /F /IM Zainder.exe /T'
  Sleep 600

  ; 4. Eliminar el acceso directo del escritorio y del menú inicio
  Delete "$DESKTOP\Zainder.lnk"
  Delete "$SMPROGRAMS\Zainder\Zainder.lnk"
!macroend

!macro NSIS_HOOK_POSTUNINSTALL
  ; 5. Limpieza definitiva
  Delete "$DESKTOP\Zainder.lnk"
  RMDir /r "$INSTDIR"
!macroend
```

Y en `src-tauri/tauri.conf.json`:
```json
"bundle": {
  "active": true,
  "targets": ["nsis"],
  "windows": {
    "nsis": {
      "installMode": "both",
      "installerHooks": "windows/hooks.nsh"
    }
  }
}
```
Con `installMode: "both"`, el usuario puede elegir:
- **Solo para mí**: Instala en `AppData\Local\Programs\...` (no requiere UAC, no toca `Program Files`, desinstalación 100% limpia sin pedir admin).
- **Para todos los usuarios**: Instala en `C:\Program Files\...` pidiendo confirmación de UAC estándar.

---

## 2. ⚡ EVITAR EL ERROR DE COMPILACIÓN: `os error 32` (I/O Locking en Windows)

### Síntoma:
```
error: failed to remove / write ... target\release\deps\....rmeta:
El proceso no tiene acceso al archivo porque está siendo utilizado por otro proceso. (os error 32)
```

### Causa:
Windows Defender o el indexador de Windows analizan en tiempo real los miles de archivos temporales `.rmeta` y `.o` que genera `cargo` en paralelo, bloqueando momentáneamente los descriptores de archivo.

### Procedimiento seguro de compilación:
1. Limpiar la carpeta temporal si hubo un build interrumpido:
   ```powershell
   Remove-Item -Force -Recurse -ErrorAction SilentlyContinue "src-tauri\target\release"
   ```
2. Compilar con límite de concurrencia en disco:
   ```powershell
   $env:CARGO_BUILD_JOBS="4"
   cargo build --release --manifest-path src-tauri/Cargo.toml
   ```
3. Generar el bundle NSIS con Tauri:
   ```powershell
   npx tauri build
   ```

---

## 3. 📂 DÓNDE QUEDAN LOS ARCHIVOS FINALES

Tras el build:
- **El Instalador Setup** queda en:
  `src-tauri\target\release\bundle\nsis\Zainder_1.0.0_x64-setup.exe` (~3.0 MB)
- **El Binario Portable Standalone** queda en:
  `src-tauri\target\release\Zainder.exe` (~11.2 MB)

### Script para centralizar los entregables:
Para dejar los ejecutables listos para el cliente o usuario final:
```powershell
# Crear carpeta de distribución
New-Item -ItemType Directory -Force -Path "dist-windows"

# Copiar Setup con nombre limpio
Copy-Item "src-tauri\target\release\bundle\nsis\Zainder_1.0.0_x64-setup.exe" -Destination "dist-windows\Zainder_Setup_v1.0.0.exe" -Force

# Copiar Portable a dist-windows y a la raíz del proyecto
Copy-Item "src-tauri\target\release\Zainder.exe" -Destination "dist-windows\Zainder_Portable_v1.0.0.exe" -Force
Copy-Item "src-tauri\target\release\Zainder.exe" -Destination "Zainder_Portable.exe" -Force
```

---

## 4. 📋 CHECKLIST RÁPIDO PARA FUTUROS PROYECTOS

Antes de compilar cualquier app basada en esta plantilla, verificar:
- [ ] ¿`src-tauri/src/lib.rs` tiene algún script automático en `run()`? **NO debe tenerlo**.
- [ ] ¿`src-tauri/windows/hooks.nsh` incluye `taskkill` en PreInstall y PreUninstall? **SÍ**.
- [ ] ¿`hooks.nsh` tiene el `MessageBox MB_YESNO` para el acceso directo? **SÍ**.
- [ ] ¿`tauri.conf.json` tiene `"installMode": "both"` y `"installerHooks": "windows/hooks.nsh"`? **SÍ**.
- [ ] ¿El frontend compila con `npm run build` sin errores en `build/`? **SÍ**.
- [ ] ¿Se copió `Zainder.exe` como `*_Portable.exe` en la raíz o en `dist-windows`? **SÍ**.

---

## 5. ⚠️ REGLA DE ORO: INSTANCIA ÚNICA Y `npm run tauri dev`

Si ejecutas el ejecutable compilado (`Zainder_Portable.exe` o el acceso directo del Setup) mientras tienes abierto `npm run tauri dev` en la terminal:
- El plugin de **instancia única** detectará que ya hay un proceso con el mismo identificador corriendo.
- Por diseño, el ejecutable nuevo **se cerrará inmediatamente tras enfocar la ventana existente**.
- **Solución al probar ejecutables compilados**: Detén cualquier proceso de desarrollo (`Ctrl+C` en la terminal) o cierra cualquier instancia previa antes de probar el Portable o Setup.

---

## 6. 🛠️ NUEVAS FUNCIONALIDADES PROFESIONALES DISPONIBLES

### A. Notificaciones Nativas de Windows en Segundo Plano
- Usa `nativeApi.sendNativeNotification("Título", "Mensaje")` desde cualquier parte del frontend React.
- Muestra avisos tipo Toast en la esquina inferior de Windows con sonido, ideal para avisar cuando finaliza una exportación o proceso pesado en segundo plano.

### B. Registro de Logs en Disco (`%APPDATA%`)
- Los eventos de nivel `WARN` y `ERROR` registrados en la consola `LogDrawer` se persisten automáticamente en:
  `%APPDATA%\com.garba.Zainder\logs\YYYY-MM-DD.log`
- En el visor de logs (`LogDrawer`) se incluye el botón 📂 **"Abrir carpeta de logs"** que abre directamente la carpeta en el Explorador de Windows.

### C. Script para Duplicar y Renombrar la Plantilla en 2 Segundos
Para iniciar un nuevo proyecto basado en esta plantilla:
```powershell
npm run rename -- "MiNuevaApp" "com.miempresa.minuevaapp"
```
Este comando actualiza automáticamente:
1. `package.json` (nombre del paquete)
2. `src-tauri/tauri.conf.json` (nombre de ventana, título, identifier y nombre de producto)
3. `src-tauri/Cargo.toml` (nombre del crate y binario)
4. `src-tauri/src/lib.rs` (ruta de persistencia en AppData)
5. `src-tauri/windows/hooks.nsh` (procesos a matar y accesos directos del instalador NSIS)

