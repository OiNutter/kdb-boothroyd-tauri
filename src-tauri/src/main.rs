#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

use tauri::{
  Manager
};

fn main() {
  #[allow(unused_mut)]
  tauri::Builder::default()
    .setup(|app| {
      #[cfg(debug_assertions)]
      app.get_window("main").unwrap().open_devtools();
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
