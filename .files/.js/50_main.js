/* Auxiliary Functions */
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
function checkMessageForGreenText(child){
	if(!Discord.Settings.Raw.GENERAL_GREENTEXT) return;
	let markup = child.querySelector(".markup");
	if(!markup) return;
	if(markup.greentext) return;
	markup.greentext = true;
	let textNodes = markup.childNodes;
	for(let i=0;i<textNodes.length;i++){
		if(textNodes[i].nodeType != Node.TEXT_NODE) continue;
		let tn = textNodes[i];
		let t = tn.textContent.split(/(\n)/);
		let div = document.createElement("div");
		div.className = "greentext-container";
		for(let j=0;j<t.length;j++){
			if(t[j] == "\n"){
				div.appendChild(document.createTextNode("\n"));
			}else if(t[j].match(/^>.+$/)){
				let span = document.createElement("span");
				span.className = "greentext";
				span.textContent = t[j];
				div.appendChild(span);
			}else{
				let text = document.createTextNode(t[j]);
				div.appendChild(text);
			}
		}
		markup.replaceChild(div, tn);
	}
}
function fixImageUpload(um){
	let submit = um.querySelector("button.button-primary");
	let filenameElement = um.querySelector('[class*="filename-"]');
	filenameElement.setAttribute("contenteditable", true);
	filenameElement.addEventListener("input", function(e){
		setFilename();
	});
	filenameElement.addEventListener("keydown", function(e){
		if(e.key=="Enter"){
			e.preventDefault();
			e.stopImmediatePropagation();
			submit.click();
		}
	}, true);
	let fileState = um.getReactReturn(2).memoizedState.file;
	let ext = fileState.type.split("/")[1];
	function setFilename(){
		let filename = filenameElement.textContent;
		if(!filename.match(/\..+/)){
			Object.defineProperty(fileState, "name", {
				value:filename+"."+ext,
				configurable: true
			});
		}else if(filename!=fileState.name){
			Object.defineProperty(fileState, "name", {
				value:filename,
				configurable: true
			});
		}
	}
	setFilename();
}

/* Window Events */
Discord.Console.onCommand = function(command){
	let channel = document.querySelector(".chat").getReactReturn(2).memoizedProps.location.pathname.split("/")[3];
	if(command[0]!="/") command = "/"+command;
	commands.run(command, channel);
}
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
	Discord.Console.init();
	Discord.MusicPlayer.init();
});
window.addEventListener("click", function(e){
	let t = e.target;
	if(t.parentNode.className=="reaction reaction-me") t = t.parentNode;
	if(t.className=="reaction reaction-me"){
		let msg = t.closest(".message");
		let comment = msg.parentNode;
		let index = Array.prototype.indexOf.call(comment.children, msg);
		let message_id = comment.getReactReturn(2).memoizedProps.messages[index].id;
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
		if(target.matches(".greentext-container")) return;
		if(Discord.ContextMenu(target)) return;
		if(Discord.Settings(target)) return;
		
		if(target.matches(".messages-wrapper")){
			let mg = document.querySelectorAll(".message-group");
			for(let i=0;i<mg.length;i++){
				if(checkMessageForOutput(mg[i])) continue;
				let msg = mg[i].querySelectorAll(".message");
				for(let i=0;i<msg.length;i++)
					checkMessageForGreenText(msg[i]);
			}
			return;
		}
		let mg = target.matches(".message-group")?target:target.closest(".message-group");
		if(mg){
			if(checkMessageForOutput(mg)) return;
			let msg = mg.querySelectorAll(".message");
			for(let i=0;i<msg.length;i++)
				checkMessageForGreenText(msg[i]);
			return;
		}
		
		let umClass = '[class*="uploadModal-"]';
		let um = target.matches(umClass)?target:target.querySelector(umClass);
		if(um){
			fixImageUpload(um);
		}
	}
});

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
				let newData = commands.run(d.content, channel);
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
						if(newData.bot){
							sendBotMessage(xhr, newData.content, d.nonce);
							return;
						}else{
							for(let nd in newData){
								d[nd] = newData[nd];
							}
							data = JSON.stringify(d);
						}
					}
				}else if(Discord.Settings.Raw.GENERAL_DESU){
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
	function sendBotMessage(xhr, content, nonce){
		xhr.setProperty("status", 200);
		xhr.setProperty("readyState", 4);
		xhr.setProperty("responseText", JSON.stringify({
			"nonce": nonce, 
			"timestamp": new Date().toISOString(), 
			"author": {
				"id": "1",
				"avatar": "clyde",
				"bot":"true",
				"username":"Clyde"
			},
			"id": nonce,
			"embeds":[],
			"mention_roles": [], 
			"content": content, 
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
	}
	return xhr;
}

/* Proxy for removeChild because why the fuck would it throw an exception and crash the whole code */
let _removeChild = HTMLElement.prototype.removeChild;
HTMLElement.prototype.removeChild = function(child){
	if(child.parentNode!=this) return;
	_removeChild.apply(this, arguments);
}