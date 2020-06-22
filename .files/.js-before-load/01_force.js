Object.defineProperty(window, "_zstdEnabled", {
	set: function(value){
		// Do nothing
	},
	get: function(){
		return false;
	}
});

(function(){
	let error = console.error;
	console.error = function(e){
		// Stops annoying "corrupt instalation" console error
		if(typeof e === 'string' && e === 'Potentially corrupt installation:')
			return;
		error.apply(this, arguments);
	}
})();
