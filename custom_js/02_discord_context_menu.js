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
	let itemClass;
	target.querySelector('[class^="item-"]').classList.forEach(x=>x.startsWith("item-")&&(itemClass=x));
	for(let i=0;i<extension.length;i++){
		let e = extension[i];
		let group = target.children[e.group];
		let item = document.createElement("div");
		item.className = itemClass;
		item.onclick = function(){
			e.fn(context);
		};
		if(e.type=="download"){
			let link = document.createElement("a");
			link.href = context.url;
			link.download = true;
			link.target = "_blank";
			link.innerHTML = e.name;
			item.appendChild(link);
		}else{
			let span = document.createElement("span");
			span.innerHTML = e.name;
			item.appendChild(span);
		}
		group.appendChild(item);
	}
}
Discord.ContextMenu.TYPE_LINK = 0;
Discord.ContextMenu.TYPE_ATTACHMENT = 1;
Discord.ContextMenu.TYPE_MESSAGE = 2;
Discord.ContextMenu.Extension = {};
Discord.ContextMenu.Extension[Discord.ContextMenu.TYPE_LINK] = [
	{
		name:"Save Link As",
		group:0,
		type:"download",
		fn:function(context){}
	},
];
Discord.ContextMenu.Extension[Discord.ContextMenu.TYPE_ATTACHMENT] = [
	{
		name:"Save Attachment As",
		group:1,
		type:"download",
		fn:function(context){}
	},
];













