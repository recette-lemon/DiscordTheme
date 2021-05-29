const electron = require("electron");
let context = electron.webFrame.top.context;

// Change context to let electron run preload script
context.global = context;

// Run original preload script
let originalPreload = process.env.DISCORD_PRELOAD;
const originalKill = process.kill;
process.kill = function() {};
require(originalPreload);
process.kill = originalKill;

// Inject theme
(function(){
	context.webFrame = electron.webFrame;
	context.require = require;
	context._erlpack = require('../discord_erlpack');
	let _fs = require('fs');
	let injection = _fs.readFileSync('{{FILE}}', 'utf-8');
	electron.webFrame.executeJavaScript(injection);
})();
