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
	let groupClass, itemClass;
	target.querySelector('[class^="itemGroup-"]').classList.forEach(x=>x.startsWith("itemGroup-")&&(groupClass=x));
	target.querySelector('[class^="item-"]').classList.forEach(x=>x.startsWith("item-")&&(itemClass=x));
	let group = document.createElement("div");
	group.className = groupClass;
	target.insertBefore(group, target.children[0]);
	for(let i=0;i<extension.length;i++){
		let e = extension[i];
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
		color:Discord.ContextMenu.COLOR_BLUE,
		fn:downloadFile
	},
];
Discord.ContextMenu.Extension[Discord.ContextMenu.TYPE_ATTACHMENT] = [
	{
		name:"React With Text",
		color:Discord.ContextMenu.COLOR_GREEN,
		fn:reactWithText
	},
	{
		name:"Save Attachment As",
		color:Discord.ContextMenu.COLOR_BLUE,
		fn:downloadFile
	},
];
Discord.ContextMenu.Extension[Discord.ContextMenu.TYPE_MESSAGE] = [
	{
		name:"React With Text",
		color:Discord.ContextMenu.COLOR_GREEN,
		fn:reactWithText
	},
];

/* Auxiliary Functions */
function downloadFile(context){
	let r = new Discord.Request();
	r.downloadFile(context.url);
}
function reactWithText(context){
	Discord.Console.show("/react "+context.message+" ");
}










