Discord.Gateway = new (function(){
	let _this = this;
	let instance, ready = false;
	let listeners = {};
	let lastPresence = "online";
	this.setInstance = function(i){
		instance = i;
		ready = false;
	}
	
	this.joinVoice = function(guild_id, channel_id, self_mute, self_deaf){
		self_mute = !!self_mute;
		self_deaf = !!self_deaf;
		this.send({
			op: 4,
			d: {guild_id, channel_id, self_mute, self_deaf}
		});
	}
	this.setPresence = function(presence){
		let o = {
			op:3,
			d: {
				status: lastPresence,
				afk:false,
				since: 0
			}
		};
		for(let p in presence){
			o.d[p] = presence[p];
		}
		this.send(o);
	}
	this.send = function(data){
		instance.send(data, true);
	}
	
	//Events
	this.ready = function(){
		ready = true;
		_this.emit("READY");
	}
	this.on = this.addEventListener = function(name, fn){
		if(!listeners[name]) listeners[name] = [];
		listeners[name].push(fn.bind(this));
		if(name=="READY" && ready) fn();
	};
	this.emit = function(name, data){
		let l = listeners[name];
		if(!l) return;
		l.forEach(function(x){
			x(data);
		});
	};
	
	this.on("USER_SETTINGS_UPDATE", e => {
		lastPresence = e.status;
	});
	
});

