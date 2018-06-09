/* START OF PAYLOAD */
mainWindow.webContents.on('dom-ready', function () {
	let _fs = require('fs');
	mainWindow.webContents.executeJavaScript(_fs.readFileSync('{{FILE}}', 'utf-8'));
});
/* END OF PAYLOAD */