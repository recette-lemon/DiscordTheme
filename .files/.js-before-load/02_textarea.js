window.addEventListener('keypress', e => {
	let newValue = "";
	let t = e.target;
	let channel = discord.getCurrentChannel();
	if(e.key!='Enter') return;
	if(!t.matches || !t.matches('[class*="channelTextArea-"] [class*="textArea-"]')) return;
	let data = commands.run(t.value, channel);
	if(!data && Discord.Settings.Raw.MessageModifiers.MessageModifiers.Modifiers){
		newValue = Discord.MessageModifiers.modify(Discord.Settings.Raw.MessageModifiers.MessageModifiers.Modifiers, t.value);
	}else if(!data){
		return;
	}else{
		e.preventDefault();
		e.stopImmediatePropagation();
	}
	t.value = t.defaultValue = t.textContent = t.innerHTML = newValue;
	t.style.height = "";
	t._wrapperState.initialValue = newValue;
	t._valueTracker.setValue(newValue);
	
	let react = t.getReact();
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
}, true);