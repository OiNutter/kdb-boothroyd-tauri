import React from "react";
import { render } from "react-dom";

import App from "./app";
import { initStorage } from "./storage/storage";
import { appDir } from "@tauri-apps/api/path";
// Get os specific data path from main process
/*ipcRenderer
  .invoke("data-path")
  .then((storagePath: string) => {
    if (storagePath == "") return alert("Couldn't get storage directory");

    // Initialise storage directory
    initStorage(storagePath);

    // Render React app
    render(<App />, document.getElementById("root"));
  })
  .catch((error: string) => {
    alert(error);
  });*/

appDir()
  .then(async (storagePath: string) => {
    if (storagePath == "") return alert("Couldn't get storage directory");

    console.log("STORAGE PATH", storagePath);

    // Initialise storage directory
    await initStorage(storagePath);

    // Render React app
    render(<App />, document.getElementById("root"));
  })
  .catch((error: string) => {
    alert(error);
  });
