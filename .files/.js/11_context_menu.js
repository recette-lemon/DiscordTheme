Discord.ContextMenu = function(target){
	if(!target.matches('[class*="layer-"]') || !target.children[0].matches('[class*="menu-"]'))
		return false;
	target = target.children[0];

	/*
	let react = target.getReact();
	if(react.child.child.memoizedProps.type) react = react.child.child;
	else if(react.return.memoizedProps.type) react = react.return;
	let props = react.memoizedProps;
	*/

	let react = target.getReactReturn(0, 1);
	let props = react.memoizedProps;
	let type = null;
	if(props.user)					type = "USER";
	else if(props.guild)		type = "GUILD";
	else if(props.message)	type = "MESSAGE";
	else if(props.src)			type = "NATIVE_IMAGE";

	let context = {
		type:null,
		user:null,
		guild:null,
		channel:null,
		message:null,
		url:null
	};

	switch(type){
		case "NATIVE_IMAGE":{
			context.type = Discord.ContextMenu.TYPE_LINK;
			context.url = props.href?props.href:props.src;
			context.target = props.target;
			break;
		}
		case "MESSAGE":
		case "MESSAGE_MAIN":{
			if(props.attachment){
				context.type = Discord.ContextMenu.TYPE_ATTACHMENT;
				context.url = props.attachment.url;
			}else{
				context.type = Discord.ContextMenu.TYPE_MESSAGE;
			}
			context.guild = props.channel.guild_id;
			context.channel = props.channel.id;
			context.message = props.message.id;
			context.content = props.message.content;
			context.target = props.target;
			context.user = props.message.author.id;

			context._message = props.message;
			context._user = props.message.author;
			break;
		}
		case "GUILD":
		case "GUILD_ICON_BAR":{
			context.type = Discord.ContextMenu.TYPE_GUILD;
			context.guild = props.guild.id;
			context.channel = discord.getCurrentChannel();
			break;
		}
		case "USER":
		case "USER_GROUP_DM":
		case "USER_CHANNEL_MEMBERS":
		case "USER_CHANNEL_MESSAGE":
		case "USER_CHANNEL_MENTION":
		case "USER_PRIVATE_CHANNELS_MESSAGE":{
			context.type = Discord.ContextMenu.TYPE_USER;
			context.user = props.user.id;
			context.channel = props.channelId||props.channel.id;
			break;
		}
	}
	let extension = Discord.ContextMenu.Extension[context.type];
	if(!extension) return;
	function getClass(target, c){
		let name;
		target.querySelector('[class*="'+c+'-"]').classList.forEach(x=>x.startsWith(c+"-")&&(name=x));
		return name;
	}
	let targetParent = target.querySelector('[class*="scroller-"]');
	let groupClass = "group";//getClass(target, "itemGroup");
	let itemClass = getClass(target, "item");
	let itemBaseClass = "";//getClass(target, "itemBase");
	let clickableClass = "";//getClass(target, "clickable");
	let labelContainerClass = getClass(target, "labelContainer");

	let group = document.createElement("div");
	group.className = groupClass;
	targetParent.insertBefore(group, targetParent.children[0]);
	for(let i=0;i<extension.length;i++){
		if(!createItem(extension[i], group))continue;
	}
	props.onHeightUpdate();
	function createItem(e, parent){
		if(e.filter && !e.filter(context)) return false;
		let item = document.createElement("div");
		item.className = `${itemClass} ${labelContainerClass} ${itemBaseClass} ${clickableClass}`;
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
				// Click makes context menu disappear
				document.body.click();
				e.fn(context);
				/* Don't remember why I used timeout
				setTimeout(function(){
					e.fn(context);
				}, 1000);
				*/
			};
		}

		let color = e.color||Discord.ContextMenu.COLOR_WHITE;
		let span = document.createElement("span");
		span.innerHTML = e.name;
		span.style.color = color;
		item.appendChild(span);
		parent.appendChild(item);

		item.addEventListener('mouseover', e => {
			let focused = targetParent.querySelector('[class*="focused-"]');
			if(focused){
				let fclass = getClass(targetParent, "focused");
				focused.classList.remove(fclass);
				target.getReactInstance().memoizedProps.onMouseLeave();
			}

			let background = color.startsWith('var')?'#5c6fb1':color;
			item.style.background = background;
			span.style.color = "white";
		});
		item.addEventListener('mouseout', e => {
			item.style.background = "";
			span.style.color = color;
		});

		return true;
	}
	return true;
}

/* Context Menu Type */
Discord.ContextMenu.TYPE_LINK = 0;
Discord.ContextMenu.TYPE_ATTACHMENT = 1;
Discord.ContextMenu.TYPE_MESSAGE = 2;
Discord.ContextMenu.TYPE_USER = 3;
Discord.ContextMenu.TYPE_GUILD = 4;

/* Context Menu Colors */
Discord.ContextMenu.COLOR_WHITE = "var(--interactive-normal)";
Discord.ContextMenu.COLOR_RED = "#ef4646";
Discord.ContextMenu.COLOR_GREEN = "#43b55f";
Discord.ContextMenu.COLOR_BLUE = "#0096cf";
Discord.ContextMenu.COLOR_ORANGE = "#faa61a";

(function(){

	/* Auxiliary Functions */
	function downloadFile(context){
		let r = new Discord.Request();
		r.downloadFile(context.url);
	}
	function reactWithText(context){
		Discord.Console.show("/react "+context.message+" ");
	}
	function isImg(context){return context.target.tagName=="IMG";}
	function isVideo(context){return context.target.tagName=="VIDEO";}

	/* Auxiliary Objects */
	let reverseImageGoogle = {
		name:"Reverse Image (Google)",
		filter:isImg,
		fn:function(context){
			window.open("http://www.google.com/searchbyimage?image_url="+encodeURIComponent(context.url));
		}
	};
	let reverseImageIQDB = {
		name:"Reverse Image (iqdb)",
		filter:isImg,
		fn:function(context){
			window.open("http://www.iqdb.org/?url="+encodeURIComponent(context.url));
		}
	};
	let react = {
		name:"React With Text",
		color:Discord.ContextMenu.COLOR_GREEN,
		fn:reactWithText
	};
	let clipboard = {
		name: "Copy Image",
		color:Discord.ContextMenu.COLOR_BLUE,
		fn: function(context){
			let req = new Discord.Request();
			req.getBuffer(context.url).then(buffer => {
				let nativeImage = _electron.nativeImage.createFromBuffer(buffer);
				_electron.clipboard.writeImage(nativeImage, "clipboard");
			});
		}
	};
	let quote = {
		name: "Quote",
		color:Discord.ContextMenu.COLOR_ORANGE,
		fn: function(context){
			let ids = [context.guild, context.channel, context.message].join('/');
			let url = "https://discordapp.com/channels/"+ids;

			let icon = discord.getUserIcon(context.user, context._user.avatar, 128, "webp");
			let embed = new Discord.Embed();
			embed.setAuthorName(context._user.username);
			embed.setAuthorIcon(icon);
			embed.setDiscordColor();
			embed.addField("Mention", `<@${context.user}>`, true);
			embed.addField("Link", `[Go to Message](${url})`, true);

			let useContent = true;
			if(context._message.embeds && context._message.embeds.length){
				let embeds = context._message.embeds;
				for(let i=0;i<embeds.length;i++){
					let e = embeds[i];
					if(e.image){
						useContent = !context.content.match(/^https?:\/\/[^\s]+$/);
						embed.setImage(e.image.url);
						break;
					}
					if(e.thumbnail){
						embed.setImage(e.thumbnail.url);
						break;
					}
				}
			}

			if(context.url)
				embed.setImage(context.url);


			if(useContent && context.content)
				embed.addField("Message", context.content);

			discord.sendMessage(context.channel, {content:"", embed});
		}
	};
	let loop = {
		name:"Loop Video",
		filter:isVideo,
		color:Discord.ContextMenu.WHITE,
		fn: function(context){
			context.target.loop = true;
		}
	};

	/* Extensions */
	Discord.ContextMenu.Extension = {};
	Discord.ContextMenu.Extension[Discord.ContextMenu.TYPE_LINK] = [
		reverseImageGoogle,
		reverseImageIQDB,
		// {
		// 	name:"Save Link As",
		// 	color:Discord.ContextMenu.COLOR_BLUE,
		// 	fn:downloadFile
		// },
		// clipboard
	];
	Discord.ContextMenu.Extension[Discord.ContextMenu.TYPE_ATTACHMENT] = [
		reverseImageGoogle,
		reverseImageIQDB,
		quote,
		react,
		loop,
		// {
		// 	name:"Save Attachment As",
		// 	color:Discord.ContextMenu.COLOR_BLUE,
		// 	fn:downloadFile
		// },
		// clipboard
	];
	Discord.ContextMenu.Extension[Discord.ContextMenu.TYPE_MESSAGE] = [
		react,
		quote
	];
	Discord.ContextMenu.Extension[Discord.ContextMenu.TYPE_USER] = [
		{
			name:"Get Info",
			color:Discord.ContextMenu.COLOR_ORANGE,
			fn:function(context){
				commands.run("/info <@"+context.user+">", context.channel);
			}
		},
	];
	Discord.ContextMenu.Extension[Discord.ContextMenu.TYPE_GUILD] = [
		{
			name:"Get Info",
			color:Discord.ContextMenu.COLOR_ORANGE,
			fn:function(context){
				commands.run("/server "+context.guild, context.channel);
			}
		},
	];


})();
