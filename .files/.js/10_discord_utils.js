/* Discord Utils */
Discord.UserAgent = "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) discord/0.0.300 Chrome/56.0.2924.87 Discord/1.6.15 Safari/537.36";
Discord.events = {};
Discord.Console = new (function(){
	let _this = this;
	this.onCommand = function(){};
	let commandWrapper;
	let commandArrow;
	let commandInput;

	this.init = function(){
		let appMount = document.getElementById("app-mount");

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
	this.root = DT.root;
	this.filename = filename[0] != "/" ? this.root+filename : filename;
	this.basename = this.filename.split("/");
	this.basename = this.basename[this.basename.length-1];
	this.isDir = false;
	if(_fs.lstatSync(this.filename).isDirectory()){
		this.isDir = true;
	}

	this.read = function(){
		return new Promise(function(succ, error){
			_this.readBlob().then(function(blob){
				let file = new File([blob], _this.basename);
				succ(file);
			},error);
		});
	}
	this.readBase64 = function(){
		return new Promise(function(succ, error){
			_this.readRaw().then(function(data){
				let b = new _buffer.Buffer(data, 'binary').toString('base64');
				succ("data:"+_mime.lookup(_this.basename)+";base64,"+b);
			});
		});
	}
	this.readBlob = function(){
		return new Promise(function(succ, error){
			_this.readRaw().then(function(data){
				let blob = new Blob([data]);
				succ(blob);
			},error);
		});
	}
	this.readRaw = function(){
		if(!_this.isDir){
			return new Promise(function(succ, error){
				_fs.readFile(_this.filename, function read(err, data) {
					if (err) {error(); return;}
					succ(data);
				});
			});
		}
	}
	this.readText = function(){
		if(!_this.isDir){
			return new Promise(function(succ, error){
				_fs.readFile(_this.filename, "utf-8", function read(err, data) {
					if (err) {error(); return;}
					succ(data);
				});
			});
		}
	}
	this.readTextSync = function(){
		if(!_this.isDir){
			return _fs.readFileSync(_this.filename, "utf-8");
		}
	}

	this.listFolders = function(filter){
		if(_this.isDir){
			let folders = [];
			_fs.readdirSync(_this.filename).forEach(file => {
				let f = new Discord.File(_this.filename+"/"+file);
				if(f.isDir){
					if(filter){
						var regex = new RegExp(filter, "i");
						if(file.match(regex))
							folders.push(f);
					}else{
						folders.push(f);
					}
				}
			});
			return folders;
		}
	}

	this.list = function(filter){
		if(_this.isDir){
			let files = [];
			_fs.readdirSync(_this.filename).forEach(file => {
				if(filter){
					var regex = new RegExp(filter, "i");
					if(file.match(regex))
						files.push(new Discord.File(_this.filename+"/"+file));
				}else{
					files.push(new Discord.File(_this.filename+"/"+file));
				}
			});
			return files;
		}
	}

}

Discord.Date = new (function(){
	let EPOCH = 1420070400000;

	this.fromId = function(id){
		let binary = (+id).toString(2).padStart(64, '0');
		let timestamp = parseInt(binary.substring(0, 42), 2) + EPOCH;
		return new Date(timestamp);
	}
	let lastTimestamp, increment=0;
	this.toId = function(timestamp){
		if(!timestamp) timestamp = Date.now();
		if(timestamp==lastTimestamp){
			increment++;
		}else{
			increment = 0;
		}
		lastTimestamp=timestamp;
		let binary = `${(timestamp-EPOCH).toString(2).padStart(42, '0')}0000100000${(increment++).toString(2).padStart(12, '0')}`;
		return parseInt(binary, 2);
	}

	this.difference = function(d1, d2){
		let diff = new Date(d1.getTime() - d2.getTime());
		let years = diff.getUTCFullYear() - 1970;
		let months = diff.getUTCMonth();
		let days = diff.getUTCDate() - 1;
		let text = "";
		if(years) text+=years+(years==1?" year ":" years ");
		if(months) text+=months+(months==1?" month ":" months ");
		if(days || (!years && !months))text+=days+(days==1?" day ":" days");
		return text.trim();
	}
});

/* Requests */
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
					error(err);
				}else{
					if(err)	error(err);
					else 	succ(res);
				}
			});
		});
	}

	this.getBuffer = function(url){
		return new Promise(function(succ, error){
			let name = url.split("/").pop().split(/(\?|\#)/)[0];
			_this.open("GET", url);
			_this.encoding = null;
			_this.send().then(function(response){
				succ(response.body);
			}).catch(error);
		});
	}

	this.getFile = function(url){
		return new Promise(function(succ, error){
			let name = url.split("/").pop().split(/(\?|\#)/)[0];
			_this.open("GET", url);
			_this.encoding = null;
			_this.send().then(function(response){
				let blob = new Blob([response.body]);
				let file = new File([blob], name);
				succ(file);
			}).catch(error);
		});
	}

	this.downloadFile = function(url, location){
		let name = url.split("/").pop().split(/(\?|\#)/)[0];
		let dir = DT.root+".files/.tmp/";
		let tmp = dir+(new Date().getTime())+"_"+name;
		if(!_fs.existsSync(dir)) _fs.mkdirSync(dir);
		let extension = name.split(".");
		extension = extension.length==1?undefined:extension.pop();
		_this.open("GET", url);
		let locationPromise;
		if(!location){
			locationPromise = new Promise(function(succ, err){
				_dialog.showSaveDialog({defaultPath:name}).then(e => {
					let location = e.filePath;
					if(!e.canceled){
						let location_extension = location.split(".");
						if(location_extension.length==1 && extension){
							location = location+"."+extension;
						}
						succ(location);
					}else{
						err();
					}
				});
			});
		}
		let stream = _request({
			encoding: _this.encoding,
			headers,
			uri,
			method
		}, function(error, response, body){
			extension = response.headers["content-type"].split("/").pop();
		}).pipe(_fs.createWriteStream(tmp));
		stream.on('finish', function(){
			if(locationPromise){
				locationPromise.then(function(location){
					moveFile(tmp, location);
				}, function(){
					_fs.unlink(tmp, function(){});
				});
			}else{
				moveFile(tmp, location);
			}
		});
		function moveFile(tmp, location){
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
		}
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
Discord.Search = function(type){
	let _this = this;
	let channel, message, search;
	let elements, index=0;
	let types = Discord.Search.types;

	this.addType = function(name, type){
		types[name] = type;
	}
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
			type.init(search).then(function(_elements){
				elements = _elements;
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
			type.get(elements, index).then(function(url){
				let embed = new Discord.Embed();
				embed.setAuthorIcon(type.icon);
				embed.setAuthorName(type.name);
				embed.setColor(type.color);
				embed.addField("Search:", search, true);
				embed.setImage(url);
				embed.setFooterText((index+1)+"/"+elements.length);
				if(type.embed)
					type.embed(embed, elements[index]);
				succ(embed);
			});
		});
	}
}
Discord.Search.types = {
	gi:{
		name:"Google Images",
		icon:"https://i.imgur.com/JHeQgVA.png",
		color:"#4885ed",
		init: function(search){
			return new Promise(function(succ){
				Discord.Search.getRaw("https://www.google.pt/search?espv=2&biw=1366&bih=667&site=webhp&source=lnms&tbm=isch&sa=X&ei=XosDVaCXD8TasATItgE&ved=0CAcQ_AUoAg&q="+search).then(function(doc){
					let elements = doc.match(/\["(https?:\/\/.+?)",\d+?,\d+?\]/g);
					elements = elements.reduce((cum, e) => {
						let array = JSON.parse(e);
						if(array[0].startsWith('https://encrypted')) return cum;

						cum.push(array[0]);
						return cum;
					}, []);
					succ(elements);
				});
			});
		},
		get: function(elements, index){
			return new Promise(function(succ){
				let e = elements[index];
				succ(e);
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
				Discord.Search.getDocument("https://chan.sankakucomplex.com?tags="+search).then(function(doc){
					let first = doc.querySelector("#popular-preview");
					if(first!=null)
						first.parentNode.removeChild(first);
					let elements = doc.querySelectorAll(".thumb");
					succ(elements);
				});
			});
		},
		get: function(elements, index){
			return new Promise(function(succ){
				Discord.Search.getDocument("https://chan.sankakucomplex.com/post/show/"+elements[index].id.substring(1)).then(function(doc){
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
Discord.Search.getDocument = function(url){
	return new Promise(function(succ){
		let request = new Discord.Request();
		request.open("GET", url);
		request.setHeader("User-Agent", Discord.UserAgent);
		request.send().then(function(response){
			let doc = new DOMParser().parseFromString(response.body, "text/html");
			succ(doc);
		});
	});
};
Discord.Search.getRaw = function(url){
	return new Promise(function(succ){
		let request = new Discord.Request();
		request.open("GET", url);
		request.setHeader("User-Agent", Discord.UserAgent);
		request.send().then(function(response){succ(response.body)});
	});
};

Discord.Translator = new (function(){
	let url = "https://translate.google.com/m";

	this.translate = function(text, language){
		return new Promise(function(succ){
			let request = new Discord.Request();
			request.open("GET", url+"?sl=auto&hl="+language+"&q="+text);
			request.setHeader("User-Agent", Discord.UserAgent);
			request.send().then(function(response){
				let doc = new DOMParser().parseFromString(response.body, "text/html");
				let element = doc.querySelector(".t0");
				succ(element.textContent);
			});
		});
	}
})();

/* Messages */
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
	let messages = {};

	this.add = function(id){
		messages[id] = true;
	}
	this.has = function(id){
		return !!messages[id];
	}
})();
Discord.ReactionMessages = new (function(){
	let messages = {};

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

/* UI */
Discord.Modal = function(modal, permanent){
	modal.classList.add("dt-modal");

	let modalWrapper = document.createElement("div");
	modalWrapper.className = "dt-modal-wrapper";
	modalWrapper.appendChild(modal);
	if(!permanent)
		modalWrapper.addEventListener("click", function(e){
			if(e.target == modalWrapper)
				this.hide();
		}.bind(this));

	this.show = function(){
		document.body.appendChild(modalWrapper);
	}

	this.hide = function(){
		document.body.removeChild(modalWrapper);
	}
}
Discord.FileDialog = function(file){
	let _this = this;
	let fileDialog = document.createElement("div");
	fileDialog.className = "dt-file-dialog";
	let modal = new Discord.Modal(fileDialog, true);

	let wrapper = document.createElement("div");
	wrapper.className = "dt-file-dialog-wrapper";
	let image = document.createElement("div");
	image.className = "dt-file-dialog-preview";
	file.toBase64().then(function(b){
		image.style.backgroundImage = "url("+b+")";
	});
	let right = document.createElement("div");
	right.className = "dt-file-dialog-right";
	let name = document.createElement("span");
	name.className = "dt-file-dialog-name";
	name.textContent = file.name;
	name.setAttribute("contenteditable", true);
	let textContainer = document.createElement("div");
	textContainer.className = "dt-file-dialog-message-container";
	let text = document.createElement("textarea");
	text.className = "dt-file-dialog-message dt-textarea";
	text.placeholder = "Optional Message";
	textContainer.appendChild(text);
	right.appendChild(name);
	right.appendChild(textContainer);
	wrapper.appendChild(image);
	wrapper.appendChild(right);
	fileDialog.appendChild(wrapper);

	let bottom = document.createElement("div");
	bottom.className = "dt-file-dialog-bottom"
	let uploadButton = document.createElement("div");
	uploadButton.className = "dt-file-dialog-upload";
	uploadButton.innerHTML = "Upload";
	let cancelButton = document.createElement("div");
	cancelButton.className = "dt-file-dialog-cancel";
	cancelButton.innerHTML = "Cancel";
	bottom.appendChild(cancelButton);
	bottom.appendChild(uploadButton);
	fileDialog.appendChild(bottom);

	name.addEventListener("keydown", function(e){
		if(e.key == "Enter")
			uploadButton.click();
	});
	Discord.autoResizeTextarea(text);
	text.addEventListener("keydown", function(e){
		if(!e.shiftKey && e.key == "Enter")
			uploadButton.click();
	});
	uploadButton.addEventListener("click", function(){
		modal.hide();
		_this.upload(text.value, name.textContent);
	});
	cancelButton.addEventListener("click", function(){
		modal.hide()
	});

	this.show = function(){
		modal.show();
		text.focus();
	}
	this.hide = function(){
		modal.hide();
	}
	this.upload = function(content, name){
		if(name != file.name){
			name = Discord.renameFileNameWithExtension(file.name, name);
			file = new File([file], name, {type: file.type});
		}
		let form = new FormData();
		form.append("content", content);
		form.append("file", file);
		discord.sendMessage(discord.getCurrentChannel(), form);
	}
}

/* Other Utils */
Discord.renameFileNameWithExtension = function(oldName, newName){
	let oldExt = oldName.split(".").pop();
	let newExt = newName.split(".").pop();
	if(newExt == newName){
		newName += "."+oldExt;
	}
	return newName;
}
Discord.autoResizeTextarea = function(textarea){
	let step = 20;
	textarea.addEventListener("input", resize);
	function resize(){
		if(textarea.value == ""){
			textarea.style.height = "";
			return;
		}
		if(textarea.scrollHeight > textarea.offsetHeight){
			let h;
			for(let i=0;i<=10;i++){
				textarea.style.height = (h=(i*step))+"px";
				if(textarea.scrollHeight == textarea.offsetHeight) break;
			}
		}else{
			let h;
			for(let i=10;i>=0;i--){
				textarea.style.height = (h=(i*step))+"px";
				if(textarea.scrollHeight != textarea.offsetHeight) break;
			}
			textarea.style.height = (h+step)+"px";
		}
	}
}

/* Cookies */
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
	this.get = function(name, defaultValue) {
		var nameEQ = name + "=";
		var ca = document.cookie.split(';');
		for(var i=0;i < ca.length;i++) {
			var c = ca[i];
			while (c.charAt(0)==' ') c = c.substring(1,c.length);
			if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
		}
		return defaultValue;
	}
	this.erase = function(name) {
		document.cookie = name+'=; Max-Age=-99999999;';
	}
})();
