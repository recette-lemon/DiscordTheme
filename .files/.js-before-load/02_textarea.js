window.addEventListener('keydown', e => {
	let newValue = "";
	let t = e.target;
	let channel = discord.getCurrentChannel();
	if(e.key!='Enter') return;
	if(!t.matches || !t.matches('[class*="channelTextArea-"] [class*="textArea-"], [class*="channelTextArea-"] [class*="slateTextArea-"]')) return;
	let channelTextArea = t.closest('[class*="channelTextArea-"]');
	
	// Quick fix for help command
	// Can't think of a better way right now
	if(t.textContent.startsWith("/help")) return;
	
	// Trying to run command
	let data = commands.run(t.textContent, channel);
	if(!data && Discord.Settings.Raw.MessageModifiers.MessageModifiers.Modifiers){ // Not a command AND message modifiers are active
		newValue = Discord.MessageModifiers.modify(Discord.Settings.Raw.MessageModifiers.MessageModifiers.Modifiers, t.textContent);
	}else if(!data){ // Not a command
		return; // Return since there's no need to do anything
	}else{ // Is a command
		e.preventDefault();
		e.stopImmediatePropagation();
	}
	
	document.execCommand("selectAll");
	document.execCommand("delete");
}, true);