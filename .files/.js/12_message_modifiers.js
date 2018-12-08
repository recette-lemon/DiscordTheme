Discord.MessageModifiers = new (function(){
	let modifiers = {};
	let tab = Discord.Settings.Items.createTab("Message Modifiers");
	let mm = tab.createGroup("Message Modifiers");
	//let mm = Discord.Settings.Items.Tabs.General.createGroup("Message Modifiers");
	let options = mm.createOptions("Modifiers", "");
	options.add("None", "", function(){});
	
	this.add = function(name, fn){
		modifiers[name] = fn;
		options.add(name, name, function(){});
	}
	
	this.modify = function(name, message){
		return modifiers[name](message);
	}
})();

Discord.MessageModifiers.add("Desu", function(message){
	return message+" desu";
});