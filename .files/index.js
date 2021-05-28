const _electron = require('electron');
const _path = require('path');

class BrowserWindow extends _electron.BrowserWindow {
	constructor(options) {
		if (!options || !options.webPreferences || !options.webPreferences.preload || !options.title)
			return super(options); // eslint-disable-line constructor-super
		process.env.DISCORD_PRELOAD = options.webPreferences.preload;
		options.webPreferences.preload = _path.join(__dirname, "preload.js");
		super(options);
	}
}
Object.assign(BrowserWindow, _electron.BrowserWindow);

// Create proxy
const newElectron = new Proxy(_electron, {
	get: function(target, prop) {
		if (prop === "BrowserWindow") return BrowserWindow;
		return target[prop];
	}
});

// Replace electron in require cache
delete require.cache[require.resolve('electron')].exports;
require.cache[require.resolve('electron')].exports = newElectron;

module.exports = require('./core.asar');