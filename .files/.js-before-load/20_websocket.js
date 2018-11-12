// proxy the window.WebSocket object
let ZLIB_SUFFIX = '0000ffff';
window.WebSocket = new Proxy(window.WebSocket, {
	construct: function(target, args) {
		if(args[0].indexOf("gateway.discord.gg")<0) return new target(...args);
		let Buffer = _buffer.Buffer;
		let inflate = _zlib.createInflate();
		let instance = new target(...args);
		let gateway = Discord.Gateway;
		let onmessage;
		instance = new Proxy(instance, {
			get: function(target, name){
				if(typeof target[name] === "function")
					return target[name].bind(target);
				return target[name];
			},
			set: function(target, name, value){
				if(name == "onmessage")
					return onmessage = value.bind(target);
				return target[name] = value;
			}
		});
				
		let openHandler = function(event){
			Discord.Gateway.setInstance(instance);
		};
		function toArrayBuffer(buf) {
			var ab = new ArrayBuffer(buf.length);
			var view = new Uint8Array(ab);
			for (var i = 0; i < buf.length; ++i) {
				view[i] = buf[i];
			}
			return ab;
		}
		let s;
		let first = true;
		let messageHandler =  function(event){
			if(onmessage) onmessage(event);
			let buffer = event.data;
			let end = buffer.slice(buffer.byteLength-4);
			if(buf2hex(end) == ZLIB_SUFFIX){
				let huge = new Buffer(0);
				buffer = Buffer.from(new Uint8Array(buffer));
				inflate.once("data", function(chunk){
					try{
						tryUnpack(chunk);
						huge = new Buffer(0);
					}catch(e){
						//IMPORTANT DO NOT REMOVE
						try{
							huge = Buffer.concat([huge, chunk]);
							tryUnpack(huge);
							huge = new Buffer(0);
						}catch(e){
							//IMPORTANT DO NOT REMOVE
						}
					}
					function tryUnpack(buffer){
						let data = _erlpack.unpack(buffer);
						let e = new (function(){
							this.data = data.d;
							
							this.prevent = function(){
								this.prevented = true;
							}.bind(this);
						})();
						gateway.emit(data.t, e);
					}
				});
				inflate.write(buffer);
			}
		}
		let closeHandler =  function(event){
			//console.log('Close', event);
			instance.removeEventListener('open', openHandler);
			instance.removeEventListener('message', messageHandler);
			instance.removeEventListener('close', closeHandler);
		};

		instance.addEventListener('open', openHandler);
		instance.addEventListener('message', messageHandler);
		instance.addEventListener('close', closeHandler);
		
		instance.send = new Proxy(instance.send, {
			apply: function(target, thisArg, args) {
				let ready = false;
				let own = args[1];
				if(own){
					try{
						args[0] = _erlpack.pack(args[0]).buffer;
					}catch(e){
						console.log(e);
					}
				}else{
					let buffer = args[0];
					try{
						let data = _erlpack.unpack(Buffer.from(new Uint8Array(buffer)));
						if(data.op == 2) ready = true;
					}catch(e){
						console.log(e);
					}
				}
				target.apply(thisArg, args);
				if(ready) Discord.Gateway.ready();
			}
		});
		
		function buf2hex(buffer) { // buffer is an ArrayBuffer
			return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
		}
		
		return instance;
	}
});