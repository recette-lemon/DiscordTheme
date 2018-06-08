window._fs = require("fs");
window._path = require("path");
window._fileWatcher = {};
window._styleTag = {};

//Variables
window._DISCORD_THEME = {
	root: "{{PATH}}"
};

// Inject CSS
window.applyCSS = function(file, path, name) {
	let customCSS = window._fs.readFileSync(file, "utf-8");
	if (!window._styleTag[path].hasOwnProperty(name)) {
		window._styleTag[path][name] = document.createElement("style");
		document.head.appendChild(window._styleTag[path][name]);
	}
	window._styleTag[path][name].innerHTML = customCSS;
}
window.clearCSS = function(path, name) {
	if (window._styleTag[path].hasOwnProperty(name)) {
		window._styleTag[path][name].innerHTML = "";
		window._styleTag[path][name].parentElement.removeChild(window._styleTag[path][name]);
		delete window._styleTag[path][name];
	}
}
window.watchCSS = function(path) {
	let _path = path;
	let files, dirname;
	if (window._fs.lstatSync(path).isDirectory()) {
		files = window._fs.readdirSync(path);
		dirname = path;
	} else {
		files = [window._path.basename(path)];
		dirname = window._path.dirname(path);
	}
	window._styleTag[path] = {};
	for (let i = 0; i < files.length; i++) {
		let file = files[i];
		if (file.endsWith(".css")) {
			window.applyCSS(window._path.join(dirname, file), path, file)
		}
	}
	if(window._fileWatcher[path] === undefined) {
	window._fileWatcher[path] = window._fs.watch(path, { encoding: "utf-8" },
		function(eventType, filename) {
			if (!filename.endsWith(".css")) return;
			path = window._path.join(dirname, filename);
			if (eventType === "rename" && !window._fs.existsSync(path)) {
				window.clearCSS(_path, filename);
			} else {
				window.applyCSS(window._path.join(dirname, filename), _path, filename);
			}
		});
	}
};
window.tearDownCSS = function(path) {
	for (let key in window._styleTag[path]) {
		if (window._styleTag[path].hasOwnProperty(key)) {
			window.clearCSS(path, key);
		}
	}
	if(window._fileWatcher[path] !== undefined) { 
		window._fileWatcher[path].close(); window._fileWatcher[path] = undefined; 
	}
};
window.applyAndWatchCSS = function(path) {
	window.tearDownCSS(path);
	window.watchCSS(path);
};
window.applyAndWatchCSS('{{CSS}}');
//Inject JS
(function(){
	let js_path = "{{JS}}";
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
