let _request = require("request");
let _mime = require("mime-types");
let discord = new Discord();
discord.desu = false;

function reverseEach(obj, fn){
	let keys = [];
	for (let key in obj) {keys.unshift(key);}
	for (let i=0;i<keys.length;i++) {
		if(fn(keys[i], obj[keys[i]]) === false) return;
	}
}
function checkMessageForOutput(child){
	if(child.getReactInstance){
		let react = child.getReactInstance();
		if(react){
			try{
				if(Discord.Nonces.has(react["return"].key)){
					child.style.display = "none";
					return true;
				}
			}catch(e){};
		}
	}
}

/* Window Events */
window.addEventListener("load", function(){
	let wordmark = document.querySelector('[class*="wordmark-"]');
	let parent = document.querySelector('[class*="app-"]');
	let menu = document.createElement("div");
	menu.id="theme-menu";
	parent.appendChild(menu);
	let game = document.createElement("div");
	menu.appendChild(game);
	let games = new Games(game);
	wordmark.addEventListener("click", function(){
		if(menu.classList.contains("visible")){
			if(games.back())return;
			menu.classList.remove("visible");
		}else{
			menu.classList.add("visible");
		}
	});
	
	let con = new Discord.Console();
	con.onCommand = function(command){
		let channel = document.querySelector(".guild.selected").querySelector("a").href.split("/");
		channel = channel[channel.length-1];
		if(command[0]!="/") command = "/"+command;
		parseCommand(command, channel);
	}
});
window.addEventListener("click", function(e){
	let t = e.target;
	if(t.parentNode.className=="reaction reaction-me") t = t.parentNode;
	if(t.className=="reaction reaction-me"){
		let message_id = t.closest(".message").getReactInstance()["return"].key;
		let message = Discord.ReactionMessages.get(message_id);
		if(message){
			let emoji = encodeURIComponent(t.children[0].alt);
			message.react(emoji);
			e.stopImmediatePropagation();
		}
	}
}, true);
window.addEventListener("DOMNodeInserted", function (e) {
	let target = e.target;
	if(target instanceof HTMLElement){
		if(target.className.startsWith("contextMenu") && target.parentNode.id=="app-mount") {
			Discord.ContextMenu(target);
		}
		let mg = target.closest(".message-group");
		if(mg) checkMessageForOutput(mg);
	}
});

/* Command Parser */	
function parseCommand(command, channel){
	/* Urls */
	if(command.trim().match(/^https?:\/\/[^ \r\n#]+(jpg|gif|png|jpeg)(\?[^ ]*)?$/i)){
		let r = new Discord.Request();
		r.getFile(command.trim()).then(function(file){
			let form = new FormData();
			form.append("content", "");
			form.append("file", file);
			discord.sendMessage(channel, form);
		}).catch(function(err, res){
			let embed = new Discord.Embed();
			embed.setImage(command.trim());
			discord.sendMessage(channel, {content:"", embed});
		});
		return true;
	}
	
	/* Commands that start with forward slash */
	if(command[0]=="/"){
		let parts = command.substring(1).trim().replace(/ +/g, " ").split(" ");
		try{
			switch(parts[0].toLowerCase()){
				case "loop":{
					parts.shift();
					let n = parts.shift();
					let content = parts.join(" ");
					if(isNaN(+n)){
						switch(n){
							case "m":
							case "message":
							case "messages":{
								Discord.on("message", function(e){
									if(e.channel==channel)
										discord.sendMessage(channel, {content});
								});
							}
						}
						return true;
					}
					let rq = new Discord.RequestQueue();
					for(let i=0;i<n;i++){
						rq.add(function(callback){
							discord.sendMessage(channel, {content}).then(function(){
								callback();
							});
						});
					}
					rq.run();
					return true;
				}
				case "img":{
					parts.shift();
					let s = new Discord.Search();
					s.search(parts.join(" "), channel);
					return true;
				}
				case "image":{
					parts.shift();
					let images = new Discord.File("images").list(parts.join(" "));
					if(images.length){
						images[0].read().then(function(file){
							let form = new FormData();
							form.append("content", "");
							form.append("file", file);
							discord.sendMessage(channel, form);
						});
					}
					return true;
				}
				case "constanza":{
					let images = new Discord.File("images").list(parts[0]+"\.");
					parts.shift();
					images[0].read().then(function(file){
						let form = new FormData();
						form.append("content", parts.join(" "));
						form.append("file", file);
						discord.sendMessage(channel, form);
					});
					return true;
				}
				case "duck":{
					let images = new Discord.File("images").list(parts[0]+"\.");
					parts.shift();
					let text = parts.join(" ").toUpperCase();
					images[0].read().then(function(file){
						let image = new Image();
						image.onload = function(){
							let canvas = document.createElement("canvas");
							canvas.width = image.naturalWidth;
							canvas.height = image.naturalHeight;
							let ctx = canvas.getContext("2d");
							ctx.drawImage(image, 0, 0);
							if(text){
								let angleStep = 30;
								let stroke = 2;
								let size = 40;
								let min = 30;
								ctx.font = size+"px Impact";
								let measure = ctx.measureText(text);
								let lines = [], currentLine;
								while(measure.width>canvas.width){
									ctx.font = --size+"px Impact";
									measure = ctx.measureText(text);
									if(size <= min){
										text = text.split(" ");
										currentLine = text.shift();
										while(text.length){
											let word = text.shift();
											let newText = currentLine+" "+word;
											if(ctx.measureText(newText).width < canvas.width){
												currentLine = newText;
											}else{
												lines.push(currentLine);
												currentLine = word;
											}
										}
										if(currentLine) lines.push(currentLine);
										break;
									}
								}
								function toRadians(angle){return angle * (Math.PI / 180);}
								if(lines.length){
									for(let i=0;i<lines.length;i++){
										let measure = ctx.measureText(lines[i]);
										ctx.fillStyle = "black";
										for(let angle=0;angle<360;angle+=angleStep){
											ctx.fillText(
												lines[i],
												canvas.width/2 - measure.width/2 + 
												Math.cos(toRadians(angle))*stroke,
												canvas.height - 30*(lines.length-i) + size/2 + 
												Math.sin(toRadians(angle))*stroke
											);
										}
										ctx.fillStyle = "white";
										ctx.fillText(
											lines[i],
											canvas.width/2 - measure.width/2,
											canvas.height - 30*(lines.length-i) + size/2
										);
									}
								}else{
									ctx.fillStyle = "black";
									for(let angle=0;angle<360;angle+=angleStep){
										ctx.fillText(
											text,
											canvas.width/2 - measure.width/2 + 
											Math.cos(toRadians(angle))*stroke,
											canvas.height - 30 + size/2 + 
											Math.sin(toRadians(angle))*stroke
										);
									}
									ctx.fillStyle = "white";
									ctx.fillText(
										text,
										canvas.width/2 - measure.width/2,
										canvas.height - 30 + size/2
									);
								}
							}
							canvas.toBlob(function(blob){
								let form = new FormData();
								form.append("content", "");
								form.append("file", new File([blob], "duck.jpg"));
								discord.sendMessage(channel, form);
							});
							
						}
						image.src = URL.createObjectURL(file);
					});
					return true;
				}
				case "info":{
					let user_id = parts[1].match(/^<@\!?(.+)>$/)[1];
					discord.getUserFromChannel(channel, user_id).then(function(guild_member){
						let embed = new Discord.Embed();
						let icon = discord.getUserIcon(user_id, guild_member.user.avatar, 2048);
						embed.setAuthorIcon(icon);
						embed.setAuthorName(guild_member.nick?guild_member.nick:guild_member.user.username);
						embed.setImage(icon);
						let joined = guild_member.joined_at.match(/(.+?)T(.+?)\./);
						embed.addField("Joined At:", joined[1]+" "+joined[2]);
						discord.sendMessage(channel, {content:"", embed});
					});
					return true;
				}
				case "react":{
					parts.shift();
					let message = parts.shift();
					let letters = textToEmojis(parts.join(" "));
					let rq = new Discord.RequestQueue();
					for(let i=0;i<letters.length;i++){
						rq.add(function(callback){
							discord.react(channel, message, letters[i]).then(callback);
						});
					}
					rq.run();
					return true;
				}
				case "8ball":{
					parts.shift();
					let answers = ['Maybe.', 'Certainly not.', 'I hope so.', 'Not in your wildest dreams.', 'There is a good chance.', 'Quite likely.', 'I think so.', 'I hope not.',  'I hope so.', 'Never!', 'Fuhgeddaboudit.', 'Ahaha! Really?!?', 'Pfft.', 'Sorry, bucko.', 'Hell, yes.', 'Hell to the no.', 'The future is bleak.', 'The future is uncertain.', 'I would rather not say.', 'Who cares?',  'Possibly.', 'Never, ever, ever.', 'There is a small chance.', 'Yes!'];
					let embed = new Discord.Embed();
					embed.setAuthorIcon("https://cdn.discordapp.com/attachments/336483154858737674/377602724700618755/8ballxd.png");
					embed.setAuthorName("8Ball");
					embed.setColor("#000000");
					embed.addField(parts.join(" "), answers[(Math.random()*answers.length)|0]);
					return {content:"", embed};
				}
				case "delete":{
					let n = +parts[1];
					discord.getMessages(channel).then(function(messages){
						if(n>0){
							let r = new Discord.RequestQueue();
							for(let i=0;i<messages.length;i++){
								let m = messages[i];
								if(m.author.id==discord.user){
									r.add(function(callback){
										discord.deleteMessage(channel, m.id).then(callback);
									});
									if(!--n)break;
								}
							}
							r.run();
						}
					});
					return true;
				}
				case "penis":{
					let user_id = parts[1].match(/^<@\!?(.+)>$/)[1];
					let first = user_id.substring(user_id.length-8, user_id.length-4);
					let sec = user_id.substring(user_id.length-4);
					let number = ((first^sec)/1000)+10;
					let visual = "8"+Array((number+1)|0).join("=")+"D";
					discord.getUserFromChannel(channel, user_id).then(function(guild_member){
						let embed = new Discord.Embed();
						embed.setAuthorIcon(discord.getUserIcon(user_id, guild_member.user.avatar));
						embed.setAuthorName(guild_member.nick?guild_member.nick:guild_member.user.username);
						embed.addField("Penis Size:", number+"cm");
						embed.addField("Visual Representation:", visual);
						discord.sendMessage(channel, {content:"", embed});
					});
					return true;
				}
				case "iq":{
					let iq_images = {
						0: "https://i.imgur.com/Gj4spKz.jpg",
						100: "https://i.imgur.com/pBRNm4a.png",
						150: "https://i.imgur.com/Bk5UhjO.jpg",
						200: "https://i.imgur.com/IIsGAI4.jpg",
						300: "https://i.imgur.com/eagqBxP.png"
					};
					let user_id = parts[1].match(/^<@\!?(.+)>$/)[1];
					let first = user_id.substring(user_id.length-8, user_id.length-4)/"9999";
					let sec = user_id.substring(user_id.length-4)/"9999";
					let IQ = Math.sqrt(-2.0 * Math.log(first)) * Math.cos(2.0 * Math.PI * sec);
					IQ *= 5*15;
					IQ += 100;
					IQ = (IQ|0)+"";
					let image = "https://i.imgur.com/uIssbhD.jpg";
					reverseEach(iq_images, function(key, value){
						if(+IQ>+key){
							image = value;
							return false;
						}
					});
					discord.getUserFromChannel(channel, user_id).then(function(guild_member){
						let embed = new Discord.Embed();
						embed.setAuthorIcon(discord.getUserIcon(user_id, guild_member.user.avatar));
						embed.setAuthorName(guild_member.nick?guild_member.nick:guild_member.user.username);
						embed.addField("IQ:", IQ);
						embed.setImage(image);
						discord.sendMessage(channel, {content:"", embed});
					});
					return true;
				}
				case "roll":{
					let reactions = [
						"https://i.imgur.com/sxQnhVm.jpg",
						"https://i.imgur.com/usuAgu3.jpg",
						"https://i.imgur.com/EMb4lbI.jpg",
						"https://i.imgur.com/6fycPCo.jpg",
						"https://i.imgur.com/mlIF485.jpg"
					];
					parts.shift();
					let number = (Math.random()*1000000000)|0;
					let digits = (number+"").match(/((.)\2+)$/g);
					let embed = new Discord.Embed();
					embed.setAuthorIcon("https://i.imgur.com/m9DpkTr.jpg");
					embed.setAuthorName("Rolled "+number);
					embed.description = parts.join(" ");
					if(digits){
						let reaction = reactions[digits[0].length-2];
						if(!reaction) reaction = reactions[reactions.length-1];
						embed.setImage(reaction);
					} else {
						let offByOne = (number+"").match(/((.)\2+).$/g);
						if(offByOne){
							offByOne = offByOne[0];
							let distance = Math.abs(offByOne[0] - offByOne[offByOne.length-1]);
							if(distance==1){
								embed.setImage("https://i.imgur.com/4Am4VKp.png");
							}
						}
					}
					return {content:"", embed};
				}
				case "desu":{
					discord.desu = !discord.desu;
					return true;
				}
				default:{
					let verbs = {
						dab:[
							"dabbed",
							"https://i.imgur.com/BhFwhOb.jpg"
						],
						kiss:[
							"kissed",
							"https://i.imgur.com/eisk88U.gif"
						],
						kill:[
							"killed",
							"https://i.imgur.com/3hIgEF5.png"
						],
						awoo:[
							"awooed",
							"https://i.imgur.com/9LG19PH.jpg"
						]
					};
					if(verbs[parts[0]]){
						let v = verbs[parts.shift()];
						let top_text = "";
						let bottom_text = v[0]+" "+parts.join(" ");
						/*
						let matches = bottom_text.match(/(<@\!?.+?>|@everyone)/g);
						if(matches){
							bottom_text = bottom_text.replace(/(<@\!?.+?>|@everyone)/, "you").replace(/(<@\!?.+?>|@everyone)/g, "").replace(/ +/g, " ").trim();
							top_text = matches.join(" ");
						}
						*/
						discord.getUserFromChannel(channel, discord.user).then(function(guild_member){
							let name = guild_member.nick?guild_member.nick:guild_member.user.username;
							let embed = new Discord.Embed();
							embed.description = name+" "+bottom_text;
							embed.setImage(v[1]);
							discord.sendMessage(channel, {content:top_text, embed});
						}, function(){
							discord.getMe().then(function(me){
								let embed = new Discord.Embed();
								embed.description = me.username+" "+bottom_text;
								embed.setImage(v[1]);
								discord.sendMessage(channel, {content:top_text, embed});
							});
						});
						return true;
					}
				}
			}
		}catch(e){
			console.log(e);
			return false;
		}
	}
	return false;
}

/* Command Utils */
Discord.UserAgent = "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) discord/0.0.300 Chrome/56.0.2924.87 Discord/1.6.15 Safari/537.36";
Discord.events = {};
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
					let blob = new Blob([data], {type:_mime.lookup(data)});
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
				let blob = new Blob([data], {type:_mime.lookup(data)});
				let file = new File([blob], name);
				succ(file);
			}).catch(error);
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
		google_images:{
			name:"Google Images",
			icon:"https://i.imgur.com/JHeQgVA.png",
			color:"#4885ed",
			init: function(search){
				return new Promise(function(succ){
					getDocument("https://www.google.pt/search?espv=2&biw=1366&bih=667&site=webhp&source=lnms&tbm=isch&sa=X&ei=XosDVaCXD8TasATItgE&ved=0CAcQ_AUoAg&q="+search).then(function(doc){
						console.log(doc);
						elements = doc.querySelectorAll("a + div[jsname]");
						succ();
					});
				});
			},
			get: function(index){
				let url = elements[index].innerHTML.match("\"ou\":\"(.+?)\"");
				console.log("GOOGLE SEARCH DEBUG:::", elements, index, url);
				return url[1];
			}
		}
	};
	
	this.search = function(_search, _channel){
		search = _search;
		channel = _channel;
		return new Promise(function(succ){
			type = types[type]?types[type]:types["google_images"];
			type.init(search).then(function(){
				let embed = getEmbed(index);
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
			let embed = getEmbed(index);
			discord.editMessage(channel, message, {content:"", embed});
			return true;
		}
		return ret;
	}
	
	function getEmbed(index){
		let embed = new Discord.Embed();
		embed.setAuthorIcon(type.icon);
		embed.setAuthorName(type.name);
		embed.setColor(type.color);
		embed.addField("Search:", search);
		embed.setImage(type.get(index));
		embed.setFooterText((index+1)+"/"+elements.length);
		return embed;
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
Discord.on = function(event, callback){
	if(!Discord.events[event]) Discord.events[event] = [];
	Discord.events[event].push(callback);
}
Discord.call = function(event, data){
	if(!Discord.events[event]) return;
	for(let i=0;i<Discord.events[event].length;i++){
		Discord.events[event][i](data);
	}
}

/* HTMLElement Utils */
HTMLElement.prototype.getReactInstance = function(){
	let start = "__reactInternalInstance$";
	for(let i in this){
		if(i.startsWith(start)) return this[i];
	}
}
HTMLElement.prototype.getReactReturn = function(num){
	let react = this.getReactInstance();
	while(react.tag!=num)
		react = react.return;
	return react;
}

/* More Utils */
function textToEmojis(str){
	let emoji = {
		' ': ['❤', '💛', '💜', '💚', '💙'],
        'a': ['🇦', '🅰', '🍙', '🔼', '4⃣'],
        'b': ['🇧', '🅱', '8⃣'],
        'c': ['🇨', '©', '🗜'],
        'd': ['🇩', '↩'],
        'e': ['🇪', '3⃣', '📧', '💶'],
        'f': ['🇫', '🎏'],
        'g': ['🇬', '🗜', '6⃣', '9⃣', '⛽'],
        'h': ['🇭', '♓'],
        'i': ['🇮', 'ℹ', '🚹', '1⃣'],
        'j': ['🇯', '🗾'],
        'k': ['🇰', '🎋'],
        'l': ['🇱', '1⃣', '🇮', '👢', '💷'],
        'm': ['🇲', 'Ⓜ', '📉'],
        'n': ['🇳', '♑', '🎵'],
        'o': ['🇴', '🅾', '0⃣', '⭕', '🔘', '⏺', '⚪', '⚫', '🔵', '🔴', '💫'],
        'p': ['🇵', '🅿'],
        'q': ['🇶', '♌'],
        'r': ['🇷', '®'],
        's': ['🇸', '5⃣', '⚡', '💰', '💵', '💲'],
        't': ['🇹', '✝', '➕', '🎚', '🌴', '7⃣'],
        'u': ['🇺', '⛎', '🐉'],
        'v': ['🇻', '♈', '☑'],
        'w': ['🇼', '〰', '📈'],
        'x': ['🇽', '❎', '✖', '❌', '⚒'],
        'y': ['🇾', '✌', '💴'],
        'z': ['🇿', '2⃣'],
        '0': ['0⃣', '🅾', '0⃣', '⭕', '🔘', '⏺', '⚪', '⚫', '🔵', '🔴', '💫'],
        '1': ['1⃣', '🇮'],
        '2': ['2⃣', '🇿'],
        '3': ['3⃣'],
        '4': ['4⃣'],
        '5': ['5⃣', '🇸', '💲', '⚡'],
        '6': ['6⃣'],
        '7': ['7⃣'],
        '8': ['8⃣', '🎱', '🇧', '🅱'],
        '9': ['9⃣'],
        '?': ['❓'],
        '!': ['❗', '❕', '⚠', '❣'],
        'combination': [
			['cool', '🆒'],
			//['back', '🔙'],
			//['soon', '🔜'],
			['free', '🆓'],
			//['end', '🔚'],
			//['top', '🔝'],
			['abc', '🔤'],
			['atm', '🏧'],
			['new', '🆕'],
			['sos', '🆘'],
			['100', '💯'],
			['zzz', '💤'],
			['ng', '🆖'],
			['id', '🆔'],
			['vs', '🆚'],
			['wc', '🚾'],
			['ab', '🆎'],
			['cl', '🆑'],
			['ok', '🆗'],
			['up', '🆙'],
			['10', '🔟'],
			['11', '⏸'],
			['ii', '⏸'],
			['tm', '™'],
			//['on', '🔛'],
			['oo', '🈁'],
			['!?', '⁉'],
			['!!', '‼'],
			['21', '📅'],
		]
    }
	let arr = [];
	for(let c=0;c<emoji.combination.length;c++){
		let comb = emoji.combination[c][0];
		let combEmoji = emoji.combination[c][1];
		let index = str.indexOf(comb);
		let occupied = false;
		for(let i=index;i<index+comb.length;i++){
			if(arr[i] != undefined){
				occupied = true;
				break;
			}
		}
		if(index!=-1 && !occupied){
			arr[index] = decodeURIComponent(combEmoji);
			for(let i=index+1;i<index+comb.length;i++){
				arr[i] = false;
			}
		}
	}
	let last = [];
	for(let i=0;i<str.length;i++){
		if(arr[i] == undefined){
			last.push(decodeURIComponent(emoji[str[i]].shift()));
		} else if(arr[i] != false){
			last.push(arr[i]);
		}
	}
	return last;
}

/* Get tokens and intercept messages before they are sent */
let _XMLHttpRequest = window.XMLHttpRequest;
window.XMLHttpRequest = function(){
	let method, requestUrl;
	let xhr = new _XMLHttpRequest(...arguments);
	xhr.setProperty = function(prop, val){
		Object.defineProperty(xhr, prop, {
			writable: true,
			value: val
		});
	}
	let setRequestHeader = xhr.setRequestHeader;
	xhr.setRequestHeader = function(name, value){
		if(name=="Authorization" || name=="X-Super-Properties")
			discord.headers[name] = value;
		setRequestHeader.apply(xhr, arguments);
	}
	let open = xhr.open;
	xhr.open = function(_method, url){
		method = _method;
		requestUrl = url;
		open.apply(xhr, arguments);
	}
	let send = xhr.send;
	xhr.send = function(data){
		let parts;
		/* Message being sent */
		parts = requestUrl.match(/api\/v.\/channels\/(.+?)\/messages$/);
		if(parts){
			let channel = parts[1];
			if(typeof data == "string"){
				let d = JSON.parse(data);
				let newData = parseCommand(d.content, channel);
				if(newData !== false){
					if(newData === true){
						Discord.Nonces.add(d.nonce);
						xhr.setProperty("status", 404);
						xhr.setProperty("readyState", 4);
						xhr.onreadystatechange();
						xhr.setProperty("status", 200);
						xhr.setProperty("readyState", 4);
						xhr.setProperty("responseText", JSON.stringify({
							"nonce": d.nonce, 
							"timestamp": new Date().toISOString(), 
							"author": {
								"id": "0",
								"avatar": "0"
							},
							"id": d.nonce,
							"embeds":[],
							"mention_roles": [], 
							"content": "[nonce:"+d.nonce+"]", 
							"mentions": [], 
							"type": 0
						}));
						xhr.getResponseHeader = function(h){
							let headers = {
								"content-type": "application/json"
							};
							return headers[h.toLowerCase()];
						}
						xhr.onreadystatechange();
						return;
					}else if(newData !== undefined){
						for(let nd in newData){
							d[nd] = newData[nd];
						}
						data = JSON.stringify(d);
					}
				}else if(discord.desu){
					d.content += " desu";
					data = JSON.stringify(d);
				}
			}
		}
		
		/* Token */
		if(!parts){
			parts = requestUrl.match(/api\/v.\/science$/);
			if(parts){
				let d = JSON.parse(data);
				discord.user = atob(d.token.split(".")[0]);
			}
		}
		send.apply(xhr, [data]);
	}
	return xhr;
}


