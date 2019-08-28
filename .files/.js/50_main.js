let messageGroupClass = "[class*='messages-'] > [class*='containerCozy-'][class*='container-'], [class*='messages-'] > [class*='containerCompact-'][class*='container-']";
let messageClass = "[class*='messageCozy-'][class*='message-'], [class*='messageCompact-'][class*='message-']";
let textareaClass = "[class*='channelTextArea-']";
let textAreaId = "#channel-text-area-wrapper";
let reactionClass = "[class*='reaction-'][class*='reactionMe-']";

/* Auxiliary Functions */
function reverseEach(obj, fn){
	let keys = [];
	for (let key in obj) {keys.unshift(key);}
	for (let i=0;i<keys.length;i++) {
		if(fn(keys[i], obj[keys[i]]) === false) return;
	}
}
function checkMessageForOutput(child){
	let nonce = child.getReact().memoizedProps.messages[0].id;
	if(Discord.Nonces.has(nonce)){
		child.style.display = "none";
		return true;
	}
}
function checkMessageForGreenText(child){
	if(!Discord.Settings.Raw.General.General.Greentext) return;
	let markup = child.querySelector("[class*='markup-']");
	if(!markup || markup.greentext || markup.editing) return;
	markup.greentext = markup.cloneNode(true);
	let textNodes = markup.greentext.childNodes;
	let hasGreentext = false;
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
				hasGreentext = true;
			}else{
				let text = document.createTextNode(t[j]);
				div.appendChild(text);
			}
		}
		markup.greentext.replaceChild(div, tn);
	}
	if(hasGreentext){
		let t = markup.innerHTML;
		markup.innerHTML = markup.greentext.innerHTML;
		markup.greentext.innerHTML = t;
	}else{
		markup.greentext = true;
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
	
	let props = um.getReact().memoizedProps;
	let file, ext;
	function waitFile(){
		if(!props.file) return setTimeout(waitFile, 500);
		file = props.file;
		ext = file.type.split('/')[1];
		setFilename();
	}
	setTimeout(waitFile, 500);
	
	function setFilename(){
		let filename = filenameElement.textContent;
		if(!filename.match(/\..+/)){
			Object.defineProperty(file, "name", {
				value:filename+(ext?"."+ext:""),
				configurable: true
			});
		}else if(filename!=file.name){
			Object.defineProperty(file, "name", {
				value:filename,
				configurable: true
			});
		}
	}
}
function fixTextArea(textarea){
	let inner = textarea.children[0];
	let t = textarea.querySelector("textarea");
	Discord.Line.appendTo(t.nextElementSibling);
	function setLength(length){
		if(!Discord.Settings.Raw.General.General.CharacterCount) return;
		if(!length)
			inner.removeAttribute("count");
		else
			inner.setAttribute("count", length);
	}
	t.addEventListener("input", function(e){
		setLength(t.value.length);
	});
	t.addEventListener("keydown", function(e){
		if(e.altKey || e.ctrlKey || e.shiftKey) return;
		if(e.key == "Enter")
			setLength();
	});
	setLength(t.value.length);
}

/* Window Events */
Discord.Console.onCommand = function(command){
	if(command[0]!="/") command = "/"+command;
	commands.run(command, discord.getCurrentChannel());
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
});
window.addEventListener("click", function(e){
	let t = e.target;
	let c = t.closest(reactionClass);
	if(c) t = c;
	if(t.matches(reactionClass)){
		let msg = t.closest(messageClass);
		let comment = msg.parentNode;
		let index = Array.prototype.indexOf.call(comment.children, msg);
		let message_id = comment.getReact().memoizedProps.messages[index].id;
		let message = Discord.ReactionMessages.get(message_id);
		if(message){
			let emoji = encodeURIComponent(t.querySelector("img").alt);
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
		
		/* New DOMNodeInserted */
		if(target.matches('[class*="chat-"]')){
			let textArea = target.querySelector('[class*="channelTextArea-"]');
			if(textArea) fixTextArea(textArea);
			
			let mg = document.querySelectorAll(messageGroupClass);
			if(mg){
				for(let i=0;i<mg.length;i++){
					if(checkMessageForOutput(mg[i])) continue;
					let msg = mg[i].querySelectorAll(messageClass);
					for(let i=0;i<msg.length;i++)
						checkMessageForGreenText(msg[i]);
				}
				return;
			}
		}

		let mg = target.matches(messageGroupClass)?target:target.closest(messageGroupClass);
		if(mg){
			if(checkMessageForOutput(mg)) return;
			let msg = mg.querySelectorAll(messageClass);
			for(let i=0;i<msg.length;i++)
				checkMessageForGreenText(msg[i]);
			return;
		}
		
		let umClass = '[class*="uploadModal-"]';
		let um = target.matches(umClass)?target:target.querySelector(umClass);
		if(um){
			fixImageUpload(um);
			return;
		}
		
		/* User Modal */
		if(target.matches('[class*="backdrop-"] + [class*="modal-"]')){
			let img = target.querySelector("img");
			let nameTag = target.querySelector("[class*='nameTag-']");
			
			if(img){ /* Image Modal Text */
				let src = img.src;
				let name = src.split("/").pop().split(/(\?|\#)/)[0];
				target.querySelector('[class*="imageWrapper-"]').setAttribute("filename", name);
			}else if(nameTag){ /* User Modal Date */
				let body = target.querySelector("[class*=body-]");
				body.addEventListener("DOMNodeInserted", function(e){
					let userInfo = target.querySelector("[class*='userInfoSection-']");
					if(!userInfo || userInfo.added) return;
					addUserInfo(userInfo);
				});
				function addUserInfo(userInfo){
					userInfo.added = true;
					let id = nameTag.getReact().memoizedProps.user.id;
					let createdDate = Discord.Date.fromId(id);
					let created = createdDate.toISOString().match(/(.+?)T(.+?)\./);
					let createdDiff = Discord.Date.difference(new Date(), createdDate);
					let text = created[1]+" ("+createdDiff+")";
					
					let before = userInfo.children[0];
					let first = userInfo.children[0].cloneNode(true);
					let second = userInfo.children[1].cloneNode(true);
					let textArea = second.children[0];
					first.textContent = "Creation Date";
					textArea.value = text;
					textArea.style.height = "24px";
					textArea.setAttribute("readonly", "true");
					
					userInfo.insertBefore(first, before);
					userInfo.insertBefore(second, before);
				}
				addUserInfo(target.querySelector("[class*='userInfoSection-']"));
			}
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
						xhr.getResponseHeader = function(h){
							let headers = {
								"content-type": "application/json"
							};
							return headers[h.toLowerCase()];
						}
						/*
						xhr.setProperty("status", 404);
						xhr.setProperty("readyState", 4);
						xhr.setProperty("responseText", JSON.stringify({
							"code": 0,
							"message": "404: Not Found"
						}));
						xhr.onreadystatechange();
						*/
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
				}else if(Discord.Settings.Raw.MessageModifiers.MessageModifiers.Modifiers){
					d.content = Discord.MessageModifiers.modify(Discord.Settings.Raw.MessageModifiers.MessageModifiers.Modifiers, d.content);
					data = JSON.stringify(d);
				}
			}
		}
		
		/* Block Science */
		if(!parts){
			parts = requestUrl.match(/api\/v.\/science$/);
			if(parts){
				let d = JSON.parse(data);
				discord.user = atob(d.token.split(".")[0]);
				return blockRequest();
			}
		}
		
		//if(!Discord.Settings.Raw.General.General.Greentext) return;
		/* Block Typing */
		if(!parts){
			parts = requestUrl.match(/api\/v.\/channels\/(.+?)\/typing$/);
			if(parts && Discord.Settings.Raw.General.General["Don'tSendTyping"]){
				return blockRequest();
			}
		}
		send.apply(xhr, [data]);
	}
	function blockRequest(){
		xhr.getResponseHeader = function(h){
			let headers = {
				"content-type": "application/json"
			};
			return headers[h.toLowerCase()];
		}
		xhr.setProperty("status", 404);
		xhr.setProperty("readyState", 4);
		xhr.setProperty("responseText", JSON.stringify({
			"code": 0,
			"message": "404: Not Found"
		}));
		xhr.onreadystatechange();
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

/* Proxies for removeChild and insertBefore */
/* Because why the fuck would it throw an exception and crash the whole code */
let _removeChild = HTMLElement.prototype.removeChild;
HTMLElement.prototype.removeChild = function(child){
	if(child.parentNode!=this) return child;
	return _removeChild.apply(this, arguments);
}
let _insertBefore = HTMLElement.prototype.insertBefore;
HTMLElement.prototype.insertBefore = function(child, before){
	if(before.parentNode != this) return child;
	return _insertBefore.apply(this, arguments);
}