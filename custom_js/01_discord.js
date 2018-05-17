/* Discord API */
function Discord(){
	let _this = this;
	this.headers = {};
	
	/* Utils */
	this.getUserFromChannel = function(channel, user_id){
		return new Promise(function(succ, err){
			_this.getChannel(channel).then(function(channel){
				if(channel.guild_id){
					_this.getUserFromGuild(channel.guild_id, user_id).then(function(guild_member){
						succ(guild_member);
					});
				} else {
					err();
				}
			});
		});
	}
	this.getUserIcon = function(user_id, avatar, size){
		let ext = "jpg";
		if(size){
			size = "?size="+size;
			ext = "png";
		} else {
			size = "";
		}
		return "https://cdn.discordapp.com/avatars/"+user_id+"/"+avatar+"."+ext+size;
	}
	
	/* Users */
	this.getMe = function(){
		return this.get("/users/@me");
	}
	
	/* Guilds */
	this.getUserFromGuild = function(guild, user){
		return this.get("/guilds/"+guild+"/members/"+user);
	}
	
	/* Channels */
	this.getChannel = function(channel){
		return this.get("/channels/"+channel);
	}
	
	/* Messages */
	this.sendMessage = function(channel, data){
		let content_type;
		if(!(data instanceof FormData)){
			content_type  = "application/json";
			data = JSON.stringify(data);
		}
		return this.post("/channels/"+channel+"/messages", data, content_type);
	}
	this.editMessage = function(channel, message, data){
		let content_type;
		if(!(data instanceof FormData)){
			content_type  = "application/json";
			data = JSON.stringify(data);
		}
		return this.patch("/channels/"+channel+"/messages/"+message, data, content_type);
	}
	this.deleteMessage = function(channel, message){
		return this.delete("/channels/"+channel+"/messages/"+message);
	}
	this.getMessages = function(channel){
		return this.get("/channels/"+channel+"/messages");
	}
	this.react = function(channel, message, reaction){
		return this.put("/channels/"+channel+"/messages/"+message+"/reactions/"+reaction+"/@me");
	}
	
	this.get = function(endpoint, data, content_type){
		return this.call("GET", endpoint, data, content_type);
	}
	this.post = function(endpoint, data, content_type){
		return this.call("POST", endpoint, data, content_type);
	}
	this.patch = function(endpoint, data, content_type){
		return this.call("PATCH", endpoint, data, content_type);
	}
	this.delete = function(endpoint, data, content_type){
		return this.call("DELETE", endpoint, data, content_type);
	}
	this.put = function(endpoint, data, content_type){
		return this.call("PUT", endpoint, data, content_type);
	}
	this.call = function(method, endpoint, data, content_type){
		return new Promise(function(succ){
			(function inner(){
				let xhr = new XMLHttpRequest();
				xhr.open(method, "/api/v6"+endpoint);
				if(content_type) xhr.setRequestHeader("Content-Type", content_type);
				for(let h in _this.headers)
					xhr.setRequestHeader(h, _this.headers[h]);
				xhr.onreadystatechange = function(){
					if(xhr.readyState==4){
						if(xhr.status==200 || xhr.status==204)
							succ(xhr.responseText?JSON.parse(xhr.responseText):"");
						else if(xhr.status==429){
							let retry_after = JSON.parse(xhr.responseText).retry_after;
							setTimeout(function(){
								inner();
							}, retry_after);
						}
					}
				}
				xhr.send(data);
			})();
		});
	}
}
Discord.Embed = function(){
	this.author={};
	this.thumbnail={};
	this.fields=[];
	this.image={};
	this.footer={};
	
	this.setColor = function(hex){
		hex = hex.substring(1);
		if(hex.length==3) hex = hex.replace(/(.)/g, "$1$1");
		this.color = parseInt(hex, 16);
	}
	this.setColor("#ffffff");
	
	this.setAuthorIcon = function(url){
		this.author.icon_url = url;
	};
	this.setAuthorName = function(name){
		this.author.name = name;
	};
	
	this.addField = function(name, value, inline){
		inline = !!inline;
		this.fields.push({name, value, inline});
	};
	
	this.setImage = function(url){
		this.image.url=url;
	}
	
	this.setFooterText = function(text){
		this.footer.text = text;
	};
}
Discord.Emoji = new (function(){
	this.arrow_forward = emoji("▶");
	this.arrow_backward = emoji("◀");
	
	function emoji(emoji){
		return encodeURIComponent(emoji);
	}
})();