let messageGroupClass = "[class*='containerCozy-'][class*='container-'], [class*='containerCompact-'][class*='container-']";
let messageClass = "[class*='contentCozy-'][class*='content'], [class*='contentCompact-'][class*='content']";
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
	let react = child.getReact();
	if(!react) return;
	let nonce = react.memoizedProps.message.id;
	if(Discord.Nonces.has(nonce)){
		child.parentNode.parentNode.style.display = "none";
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
	let t = textarea.querySelector('[class*="textArea-"]');
	Discord.Line.appendTo(t.nextElementSibling);
	function setLength(length){
		if(!Discord.Settings.Raw.General.General.CharacterCount) return;
		if(!length)
			inner.removeAttribute("count");
		else
			inner.setAttribute("count", length);
	}
	t.addEventListener("input", function(e){
		let innerReact = inner.getReact();
		let innerProps = innerReact.memoizedProps;
		let realText = innerProps.preprocessInsertedText(innerProps.textValue);
		setLength(realText.length);
	});
	t.addEventListener("keypress", function(e){
		if(e.altKey || e.ctrlKey || e.shiftKey) return;
		if(e.key == "Enter")
			setLength();
	});
	setLength(t.textContent.length);
}
function fixModal(target){
	let img = target.querySelector("img");
	let nameTag = target.querySelector("[class*='nameTag-']");
	let uploadModal = target.querySelector('[class*="uploadModal-"]');
	
	if(uploadModal){ /* Upload Modal */
		fixImageUpload(uploadModal);
	}else if(nameTag){ /* User Modal Date */
		let body = target.querySelector("[class*=body-]");
		body.addEventListener("DOMNodeInserted", function(e){
			let userInfo = target.querySelector("[class*='userInfoSection-']");
			if(!userInfo || userInfo.added) return;
			addUserInfo(userInfo);
		});
		function addUserInfo(userInfo){
			userInfo.added = true;
			let id = nameTag.getReact().return.memoizedProps.user.id;
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
	}else if(img){ /* Image Modal Text */
		let src = img.src;
		let name = src.split("/").pop().split(/(\?|\#)/)[0];
		target.querySelector('[class*="imageWrapper-"]').setAttribute("filename", name);
	}
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
		let message_id = msg.getReact().memoizedProps.message.id;
		let message = Discord.ReactionMessages.get(message_id);
		if(message){
			let emoji = encodeURIComponent(t.querySelector("img").alt);
			message.react(emoji);
			e.stopImmediatePropagation();
		}
	}
}, true);

/* Mutation Observers */
(function(){
	document.waitFor('[class*="app-"] > [class*="layers-"]').then(settingsParent => {
		settingsParent.onMutation('addedNodes', e => {
			Discord.Settings(e)
		});
	});
	
	document.waitFor("#app-mount > [data-no-focus-lock]").then(zLayersParent => {
		let contextMenuParent = zLayersParent.children[2];
		contextMenuParent.onMutation('addedNodes', e => {
			Discord.ContextMenu(e);
		});
		
		let modalsParent = zLayersParent.children[1];
		modalsParent.onMutation('addedNodes', e => {
			if(e.matches('[class*="backdrop-"] + [class*="modal-"]'))
				fixModal(e);
		});
	});
	
	document.waitFor('[class*="chat-"]').then(chat => {
		let chatParent = chat.parentNode;
		chatParent.onMutation('addedNodes', e => {
			if(e.matches('[class*="chat-"]'))
				observeChat(e);
		});
		
		observeChat(chat);
		function observeChat(chat){
			let messagesParent = chat.children[1];
			if(!messagesParent.observer)
				messagesParent.observer = messagesParent.onMutation('addedNodes', e => {
					let textArea = e.querySelector('[class*="channelTextArea-"]');
					if(textArea) fixTextArea(textArea);
					
					let scroller = e.querySelector('[class*="scroller-"]');
					checkMessages(scroller);
					observeMessages(scroller);
				});
			
			let textArea = chat.querySelector('[class*="channelTextArea-"]');
			if(textArea) fixTextArea(textArea);
			let scroller = messagesParent.querySelector('[class*="scroller-"]');
			checkMessages(scroller);
			observeMessages(scroller);
			function observeMessages(messagesContainer){
				if(!messagesContainer.observer){
					messagesContainer.observer = messagesContainer.onMutation('addedNodes', e => {
						if(!e.matches(messageGroupClass)) return;
						let msg = e.querySelectorAll(messageClass);
						for(let i=0;i<msg.length;i++){
							if(checkMessageForOutput(msg[i])) continue;
							checkMessageForGreenText(msg[i]);
						}
						return;
					});
				}
			}
			function checkMessages(messageParent){
				let mg = messageParent.querySelectorAll(messageGroupClass);
				if(mg){
					for(let i=0;i<mg.length;i++){
						let msg = mg[i].querySelectorAll(messageClass);
						for(let i=0;i<msg.length;i++){
							if(checkMessageForOutput(msg[i])) continue;
							checkMessageForGreenText(msg[i]);
						}
					}
				}
			}
		}
	});
})();


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
				if(d.content.startsWith("/help")){
					d.content = commands.run(d.content, channel);
					sendBotMessage(xhr, d.content, d.nonce);
					return;
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