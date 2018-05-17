window._fs = require("fs");
window._path = require("path");
window._fileWatcher = null;
window._styleTag = {};
// Inject CSS
window.applyCSS = function(path, name) {
	let customCSS = window._fs.readFileSync(path, "utf-8");
	if (!window._styleTag.hasOwnProperty(name)) {
		window._styleTag[name] = document.createElement("style");
		document.head.appendChild(window._styleTag[name]);
	}
	window._styleTag[name].innerHTML = customCSS;
}
window.clearCSS = function(name) {
	if (window._styleTag.hasOwnProperty(name)) {
		window._styleTag[name].innerHTML = "";
		window._styleTag[name].parentElement.removeChild(window._styleTag[name]);
		delete window._styleTag[name];
	}
}
window.watchCSS = function(path) {
	let files, dirname;
	if (window._fs.lstatSync(path).isDirectory()) {
		files = window._fs.readdirSync(path);
		dirname = path;
	} else {
		files = [window._path.basename(path)];
		dirname = window._path.dirname(path);
	}
	for (let i = 0; i < files.length; i++) {
		let file = files[i];
		if (file.endsWith(".css")) {
			window.applyCSS(window._path.join(dirname, file), file)
		}
	}
	if(window._fileWatcher === null) {
	window._fileWatcher = window._fs.watch(path, { encoding: "utf-8" },
		function(eventType, filename) {
			if (!filename.endsWith(".css")) return;
			path = window._path.join(dirname, filename);
			if (eventType === "rename" && !window._fs.existsSync(path)) {
				window.clearCSS(filename);
			} else {
				window.applyCSS(window._path.join(dirname, filename), filename);
			}
		});
	}
};
window.tearDownCSS = function() {
	for (let key in window._styleTag) {
		if (window._styleTag.hasOwnProperty(key)) {
			window.clearCSS(key)
		}
	}
	if(window._fileWatcher !== null) { window._fileWatcher.close(); window._fileWatcher = null; }
};
window.applyAndWatchCSS = function(path) {
	window.tearDownCSS();
	window.watchCSS(path);
};
window.applyAndWatchCSS('D:\\DiscordTheme\\custom_css');
//Inject JS
(function(){
	let js_path = "D:\\DiscordTheme\\custom_js";
	let files, dirname;
	if (window._fs.lstatSync(js_path).isDirectory()) {
		files = window._fs.readdirSync(js_path);
		dirname = js_path;
	} else {
		files = [window._path.basename(js_path)];
		dirname = window._path.dirname(js_path);
	}
	for (let i = 0; i < files.length; i++) {
		let file = files[i];
		if (file.endsWith(".js")) {
			let js = document.createElement("script");
			js.innerHTML = window._fs.readFileSync(window._path.join(dirname, file), "utf-8");
			document.head.appendChild(js);
		}
	}
})();
//Variables
window._DISCORD_THEME = {
	root: "D:\\DiscordTheme\\"
};
