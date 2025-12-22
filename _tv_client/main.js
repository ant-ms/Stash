import { app, BrowserWindow } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const createWindow = () => {
	const win = new BrowserWindow({
		width: 1200,
		height: 800,
		webPreferences: {
			webSecurity: false
		}
	});

	if (app.isPackaged) {
		win.loadFile(path.join(__dirname, 'build/index.html'));
	} else {
		win.loadURL('http://localhost:5173');
	}
};

app.whenReady().then(() => {
	createWindow();
});
