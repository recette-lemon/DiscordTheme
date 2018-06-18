(function(){
	global.require = require;
	let _fs = require('fs');
	eval(_fs.readFileSync('{{FILE}}', 'utf-8'));
})();