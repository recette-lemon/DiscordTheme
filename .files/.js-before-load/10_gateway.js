Discord.Gateway = new (function(){
	let _this = this;
	let instance, ready = false;
	let listeners = {};
	
	this.send = function(data){
		instance.send(data, true);
	}
	
	this.ready = function(){
		_this.emit("READY");
		ready = true;
	}
	
	this.setInstance = function(i){
		instance = i;
		ready = false;
	}
	
	this.on = this.addEventListener = function(name, fn){
		if(!listeners[name]) listeners[name] = [];
		listeners[name].push(fn);
		if(name=="READY" && ready) fn();
	};
	
	this.emit = function(name, data){
		let l = listeners[name];
		if(!l) return false;
		let prevent = false;
		l.forEach(function(x){
			let value = x(data);
			prevent = (value===false);
		});
		return prevent;
	};
});
Discord.Gateway.on("MESSAGE_CREATE", function(e){
	//console.log("MESSAGE CREATED", data);
});
Discord.Gateway.on("MESSAGE_DELETE", function(e){
	//console.log("MESSAGE DELETED", data);
	e.prevent();
});
