/* Electron */
let _electron = require("electron");
let _dialog = _electron.remote.dialog;
let _request = require("request");
let _http = require("http");
let _fs = require("fs");

/* Discord API */
let discord = new Discord();
function Discord(){
	let _this = this;
	this.headers = {};
	
	/* Utils */
	this.getUserFromChannel = function(channel, user_id){
		return new Promise(function(succ, err){
			_this.getChannel(channel).then(function(channel){
				if(channel.guild_id){
					_this.getUserFromGuild(channel.guild_id, user_id).then(function(guild_member){
						succ(guild_member);
					});
				} else {
					err();
				}
			});
		});
	}
	this.getUserIcon = function(user_id, avatar, size){
		let ext = "jpg";
		if(size){
			size = "?size="+size;
			ext = "png";
		} else {
			size = "";
		}
		return "https://cdn.discordapp.com/avatars/"+user_id+"/"+avatar+"."+ext+size;
	}
		
	/* Users */
	this.getMe = function(){
		return this.get("/users/@me");
	}
	
	/* Guilds */
	this.getUserFromGuild = function(guild, user){
		return this.get("/guilds/"+guild+"/members/"+user);
	}
	
	/* Channels */
	this.getChannel = function(channel){
		return this.get("/channels/"+channel);
	}
	
	/* Messages */
	this.sendMessage = function(channel, data){
		let content_type;
		if(!(data instanceof FormData)){
			content_type  = "application/json";
			data = JSON.stringify(data);
		}
		return this.post("/channels/"+channel+"/messages", data, content_type);
	}
	this.editMessage = function(channel, message, data){
		let content_type;
		if(!(data instanceof FormData)){
			content_type  = "application/json";
			data = JSON.stringify(data);
		}
		return this.patch("/channels/"+channel+"/messages/"+message, data, content_type);
	}
	this.deleteMessage = function(channel, message){
		return this.delete("/channels/"+channel+"/messages/"+message);
	}
	this.getMessages = function(channel){
		return this.get("/channels/"+channel+"/messages");
	}
	this.react = function(channel, message, reaction){
		return this.put("/channels/"+channel+"/messages/"+message+"/reactions/"+reaction+"/@me");
	}
	
	this.get = function(endpoint, data, content_type){
		return this.call("GET", endpoint, data, content_type);
	}
	this.post = function(endpoint, data, content_type){
		return this.call("POST", endpoint, data, content_type);
	}
	this.patch = function(endpoint, data, content_type){
		return this.call("PATCH", endpoint, data, content_type);
	}
	this.delete = function(endpoint, data, content_type){
		return this.call("DELETE", endpoint, data, content_type);
	}
	this.put = function(endpoint, data, content_type){
		return this.call("PUT", endpoint, data, content_type);
	}
	this.call = function(method, endpoint, data, content_type){
		return new Promise(function(succ){
			(function inner(){
				let xhr = new XMLHttpRequest();
				xhr.open(method, "/api/v6"+endpoint);
				if(content_type) xhr.setRequestHeader("Content-Type", content_type);
				for(let h in _this.headers)
					xhr.setRequestHeader(h, _this.headers[h]);
				xhr.onreadystatechange = function(){
					if(xhr.readyState==4){
						if(xhr.status==200 || xhr.status==204)
							succ(xhr.responseText?JSON.parse(xhr.responseText):"");
						else if(xhr.status==429){
							let retry_after = JSON.parse(xhr.responseText).retry_after;
							setTimeout(function(){
								inner();
							}, retry_after);
						}
					}
				}
				xhr.send(data);
			})();
		});
	}
}
Discord.Embed = function(){
	this.author={};
	this.thumbnail={};
	this.fields=[];
	this.image={};
	this.footer={};
	
	this.setColor = function(hex){
		hex = hex.substring(1);
		if(hex.length==3) hex = hex.replace(/(.)/g, "$1$1");
		this.color = parseInt(hex, 16);
	}
	this.setColor("#ffffff");
	
	this.setAuthorIcon = function(url){
		this.author.icon_url = url;
	};
	this.setAuthorName = function(name){
		this.author.name = name;
	};
	
	this.addField = function(name, value, inline){
		inline = !!inline;
		this.fields.push({name, value, inline});
	};
	
	this.setImage = function(url){
		this.image.url=url;
	}
	
	this.setFooterText = function(text){
		this.footer.text = text;
	};
}
Discord.Emoji = new (function(){
	this.arrow_forward = emoji("▶");
	this.arrow_backward = emoji("◀");
	
	function emoji(emoji){
		return encodeURIComponent(emoji);
	}
})();

/* Command Utils */
Discord.UserAgent = "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) discord/0.0.300 Chrome/56.0.2924.87 Discord/1.6.15 Safari/537.36";
Discord.events = {};
Discord.Console = new (function(){
	let _this = this;
	this.onCommand = function(){};
	let appMount = document.getElementById("app-mount");
	let commandWrapper;
	let commandArrow;
	let commandInput;
	
	this.init = function(){
		commandWrapper = document.createElement("div");
		commandWrapper.id = "command-line";
		commandWrapper.className = "hidden";
		appMount.appendChild(commandWrapper);
		
		commandArrow = document.createElement("span");
		commandArrow.textContent = ">";
		commandWrapper.appendChild(commandArrow);
		
		commandInput = document.createElement("input");
		commandWrapper.appendChild(commandInput);
		
		_this.show = function(text){
			commandWrapper.classList.remove("hidden");
			if(text) commandInput.value = text;
			commandInput.focus();
		}
		
		_this.hide = function(){
			commandWrapper.classList.add("hidden");
		}
		
		window.addEventListener("keydown", function(e) {
			if(e.key == "F12") { 
				_this.show();
			} else if(e.key == "Escape") {
				_this.hide();
			}
		}, true);
		
		commandInput.addEventListener("keypress", function(e) {
			if(e.key == "Enter") { 
				_this.onCommand(this.value);
				this.value = "";
			}
		});
	}
	
});
Discord.File = function(filename){
	let _this = this;
	this.root = _DISCORD_THEME.root;
	this.filename = filename.indexOf(":")<0 ? this.root+filename : filename;
	this.basename = this.filename.split("\\");
	this.basename = this.basename[this.basename.length-1];
	this.isDir = false;
	if(_fs.lstatSync(this.filename).isDirectory()){
		this.isDir = true;
	}
	
	this.read = function(){
		if(!_this.isDir){
			return new Promise(function(succ, error){
				_fs.readFile(_this.filename, function read(err, data) {
					if (err) {error(); return;}
					let blob = new Blob([data]);
					let file = new File([blob], _this.basename);
					succ(file);
				});
			});
		}
	}
	
	this.list = function(filter){
		if(_this.isDir){
			let files = [];
			_fs.readdirSync(_this.filename).forEach(file => {
				if(filter){
					var regex = new RegExp(filter, "i");
					if(file.match(regex))
						files.push(new Discord.File(_this.filename+"\\"+file));
				}else{
					files.push(new Discord.File(_this.filename+"\\"+file));
				}
			});
			return files;
		}
	}
	
}
Discord.Request = function(){
	let _this = this;
	let headers = {};
	let method, uri;
	
	this.setHeader = function(header, value){
		headers[header] = value;
	}
	this.setHeader("User-Agent", Discord.UserAgent);
	
	this.open = function(_method, _uri){
		method=_method;
		uri=_uri;
	}
	
	this.send = function(body){
		return new Promise(function(succ, error){
			_request({
				encoding: _this.encoding,
				headers,
				uri,
				body,
				method
			}, function(err, res, body){
				if(res && res.statusCode!=200){
					error(err, res);
				}else{
					if(err)	error(err, res);
					else 	succ(body, res);
				}
			});
		});
	}
	
	this.getFile = function(url){
		return new Promise(function(succ, error){
			let name = url.split("/").pop().split(/(\?|\#)/)[0];
			_this.open("GET", url);
			_this.encoding = null;
			_this.send().then(function(data){
				let blob = new Blob([data]);
				let file = new File([blob], name);
				succ(file);
			}).catch(error);
		});
	}
	
	this.downloadFile = function(url){
		let name = url.split("/").pop().split(/(\?|\#)/)[0];
		let dir = _DISCORD_THEME.root+".tmp/";
		let tmp = dir+(new Date().getTime())+"_"+name;
		if(!_fs.existsSync(dir)) _fs.mkdirSync(dir);
		let extension = name.split(".").pop();
		_this.open("GET", url);
		let stream = _request({
			encoding: _this.encoding,
			headers,
			uri,
			method
		}, function(error, response, body){
			extension = response.headers["content-type"].split("/").pop();
		}).pipe(_fs.createWriteStream(tmp));
		stream.on('finish', function(){
			let location = _dialog.showSaveDialog({defaultPath:name});
			if(location){
				let location_extension = location.split(".");
				if(location_extension.length==1 && extension){
					location = location+"."+extension;
				}
				_fs.rename(tmp, location, function(err){
					if(err && err.code === 'EXDEV'){
						let readStream = _fs.createReadStream(tmp);
						let writeStream = _fs.createWriteStream(location);
						readStream.on('close', function () {
							_fs.unlink(tmp, function(){});
						});
						readStream.pipe(writeStream);
					}
				});
			}else{
				_fs.unlink(tmp, function(){});
			}
		});
	}
}
Discord.RequestQueue = function(){
	let requests = [];
	
	this.add = function(fn){
		requests.push(fn);
	}
	
	this.run = function(){
		run();
	}
	
	function run(){
		let request = requests.shift();
		if(request)
			request(function(){
				setTimeout(run, 1);
			});
	}
}
Discord.ReactionMessages = new (function(){
	messages = {};
	
	this.add = function(id, obj){
		messages[id] = obj;
	}
	this.get = function(id){
		return messages[id];
	}
	this.remove = function(id){
		delete messages[id];
	}
})();
Discord.Search = function(type){
	let _this = this;
	let channel, message, search;
	let elements, index=0;
	let types = {
		gi:{
			name:"Google Images",
			icon:"https://i.imgur.com/JHeQgVA.png",
			color:"#4885ed",
			init: function(search){
				return new Promise(function(succ){
					getDocument("https://www.google.pt/search?espv=2&biw=1366&bih=667&site=webhp&source=lnms&tbm=isch&sa=X&ei=XosDVaCXD8TasATItgE&ved=0CAcQ_AUoAg&q="+search).then(function(doc){
						elements = doc.querySelectorAll("a + div[jsname]");
						succ();
					});
				});
			},
			get: function(index){
				return new Promise(function(succ){
					succ(elements[index].innerHTML.match("\"ou\":\"(.+?)\"")[1]);
				});
			}
		},
		sankaku:{
			name:"Sankaku",
			icon:"https://www.sankakucomplex.com/wp-content/uploads/2017/12/favicon.png",
			color:"#ff761c",
			init: function(search){
				return new Promise(function(succ){
					search = search.trim().replace(/\s+/, "+");
					getDocument("https://chan.sankakucomplex.com?tags="+search).then(function(doc){
						let first = doc.querySelector("#popular-preview");
						if(first!=null)
							first.parentNode.removeChild(first);
						elements = doc.querySelectorAll(".thumb");
						succ();
					});
				});
			},
			get: function(index){
				return new Promise(function(succ){
					getDocument("https://chan.sankakucomplex.com/post/show/"+elements[index].id.substring(1)).then(function(doc){
						let i = doc.querySelector("#non-image-content");
						let newurl="";
						if(i==null){
							let link = doc.querySelector("#image-link");
							if(link!=null)
								newurl = link.getAttribute("href");
							if(newurl == null)
								newurl = doc.querySelector("#image").getAttribute("src");
						}else{
							newurl = i.querySelector("embed").getAttribute("src");
						}
						succ("https:"+newurl);
					});
				});
			}
		}
	};
	
	this.list = function(){
		let list = [];
		for(let i in types){
			list.push(i);
		}
		return list;
	}
	
	this.search = function(_search, _channel){
		search = _search;
		channel = _channel;
		return new Promise(function(succ){
			type = types[type]?types[type]:types["gi"];
			type.init(search).then(function(){
				getEmbed(index).then(function(embed){
					discord.sendMessage(channel, {content:"", embed}).then(function(_message){
						Discord.ReactionMessages.add(message = _message.id, _this);
						let rq = new Discord.RequestQueue();
						rq.add(function(callback){
							discord.react(channel, _message.id, Discord.Emoji.arrow_backward).then(callback);
						});
						rq.add(function(callback){
							discord.react(channel, _message.id, Discord.Emoji.arrow_forward).then(callback);
						});
						rq.run();
					});
				});
			});
		});
	}
	
	this.react = function(reaction){
		let ret = false;
		let i = index;
		if(reaction == Discord.Emoji.arrow_backward){
			if(index>0)index--;
			ret = true;
		}else if(reaction == Discord.Emoji.arrow_forward){
			if(index<elements.length-1)index++;
			ret = true;
		}
		if(index!=i){
			getEmbed(index).then(function(embed){
				discord.editMessage(channel, message, {content:"", embed});
			});
			return true;
		}
		return ret;
	}
	
	function getEmbed(index){
		return new Promise(function(succ){
			type.get(index).then(function(url){
				let embed = new Discord.Embed();
				embed.setAuthorIcon(type.icon);
				embed.setAuthorName(type.name);
				embed.setColor(type.color);
				embed.addField("Search:", search);
				embed.setImage(url);
				embed.setFooterText((index+1)+"/"+elements.length);
				succ(embed);
			});
		});
	}
	function getDocument(url){
		return new Promise(function(succ){
			let request = new Discord.Request();
			request.open("GET", url);
			request.setHeader("User-Agent", Discord.UserAgent);
			request.send().then(function(data){
				let doc = new DOMParser().parseFromString(data, "text/html");
				succ(doc);
			});
		});
	}
}
Discord.Nonces = new (function(){
	let nonces = {};
	
	this.add = function(nonce){
		nonces[nonce] = true;
	}
	this.has = function(nonce){
		return nonces[nonce];
	}
})
Discord.Messages = new (function(){
	messages = {};
	
	this.add = function(id){
		messages[id] = true;
	}
	this.has = function(id){
		return !!messages[id];
	}
})();
Discord.Date = new (function(){
	let EPOCH = 1420070400000;
	
	this.fromId = function(id){
		let binary = (+id).toString(2);
		binary = Array(64).join("0")+binary;
		binary = binary.substring(binary.length-64);
		let timestamp = parseInt(binary.substring(0, 42), 2) + EPOCH;
		return new Date(timestamp);
	}
	
	this.difference = function(d1, d2){
		let diff = new Date(d1.getTime() - d2.getTime());
		let years = diff.getUTCFullYear() - 1970;
		let months = diff.getUTCMonth();
		let days = diff.getUTCDate() - 1;
		let text = "";
		if(years) text+=years+" years ";
		if(months) text+=months+" months ";
		if(days || (!years && !months))text+=days+" days";
		return text.trim();
	}
});

/* Other Utils */
Discord.Cookies = new (function(){
	this.set = function(name,value,days) {
		var expires = "";
		if (days) {
			var date = new Date();
			date.setTime(date.getTime() + (days*24*60*60*1000));
			expires = "; expires=" + date.toUTCString();
		}
		document.cookie = name + "=" + (value || "")  + expires + "; path=/";
	}
	this.get = function(name) {
		var nameEQ = name + "=";
		var ca = document.cookie.split(';');
		for(var i=0;i < ca.length;i++) {
			var c = ca[i];
			while (c.charAt(0)==' ') c = c.substring(1,c.length);
			if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
		}
		return null;
	}
	this.erase = function(name) {   
		document.cookie = name+'=; Max-Age=-99999999;';  
	}
})();

/* Events */
Discord.on = function(event, callback){
	if(!Discord.events[event]) Discord.events[event] = [];
	Discord.events[event].push(callback);
}
Discord.emit = function(event, data){
	if(!Discord.events[event]) return;
	for(let i=0;i<Discord.events[event].length;i++){
		Discord.events[event][i](data);
	}
}
