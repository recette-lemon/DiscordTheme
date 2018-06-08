Discord.ContextMenu = function(target){
	if(!(target.className.startsWith("contextMenu") && target.parentNode.id=="app-mount")) return false;
	let react = target.getReactInstance();
	let props = react.return.memoizedProps;
	let type = null;
	let context = {
		type:null,
		user:null,
		channel:null,
		message:null,
		url:null
	};
	switch(props.type){
		case "NATIVE_IMAGE":{
			context.type = Discord.ContextMenu.TYPE_LINK;
			context.url = props.href?props.href:props.src;
			context.target = props.target;
			break;
		}
		case "MESSAGE_MAIN":{
			if(props.attachment){
				context.type = Discord.ContextMenu.TYPE_ATTACHMENT;
				context.channel = props.channel.id;
				context.message = props.message.id;
				context.url = props.attachment.url;
				context.target = props.target;
			}else{
				context.type = Discord.ContextMenu.TYPE_MESSAGE;
				context.channel = props.channel.id;
				context.message = props.message.id;
				context.target = props.target;
			}
			break;
		}
		case "USER_CHANNEL_MEMBERS":
		case "USER_CHANNEL_MESSAGE":
		case "USER_CHANNEL_MENTION":
		case "USER_PRIVATE_CHANNELS_MESSAGE":{
			context.type = Discord.ContextMenu.TYPE_USER;
			context.user = props.user.id;
			context.channel = props.channelId;
			break;
		}
	}
	let extension = Discord.ContextMenu.Extension[context.type];
	if(!extension) return;
	function getClass(target, c){
		let name;
		target.querySelector('[class^="'+c+'-"]').classList.forEach(x=>x.startsWith(c+"-")&&(name=x));
		return name;
	}
	let groupClass = getClass(target, "itemGroup");
	let itemClass = getClass(target, "item");
	let group = document.createElement("div");
	group.className = groupClass;
	target.insertBefore(group, target.children[0]);
	for(let i=0;i<extension.length;i++){
		if(!createItem(extension[i], group))continue;
	}
	function createItem(e, parent){
		if(e.filter && !e.filter(context)) return false;
		let item = document.createElement("div");
		item.className = itemClass;
		if(e.sub){
			item.className+=" itemSubMenu-1vN_Yn";//HARDCODED class name
			let menu = document.createElement("div");
			menu.className = target.className;
			for(let j=0;j<e.sub.length;j++){
				if(!createItem(e.sub[j], menu))continue;
			}
			item.addEventListener("mouseover", function(){
				let rects = item.getClientRects()[0];
				menu.style.top = rects.top+"px";
				menu.style.left = rects.left+"px";
				item.appendChild(menu);
			});
			item.addEventListener("mouseout", function(e){
				let cm = e.toElement.closest("[class^='contextMenu']");
				if(!cm || (cm && cm.closest("."+itemClass) !== item))
					item.removeChild(menu);
			});
		}else{
			item.onclick = function(){
				target.style.display="none";
				setTimeout(function(){
					e.fn(context);
				}, 15);
			};
		}
		let span = document.createElement("span");
		span.innerHTML = e.name;
		span.style.color = e.color;
		item.appendChild(span);
		parent.appendChild(item);
		return true;
	}
	return true;
}

/* Context Menu Type */
Discord.ContextMenu.TYPE_LINK = 0;
Discord.ContextMenu.TYPE_ATTACHMENT = 1;
Discord.ContextMenu.TYPE_MESSAGE = 2;
Discord.ContextMenu.TYPE_USER = 3;

/* Context Menu Colors */
Discord.ContextMenu.COLOR_RED = "#ef4646";
Discord.ContextMenu.COLOR_GREEN = "#43b55f";
Discord.ContextMenu.COLOR_BLUE = "#0096cf";

/* Auxiliary Functions */
function downloadFile(context){
	let r = new Discord.Request();
	r.downloadFile(context.url);
}
function reactWithText(context){
	Discord.Console.show("/react "+context.message+" ");
}
function isImg(context){return context.target.tagName=="IMG";}

/* Auxiliary Objects */
let reverseImage = {
	name:"Search Image On",
	filter:isImg,
	sub:[
		{
			name:"Google",
			fn:function(context){
				window.open("http://www.google.com/searchbyimage?image_url="+encodeURIComponent(context.url));
			}
		},
		{
			name:"Iqdb",
			fn:function(context){
				window.open("http://www.iqdb.org/?url="+encodeURIComponent(context.url));
			}
		}
	]
};
let react = {
	name:"React With Text",
	color:Discord.ContextMenu.COLOR_GREEN,
	fn:reactWithText
};

/* Extensions */
Discord.ContextMenu.Extension = {};
Discord.ContextMenu.Extension[Discord.ContextMenu.TYPE_LINK] = [
	reverseImage,
	{
		name:"Save Link As",
		color:Discord.ContextMenu.COLOR_BLUE,
		fn:downloadFile
	},
];
Discord.ContextMenu.Extension[Discord.ContextMenu.TYPE_ATTACHMENT] = [
	reverseImage,
	react,
	{
		name:"Save Attachment As",
		color:Discord.ContextMenu.COLOR_BLUE,
		fn:downloadFile
	},
];
Discord.ContextMenu.Extension[Discord.ContextMenu.TYPE_MESSAGE] = [
	react
];
Discord.ContextMenu.Extension[Discord.ContextMenu.TYPE_USER] = [
	{
		name:"Get Info",
		fn:function(context){
			discord.sendMessage(context.channel, {content:"/info <@"+context.user+">"});
		}
	},
];








