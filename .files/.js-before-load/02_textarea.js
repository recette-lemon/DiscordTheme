window.addEventListener('keydown', e => {
	let newValue = "";
	let t = e.target;
	let channel = discord.getCurrentChannel();
	if(e.key!='Enter' || e.ctrlKey || e.altKey || e.shiftKey) return;
	if(!t.matches || !t.matches('[class*="channelTextArea-"] [class*="textArea-"], [class*="channelTextArea-"] [class*="slateTextArea-"]')) return;
	
	let channelTextArea = t.closest('[class*="channelTextArea-"]');
	let inner = channelTextArea.children[0];
	if(channelTextArea.querySelector('[class*="autocomplete-"]')) return;
	
	let range = saveSelection();
	document.execCommand("selectAll");
	let textValue = getStringSelection();
	
	let innerReact = inner.getReact();
	let innerProps = innerReact.memoizedProps;
	
	//let message = innerProps.preprocessInsertedText(textValue);
	let message = textValue;
	
	// Quick fix for help command
	// Can't think of a better way right now
	if(message.startsWith("/help")) return;
	
	// Trying to run command
	let data = commands.run(message, channel);
	if(!data && Discord.Settings.Raw.MessageModifiers.MessageModifiers.Modifiers){ // Not a command AND message modifiers are active
		newValue = Discord.MessageModifiers.modify(Discord.Settings.Raw.MessageModifiers.MessageModifiers.Modifiers, message);
	}else if(!data){ // Not a command
		restoreSelection(range);
		return; // Return since there's no need to do anything
	}else{ // Is a command
		e.preventDefault();
		e.stopImmediatePropagation();
	}
	
	document.execCommand("delete");
	if(newValue)
		document.execCommand("insertText", false, newValue);
}, true);

function saveSelection() {
	let sel = window.getSelection();
	return sel.getRangeAt(0);
}
function restoreSelection(range) {
	let sel = window.getSelection();
	sel.removeAllRanges();
	sel.addRange(range);
}
function getStringSelection(){
	let sel = window.getSelection();
	return sel.toString();
}