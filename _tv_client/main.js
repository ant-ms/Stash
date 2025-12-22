import { app, BrowserWindow } from 'electron';

const createWindow = () => {
	const win = new BrowserWindow({
		width: 1200,
		height: 800,
		webPreferences: {
			webSecurity: false
		}
	});

	// win.loadURL('http://localhost:5173');
	win.loadURL('https://stash.hera.lan');
};

app.whenReady().then(() => {
	createWindow();
});
