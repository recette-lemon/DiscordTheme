Discord.CommandParser = function(){
	let _this = this;
	let alias = {};
	let aliasB4 = {};
	let aliasList = {};
	let commands = {};
	let shadowCommands = {};
	
	this.list = function(){
		let list = [];
		for(let name in commands){
			list.push(name);
		}
		return list;
	}
	this.listAliases = function(original){
		return aliasList[original];
	}
	
	/* A shadow command cannot be called directly, only through an alias. */
	this.add = function(name, run, help, shadow){
		commands[name] = {name, run, help};
		if(shadow) shadowCommands[name] = true;
	}
	this.alias = function(original, name, before){
		alias[name] = original;
		aliasB4[name] = before?before:function(){};
		if(!aliasList[original]) aliasList[original] = [];
		aliasList[original].push(name);
	}
	
	this.run = function(message, channel){
		try{
			if(message[0]=="/"){
				let m = message.substring(1);
				let parts = m.split(/\s+/);
				let first = parts[0];
				if(!shadowCommands[first] && alias[first])
					return commands[alias[first]].run(channel, m, parts, aliasB4[first]());
				if(!shadowCommands[first] && commands[first])
					return commands[first].run(channel, m, parts);
				return _this.else(channel, m, parts);
			}
			return _this.catch(channel, message);
		}catch(e){
			console.log(e);
			return true;
		}
	}
	/* Run when no known command was found */
	this.else = function(){return false};
	/* Run when the message is not a command (doesn't start with /) */
	this.catch = function(){return false};
	
	this.help = function(name){
		let n = alias[name]?alias[name]:name;
		if(!shadowCommands[name] && commands[n])
			return commands[n].help();
	}
};
let commands = new Discord.CommandParser();
commands.add("help", function(channel, full, parts){
	let name = parts[1];
	if(name){
		return {content:commands.help(name), bot:true};
	}else{
		let list = commands.list();
		let text = "";
		for(let i=0;i<list.length;i++){
			let aliases = commands.listAliases(list[i]);
			text += list[i];
			if(aliases) text += " (Aliases: "+aliases.join(", ")+")";
			text += "\n";
		}
		let content = "Do ``/help <command>`` to get more information about commands.\n";
		content += "```\n"+text+"\n```";
		return {content, bot:true};
	}
}, function(){
	return "Are you retarded?";
});
commands.add("search", function(channel, full, parts){
	parts.shift();
	let s = new Discord.Search(parts.shift());
	s.search(parts.join(" "), channel);
	return true;
}, function(){
	let list = (new Discord.Search()).list().join(", ");
	let text = "```\n/search <engine> <query>\n```\n";
	text += "Will search your query on the specified engine.\n";
	text += "Engines: "+list;
	return text;
});
commands.add("img", function(channel, full, parts){
	parts.shift();
	let s = new Discord.Search();
	s.search(parts.join(" "), channel);
	return true;
}, function(){
	let text = "```\n/img <query>\n```\n";
	text += "Will search your query on Google Images.\n";
	return text;
});
commands.add("image", function(channel, full, parts){
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
}, function(){
	let text = "```\n/image <filter>\n```\n";
	text += "Will search the images folder for an image containing your filter word and post it.\n";
	return text;
});
commands.add("constanza", function(channel, full, parts){
	let images = new Discord.File("images").list(parts[0]+"\.");
	parts.shift();
	images[0].read().then(function(file){
		let form = new FormData();
		form.append("content", parts.join(" "));
		form.append("file", file);
		discord.sendMessage(channel, form);
	});
	return true;
}, function(){
	let text = "```\n/constanza <message>\n```\n";
	text += "Will post the image constanza from the images folder with the message attached.\n";
	return text;
});
commands.add("duck", function(channel, full, parts){
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
}, function(){
	let text = "```\n/duck <message>\n```\n";
	text += "Will post the image duck from the images folder with the message written on top of the image in impact font.\n";
	return text;
});
commands.add("info", function(channel, full, parts){
	let user_id = parts[1].match(/^<@\!?(.+)>$/)[1];
	discord.getUserFromChannel(channel, user_id).then(function(guild_member){
		let embed = new Discord.Embed();
		let icon = discord.getUserIcon(user_id, guild_member.user.avatar, 2048);
		embed.setAuthorIcon(icon);
		embed.setAuthorName(guild_member.nick?guild_member.nick:guild_member.user.username);
		embed.setImage(icon);
		let joinedDate = new Date(Date.parse(guild_member.joined_at));
		let joined = guild_member.joined_at.match(/(.+?)T(.+?)\./);
		let joinedDiff = Discord.Date.difference(new Date(), joinedDate);
		embed.addField("Joined Server:", joined[1]+" ("+joinedDiff+")");
		let createdDate = Discord.Date.fromId(user_id);
		let created = createdDate.toISOString().match(/(.+?)T(.+?)\./);
		let createdDiff = Discord.Date.difference(new Date(), createdDate);
		embed.addField("Created Account:", created[1]+" ("+createdDiff+")");
		discord.sendMessage(channel, {content:"", embed});
	}, function(){
		discord.getUser(user_id).then(function(user){
			let embed = new Discord.Embed();
			let icon = discord.getUserIcon(user_id, user.avatar, 2048);
			embed.setAuthorIcon(icon);
			embed.setAuthorName(user.username);
			embed.setImage(icon);
			let createdDate = Discord.Date.fromId(user_id);
			let created = createdDate.toISOString().match(/(.+?)T(.+?)\./);
			let createdDiff = Discord.Date.difference(new Date(), createdDate);
			embed.addField("Created Account:", created[1]+" ("+createdDiff+")");
			discord.sendMessage(channel, {content:"", embed});
		});
	});
	return true;
}, function(){
	let text = "```\n/info <mention>\n```\n";
	text += "Will show information about the user mentioned.\n";
	text += "This can be quickly shown by clicking 'Get Info' on the user context menu.\n";
	return text;
});
commands.add("react", function(channel, full, parts){
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
}, function(){
	let text = "```\n/react <message_id> <text>\n```\n";
	text += "Will react to the message with emojis that make up your text.\n";
	text += "A quicker way to react is to use the 'React With Text' on the message's context menu.\n";
	return text;
});
commands.add("8ball", function(channel, full, parts){
	parts.shift();
	let answers = ['Maybe.', 'Certainly not.', 'I hope so.', 'Not in your wildest dreams.', 'There is a good chance.', 'Quite likely.', 'I think so.', 'I hope not.',  'I hope so.', 'Never!', 'Fuhgeddaboudit.', 'Ahaha! Really?!?', 'Pfft.', 'Sorry, bucko.', 'Hell, yes.', 'Hell to the no.', 'The future is bleak.', 'The future is uncertain.', 'I would rather not say.', 'Who cares?',  'Possibly.', 'Never, ever, ever.', 'There is a small chance.', 'Yes!'];
	let top = parts.join(" ");
	top = top?top:"What does the 8ball say?";
	let embed = new Discord.Embed();
	embed.setAuthorIcon("https://cdn.discordapp.com/attachments/336483154858737674/377602724700618755/8ballxd.png");
	embed.setAuthorName("8Ball");
	embed.setColor("#000000");
	embed.addField(top, answers[(Math.random()*answers.length)|0]);
	return {content:"", embed};
}, function(){
	let text = "```\n/8ball <message>\n```\n";
	text += "How do i 8ball?\n";
	return text;
});
commands.add("fortune", function(channel, full, parts){
	parts.shift();
	let answers = [
		{name: "Reply hazy, try again", color:"#F51C6A"},
		{name: "Excellent Luck", color:"#FD4D32"},
		{name: "Good Luck", color:"#E7890C"},
		{name: "Average Luck", color:"#BAC200"},
		{name: "Bad Luck", color:"#7FEC11"},
		{name: "Good news will come to you by mail", color:"#43FD3B"},
		{name: "（　´_ゝ`）ﾌｰﾝ", color:"#16F174"},
		{name: "ｷﾀ━━━━━━(ﾟ∀ﾟ)━━━━━━ !!!!", color:"#00CBB0"},
		{name: "You will meet a dark handsome stranger", color:"#0893E1"},
		{name: "Better not tell you now", color:"#2A56FB"},
		{name: "Outlook good", color:"#6023F8"},
		{name: "Very Bad Luck", color:"#9D05DA"},
		{name: "Godly Luck", color:"#D302A7"},
		{name: "(YOU ARE BANNED)", color:"#FF0000"}
	];
	let top = parts.join(" ");
	top = top?top:"What is my fortune?";
	let answer = answers[(Math.random()*answers.length)|0];
	let embed = new Discord.Embed();
	embed.setAuthorIcon("https://i.imgur.com/Lp9JIbf.png");
	embed.setAuthorName("Fortune");
	embed.setColor(answer.color);
	embed.addField(top, answer.name);
	return {content:"", embed};
}, function(){
	let text = "```\n/fortune <message>\n```\n";
	text += "Have your fortune taken.\n";
	return text;
});
commands.add("delete", function(channel, full, parts){
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
}, function(){
	let text = "```\n/delete <amount>\n```\n";
	text += "Will delete the amount of your messages specified present only in the last 50 channel messages.\n";
	return text;
});
commands.add("penis", function(channel, full, parts){
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
}, function(){
	let text = "```\n/penis <mention>\n```\n";
	text += "Shows the penis size of the user mentioned through some crazy math based on the user's id.\n";
	return text;
});
commands.add("iq", function(channel, full, parts){
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
}, function(){
	let text = "```\n/iq <mention>\n```\n";
	text += "Shows the iq of the user mentioned through some crazy math based on the user's id.\n";
	return text;
});
commands.add("roll", function(channel, full, parts){
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
}, function(){
	let text = "```\n/roll <message>\n```\n";
	text += "Time to get those repeating digits.\n";
	return text;
});
commands.add("loop", function(channel, full, parts){
	parts.shift();
	let n = parts.shift();
	let content = parts.join(" ");
	let rq = new Discord.RequestQueue();
	for(let i=0;i<n;i++){
		rq.add(function(callback){
			discord.sendMessage(channel, {content}).then(callback, callback);
		});
	}
	rq.run();
	return true;
}, function(){
	let text = "```\n/loop <amount> <message>\n```\n";
	text += "Will send the message the specified amount of times.\n";
	text += "The message can be a command."
	return text;
});
commands.add("verb", function(channel, full, parts, context){
	parts.shift();
	let top_text = "";
	let bottom_text = context[0]+" "+parts.join(" ");
	discord.getUserFromChannel(channel, discord.user).then(function(guild_member){
		let name = guild_member.nick?guild_member.nick:guild_member.user.username;
		let embed = new Discord.Embed();
		embed.description = name+" "+bottom_text;
		embed.setImage(context[1]);
		discord.sendMessage(channel, {content:top_text, embed});
	}, function(){
		discord.getMe().then(function(me){
			let embed = new Discord.Embed();
			embed.description = me.username+" "+bottom_text;
			embed.setImage(context[1]);
			discord.sendMessage(channel, {content:top_text, embed});
		});
	});
	return true;
}, function(){
	let text = "```\n/<verb> <message>\n```\n";
	text += "Will send an embed with the verb specified with the message attached.\n";
	text += "Possible verbs: "+commands.listAliases("verb").join(", ");
	return text;
}, true);
commands.alias("verb", "dab", function(){return ["dabbed", "https://i.imgur.com/BhFwhOb.jpg"]});
commands.alias("verb", "kiss", function(){return ["kissed", "https://i.imgur.com/eisk88U.gif"]});
commands.alias("verb", "kill", function(){return ["killed", "https://i.imgur.com/3hIgEF5.png"]});
commands.alias("verb", "awoo", function(){return ["awooed", "https://i.imgur.com/9LG19PH.jpg"]});
commands.alias("verb", "pat", function(){return ["patted", "https://i.imgur.com/uRc2B0v.gif"]});
commands.catch = function(channel, message){
	if(message.trim().match(/^https?:\/\/[^ \r\n#]+(jpg|gif|png|jpeg)(\?[^ ]*)?$/i)){
		let r = new Discord.Request();
		r.getFile(message.trim()).then(function(file){
			let form = new FormData();
			form.append("content", "");
			form.append("file", file);
			discord.sendMessage(channel, form);
		}).catch(function(err, res){
			let embed = new Discord.Embed();
			embed.setImage(message.trim());
			discord.sendMessage(channel, {content:"", embed});
		});
		return true;
	}
};

/* Utils */
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