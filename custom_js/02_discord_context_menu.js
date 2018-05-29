Discord.ContextMenu = function(target){
	let react = target.getReactInstance();
	let props = react.return.memoizedProps;
	let type = null;
	let context = {
		type:null,
		channel:null,
		message:null,
		url:null
	};
	console.log(react);
	if(props.src){
		context.type = Discord.ContextMenu.TYPE_LINK;
		context.url = props.href;
	}else if(props.type=="MESSAGE_MAIN"){
		if(props.attachment){
			context.type = Discord.ContextMenu.TYPE_ATTACHMENT;
			context.channel = props.channel.id;
			context.message = props.message.id;
			context.url = props.attachment.url;
		}else{
			context.type = Discord.ContextMenu.TYPE_MESSAGE;
			context.channel = props.channel.id;
			context.message = props.message.id;
		}
	}
	let extension = Discord.ContextMenu.Extension[context.type];
	if(!extension) return;
	let itemClass;
	target.querySelector('[class^="item-"]').classList.forEach(x=>x.startsWith("item-")&&(itemClass=x));
	for(let i=0;i<extension.length;i++){
		let e = extension[i];
		let group = target.children[e.group];
		let item = document.createElement("div");
		item.className = itemClass;
		item.onclick = function(){
			target.style.display="none";
			e.fn(context);
		};
		let span = document.createElement("span");
		span.innerHTML = e.name;
		span.style.color = e.color;
		item.appendChild(span);
		group.appendChild(item);
	}
}

/* Context Menu Type */
Discord.ContextMenu.TYPE_LINK = 0;
Discord.ContextMenu.TYPE_ATTACHMENT = 1;
Discord.ContextMenu.TYPE_MESSAGE = 2;

/* Context Menu Colors */
Discord.ContextMenu.COLOR_RED = "#ef4646";
Discord.ContextMenu.COLOR_GREEN = "#43b55f";
Discord.ContextMenu.COLOR_BLUE = "#0096cf";

/* Extensions */
Discord.ContextMenu.Extension = {};
Discord.ContextMenu.Extension[Discord.ContextMenu.TYPE_LINK] = [
	{
		name:"Save Link As",
		group:0,
		color:Discord.ContextMenu.COLOR_BLUE,
		fn:downloadFile
	},
];
Discord.ContextMenu.Extension[Discord.ContextMenu.TYPE_ATTACHMENT] = [
	{
		name:"Save Attachment As",
		group:1,
		color:Discord.ContextMenu.COLOR_BLUE,
		fn:downloadFile
	},
	{
		name:"React With Text",
		group:1,
		color:Discord.ContextMenu.COLOR_GREEN,
		fn:reactWithText
	},
];
Discord.ContextMenu.Extension[Discord.ContextMenu.TYPE_MESSAGE] = [
	{
		name:"React With Text",
		group:1,
		color:Discord.ContextMenu.COLOR_GREEN,
		fn:reactWithText
	},
];

/* Auxiliary Functions */
function downloadFile(context){
	let name = context.url.split("/");
	name = name[name.length-1];
	let extension = name.split(".");
	if(extension.length==1){
		extension = undefined;
	}else{
		extension = extension[extension.length-1];
	}
	let location = _dialog.showSaveDialog({defaultPath:name});
	let location_extension = location.split(".");
	if(location_extension.length==1 && extension){
		location = location+"."+extension;
	}
	let r = new Discord.Request();
	r.downloadFile(context.url, location);
}
function reactWithText(context){
	Discord.Console.show("/react "+context.message+" ");
}










