// proxy the window.WebSocket object
/*
window.WebSocket = new Proxy(window.WebSocket, {  
	construct: function(target, args) {
		let instance = new target(...args);

		let openHandler = function(event){
			console.log('Open', event);
		};
		let messageHandler =  function(event){
			//console.log('Message', event);
		};
		let closeHandler =  function(event){
			console.log('Close', event);
			instance.removeEventListener('open', openHandler);
			instance.removeEventListener('message', messageHandler);
			instance.removeEventListener('close', closeHandler);
		};

		instance.addEventListener('open', openHandler);
		instance.addEventListener('message', messageHandler);
		instance.addEventListener('close', closeHandler);

		function buf2hex(buffer) { // buffer is an ArrayBuffer
			return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
		}

		instance.send = new Proxy(instance.send, {
			apply: function(target, thisArg, args) {
				console.log('Send', args, buf2hex(args[0]));
				target.apply(thisArg, args);
			}
		});
		return instance;
	}
});
*/