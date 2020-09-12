(function(){

	// Intercept discord code to proxy message parse library
	// + look for own user and set premium
	let n_of_calls = 2;
	let _call = Function.prototype.call;
	function reset(){if(--n_of_calls==0)Function.prototype.call=_call;}
	Function.prototype.call = function(){

		[...arguments].forEach(a => {
			if(a&&a.user&&a.user.hasOwnProperty('premiumType')&&a.link=="/channels/@me"){
				if(Discord.Settings.Raw.FakeNitro.General.FakeNitro)
					a.user.premiumType = 2;
				reset();
			}
		});

		// Start by calling the function since I need the changes to the arguments
		let result = _call.apply(this, arguments);

		let args = [...arguments];
		let thisArg = args.shift();
		let argumentsList = args;

		// Check if arguments follow a similar pattern to that being called by discord
		// Also check if unparse was defined by the function call
		if(thisArg && argumentsList[0] && thisArg == argumentsList[0].exports && thisArg.default && thisArg.default.unparse){
			let def = thisArg.default;

			// Intercept message parsing and call own message parser
			let _parse = def.parse;
			def.parse = function(channel, content, bool1, bool2){
				let result = _parse.apply(this, arguments);
				let message = result.content;

				// These bools should be false if its not sending the message
				if(bool1 !== false || bool2 !== false)
					result.content = parseMessage(channel, result.content);

				return result;
			}

			DT.parse = function(content){
				let chat = document.querySelector('[class*="chat-"]');
				let channel = chat.getReact().memoizedProps.channel;
				return _parse(channel, content).content;
			}

			// After proxying message parser undo function call interception
			reset();
		}

		return result;
	}

	function parseMessage(channel, message){
		// Quick fix for help command
		// Can't think of a better way right now
		if(message.startsWith("/help")) return message;

		// Trying to run command
		let data = commands.run(message, channel.id);
		if(!data && Discord.Settings.Raw.MessageModifiers.MessageModifiers.Modifiers){ // Not a command AND message modifiers are active
			return Discord.MessageModifiers.modify(Discord.Settings.Raw.MessageModifiers.MessageModifiers.Modifiers, message);
		}else if(!data){ // Not a command
			return message;
		}

		// If it's a command return empty message so discord blocks the message
		return "";
	}
})();
