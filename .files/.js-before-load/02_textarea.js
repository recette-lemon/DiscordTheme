window.addEventListener('keydown', e => {
	let newValue = "";
	let t = e.target;
	let channel = discord.getCurrentChannel();
	if(e.key!='Enter' || e.ctrlKey || e.altKey || e.shiftKey) return;
	if(!t.matches || !t.matches('[class*="channelTextArea-"] [class*="textArea-"], [class*="channelTextArea-"] [class*="slateTextArea-"]')) return;
	
	let channelTextArea = t.closest('[class*="channelTextArea-"]');
	let inner = channelTextArea.children[0];
	if(inner.querySelector('[class*="autocomplete-"]')) return;
	
	document.execCommand("selectAll");
	let textValue = window.getSelection().toString();
	
	let innerReact = inner.getReact();
	let innerProps = innerReact.memoizedProps;
	let message = innerProps.preprocessInsertedText(textValue);
	
	// Quick fix for help command
	// Can't think of a better way right now
	if(message.startsWith("/help")) return;
	
	// Trying to run command
	let data = commands.run(message, channel);
	if(!data && Discord.Settings.Raw.MessageModifiers.MessageModifiers.Modifiers){ // Not a command AND message modifiers are active
		newValue = Discord.MessageModifiers.modify(Discord.Settings.Raw.MessageModifiers.MessageModifiers.Modifiers, message);
	}else if(!data){ // Not a command
		return; // Return since there's no need to do anything
	}else{ // Is a command
		e.preventDefault();
		e.stopImmediatePropagation();
	}
	
	document.execCommand("delete");
	if(newValue)
		document.execCommand("insertText", false, newValue);
}, true);