window.addEventListener('keypress', e => {
	let newValue = "";
	let t = e.target;
	let channel = discord.getCurrentChannel();
	if(e.key!='Enter') return;
	if(!t.matches || !t.matches('[class*="channelTextArea-"] [class*="textArea-"]')) return;
	let channelTextArea = t.closest('[class*="channelTextArea-"]');
	
	// Quick fix for help command
	// Can't think of a better way right now
	if(t.value.startsWith("/help")) return;
	
	// Trying to run command
	let data = commands.run(t.value, channel);
	if(!data && Discord.Settings.Raw.MessageModifiers.MessageModifiers.Modifiers){ // Not a command AND message modifiers are active
		newValue = Discord.MessageModifiers.modify(Discord.Settings.Raw.MessageModifiers.MessageModifiers.Modifiers, t.value);
	}else if(!data){ // Not a command
		return; // Return since there's no need to do anything
	}else{ // Is a command
		e.preventDefault();
		e.stopImmediatePropagation();
	}
	
	// The rest of this code removes any reference to the current text message
	// on variables hidden throughout the DOM and on the localStorage
	
	t.blur(); // Blur textarea beforehand because discord resets message on blur
	t.value = t.defaultValue = t.textContent = t.innerHTML = newValue;
	t.style.height = "";
	t._wrapperState.initialValue = newValue;
	t._valueTracker.setValue(newValue);
	
	react = t.getReact();
	react.memoizedProps.value = react.pendingProps.value = newValue;
	
	let parent = t.closest('[class*="channelTextArea-"]');
	react = parent.getReact();
	react.memoizedProps.value = react.memoizedState.prefix = react.stateNode.state.prefix = newValue;
	
	let form = t.closest("form");
	react = form.getReact();
	react.memoizedState.textValue = react.stateNode.state.textValue = newValue;
	
	let draftStore = JSON.parse(_localStorage.DraftStore);
	delete draftStore._state[channel];
	_localStorage.DraftStore = JSON.stringify(draftStore);
	t.focus(); // Focus textarea so user doesn't lose control 
	
}, true);