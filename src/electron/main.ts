import { app, BrowserWindow } from "electron";
import path from "path";
import { isDev } from "./util.js";

app.on("ready", () => {
  const mainWindow = new BrowserWindow({});
  if (isDev()) {
    mainWindow.loadURL("http://localhost:5123"); // Load the Vite dev server URL in development mode
  } else {
    mainWindow.loadFile(path.join(app.getAppPath(), "/dist-react/index.html")); // Load the built React app in production mode
  }
});
