Discord.Gateway = new (function(){
	let listeners = {};
	
	this.on = this.addEventListener = function(name, fn){
		if(!listeners[name]) listeners[name] = [];
		listeners[name].push(fn);
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
Discord.Gateway.on("MESSAGE_CREATE", function(data){
	//console.log("MESSAGE CREATED", data);
});
Discord.Gateway.on("MESSAGE_DELETE", function(data){
	//console.log("MESSAGE DELETED", data);
	return false;
});