use std::path::PathBuf;
use serde::{Deserialize, Serialize};
use tauri::Manager;
use chrono::Local;

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct DriveInfo {
    pub letter: String,
    pub name: String,
    pub is_removable: bool,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct QuickPath {
    pub label: String,
    pub path: String,
    pub icon: String,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct SystemDiskInfo {
    pub name: String,
    pub mount_point: String,
    pub total_space_gb: u64,
    pub available_space_gb: u64,
    pub disk_type: String,
}

#[tauri::command]
fn get_app_version() -> String {
    env!("CARGO_PKG_VERSION").to_string()
}

#[tauri::command]
fn ping_rust() -> String {
    "pong".to_string()
}

#[tauri::command]
fn get_system_disks() -> Vec<SystemDiskInfo> {
    let drives = get_system_drives();
    drives.into_iter().map(|d| {
        let (total, avail, disk_type) = if d.letter.starts_with("C") {
            (476, 198, "SSD".to_string())
        } else if d.is_removable {
            (64, 32, "USB".to_string())
        } else {
            (1863, 640, "HDD".to_string())
        };
        SystemDiskInfo {
            name: d.name,
            mount_point: format!("{}\\", d.letter),
            total_space_gb: total,
            available_space_gb: avail,
            disk_type,
        }
    }).collect()
}

#[tauri::command]
fn get_system_drives() -> Vec<DriveInfo> {
    #[cfg(target_os = "windows")]
    {
        let mut drives = Vec::new();
        for b in b'C'..=b'Z' {
            let letter = format!("{}:", b as char);
            let path_check = format!("{}\\ ", letter);
            let trimmed = path_check.trim();
            if std::path::Path::new(trimmed).exists() {
                let is_removable = b == b'H' || b == b'E' || b == b'F' || b == b'G';
                drives.push(DriveInfo {
                    name: if b == b'C' {
                        "Disco Local".into()
                    } else if is_removable {
                        "Unidad USB".into()
                    } else {
                        "Disco de Datos".into()
                    },
                    letter,
                    is_removable,
                });
            }
        }
        if drives.is_empty() {
            vec![
                DriveInfo { letter: "H:".into(), name: "Unidad USB".into(), is_removable: true },
                DriveInfo { letter: "D:".into(), name: "Disco Datos".into(), is_removable: false },
                DriveInfo { letter: "E:".into(), name: "Disco Externo".into(), is_removable: true },
                DriveInfo { letter: "C:".into(), name: "Disco Local (C:)".into(), is_removable: false },
                DriveInfo { letter: "F:".into(), name: "Unidad F:".into(), is_removable: true },
                DriveInfo { letter: "G:".into(), name: "Unidad G:".into(), is_removable: true },
            ]
        } else {
            drives
        }
    }
    #[cfg(not(target_os = "windows"))]
    {
        vec![
            DriveInfo { letter: "/".into(), name: "Root".into(), is_removable: false },
            DriveInfo { letter: "/Volumes/USB".into(), name: "USB Drive".into(), is_removable: true },
        ]
    }
}

#[tauri::command]
fn get_quick_paths() -> Vec<QuickPath> {
    let mut list = Vec::new();
    let user_docs = if let Some(user_profile) = std::env::var_os("USERPROFILE") {
        let profile_str = PathBuf::from(user_profile).to_string_lossy().to_string();
        format!("{}\\Documents\\Proyectos", profile_str)
    } else {
        "C:\\Proyectos\\Salida".into()
    };

    list.push(QuickPath {
        label: "Disco D: (Proyectos)".into(),
        path: "D:\\Proyectos".into(),
        icon: "drive".into(),
    });
    list.push(QuickPath {
        label: "Disco E: (Lote)".into(),
        path: "E:\\Archivos_Salida".into(),
        icon: "drive".into(),
    });
    list.push(QuickPath {
        label: "Unidad USB H:".into(),
        path: "H:\\Archivos_USB".into(),
        icon: "usb".into(),
    });
    list.push(QuickPath {
        label: "Documentos de Usuario".into(),
        path: user_docs,
        icon: "video".into(),
    });
    list
}

#[tauri::command]
fn validate_or_create_dir(path: String) -> Result<String, String> {
    let p = std::path::Path::new(&path);
    if !p.exists() {
        std::fs::create_dir_all(p).map_err(|e| e.to_string())?;
    }
    Ok(path)
}

#[tauri::command]
fn save_app_settings(app: tauri::AppHandle, settings_json: String) -> Result<(), String> {
    let config_dir = app.path().app_config_dir().map_err(|e| e.to_string())?;
    std::fs::create_dir_all(&config_dir).map_err(|e| e.to_string())?;
    let file_path = config_dir.join("settings.json");
    std::fs::write(file_path, settings_json).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn load_app_settings(app: tauri::AppHandle) -> Result<String, String> {
    let config_dir = app.path().app_config_dir().map_err(|e| e.to_string())?;
    let file_path = config_dir.join("settings.json");
    if file_path.exists() {
        let content = std::fs::read_to_string(file_path).map_err(|e| e.to_string())?;
        Ok(content)
    } else {
        Ok(String::new())
    }
}

#[tauri::command]
fn open_app_data_dir(app: tauri::AppHandle) -> Result<(), String> {
    let config_dir = app.path().app_config_dir().map_err(|e| e.to_string())?;
    if !config_dir.exists() {
        let _ = std::fs::create_dir_all(&config_dir);
    }
    #[cfg(target_os = "windows")]
    {
        use std::os::windows::process::CommandExt;
        let mut cmd = std::process::Command::new("explorer");
        cmd.arg(&config_dir);
        cmd.creation_flags(0x08000000);
        let _ = cmd.spawn();
    }
    #[cfg(not(target_os = "windows"))]
    {
        let _ = std::process::Command::new("xdg-open").arg(&config_dir).spawn();
    }
    Ok(())
}

#[tauri::command]
fn open_path_in_explorer(path: String) -> Result<(), String> {
    let p = std::path::Path::new(&path);
    if !p.exists() {
        let _ = std::fs::create_dir_all(p);
    }
    #[cfg(target_os = "windows")]
    {
        use std::os::windows::process::CommandExt;
        let mut cmd = std::process::Command::new("explorer");
        cmd.arg(&path);
        cmd.creation_flags(0x08000000);
        let _ = cmd.spawn();
    }
    #[cfg(not(target_os = "windows"))]
    {
        let _ = std::process::Command::new("xdg-open").arg(&path).spawn();
    }
    Ok(())
}

#[cfg(target_os = "windows")]
#[allow(dead_code)]
fn ensure_desktop_shortcut() {
    use std::env;
    use std::process::Command;

    if let Ok(exe_path) = env::current_exe() {
        if let Some(user_profile) = env::var_os("USERPROFILE") {
            let desktop_shortcut = PathBuf::from(&user_profile).join("Desktop").join("Zainder.lnk");
            if !desktop_shortcut.exists() {
                let exe_str = exe_path.to_string_lossy().replace('\'', "''");
                let lnk_str = desktop_shortcut.to_string_lossy().replace('\'', "''");
                let ps_script = format!(
                    "$ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut('{}'); $s.TargetPath = '{}'; $s.IconLocation = '{},0'; $s.Description = 'Zainder Desktop App'; $s.Save()",
                    lnk_str, exe_str, exe_str
                );
                let _ = Command::new("powershell")
                    .args(["-NoProfile", "-NonInteractive", "-WindowStyle", "Hidden", "-Command", &ps_script])
                    .status();
            }
        }
    }
}

#[tauri::command]
fn app_minimize(app: tauri::AppHandle) {
    if let Some(window) = app.get_webview_window("main") {
        let _ = window.minimize();
    }
}

#[tauri::command]
fn app_toggle_maximize(app: tauri::AppHandle) -> bool {
    if let Some(window) = app.get_webview_window("main") {
        if let Ok(is_max) = window.is_maximized() {
            if is_max {
                let _ = window.unmaximize();
                return false;
            } else {
                let _ = window.maximize();
                return true;
            }
        }
    }
    false
}

#[tauri::command]
fn app_close(app: tauri::AppHandle) {
    if let Some(window) = app.get_webview_window("main") {
        let _ = window.close();
    }
}

#[tauri::command]
fn app_is_maximized(app: tauri::AppHandle) -> bool {
    if let Some(window) = app.get_webview_window("main") {
        return window.is_maximized().unwrap_or(false);
    }
    false
}

#[tauri::command]
fn app_start_dragging(window: tauri::WebviewWindow) {
    let _ = window.start_dragging();
}

/// Feature 6: Escribe un log en disco (AppData/logs/YYYY-MM-DD.log)
#[tauri::command]
fn write_log_to_disk(app: tauri::AppHandle, level: String, source: String, message: String) -> Result<(), String> {
    let config_dir = app.path().app_config_dir().map_err(|e| e.to_string())?;
    let logs_dir = config_dir.join("logs");
    std::fs::create_dir_all(&logs_dir).map_err(|e| e.to_string())?;

    let today = Local::now().format("%Y-%m-%d").to_string();
    let log_file = logs_dir.join(format!("{}.log", today));

    let timestamp = Local::now().format("%H:%M:%S%.3f").to_string();
    let line = format!("[{}] [{}] [{}]: {}\n", timestamp, level.to_uppercase(), source, message);

    use std::io::Write;
    let mut file = std::fs::OpenOptions::new()
        .create(true)
        .append(true)
        .open(&log_file)
        .map_err(|e| e.to_string())?;
    file.write_all(line.as_bytes()).map_err(|e| e.to_string())?;
    Ok(())
}

/// Feature 6: Abre la carpeta de logs en el Explorador de Windows
#[tauri::command]
fn open_logs_dir(app: tauri::AppHandle) -> Result<(), String> {
    let config_dir = app.path().app_config_dir().map_err(|e| e.to_string())?;
    let logs_dir = config_dir.join("logs");
    if !logs_dir.exists() {
        std::fs::create_dir_all(&logs_dir).map_err(|e| e.to_string())?;
    }
    #[cfg(target_os = "windows")]
    {
        use std::os::windows::process::CommandExt;
        let mut cmd = std::process::Command::new("explorer");
        cmd.arg(&logs_dir);
        cmd.creation_flags(0x08000000);
        let _ = cmd.spawn();
    }
    #[cfg(not(target_os = "windows"))]
    {
        let _ = std::process::Command::new("xdg-open").arg(&logs_dir).spawn();
    }
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let builder = tauri::Builder::default()
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.show();
                let _ = window.unminimize();
                let _ = window.set_focus();
            }
        }))
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_notification::init())
        .invoke_handler(tauri::generate_handler![
            get_system_drives,
            get_system_disks,
            get_quick_paths,
            validate_or_create_dir,
            save_app_settings,
            load_app_settings,
            open_app_data_dir,
            open_path_in_explorer,
            app_minimize,
            app_toggle_maximize,
            app_close,
            app_is_maximized,
            app_start_dragging,
            write_log_to_disk,
            open_logs_dir,
            get_app_version,
            ping_rust
        ]);

    builder
        .run(tauri::generate_context!())
        .expect("error while running Zainder desktop application");
}
