Discord.Updater = new (function(){
	let version = "https://raw.githubusercontent.com/recette-lemon/DiscordTheme/master/.files/.version";
	let file = new Discord.File(".files/.version");
	
	this.check = function(){
		return new Promise(function(succ){
			let filePromise = file.readText();
			let r = new Discord.Request();
			r.open("GET", version);
			r.send().then(function(response){
				let remote = response.body;
				filePromise.then(function(local){
					local = local.split(".");
					remote = remote.split(".");
					for(let i=local.length-1;i>=0;i--){
						if(+remote[i]>+local[i]) succ(true);
					}
					succ(false);
				});
			});
		});
	}
	
	this.update = function(){
		//https://stackoverflow.com/questions/20643470/execute-a-command-line-binary-with-node-js
		//https://github.com/masterzagh/DiscordTheme/archive/master.zip
		//const { exec } = require('child_process');
	}
	
})();
/*
Discord.Updater.check().then(function(update){
	console.log("Is there update? "+update);
});
*/