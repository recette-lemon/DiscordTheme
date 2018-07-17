(function(){
	global.require = require;
	global._erlpack = require('../../../discord_erlpack')
	let _fs = require('fs');
	eval(_fs.readFileSync('{{FILE}}', 'utf-8'));
})();