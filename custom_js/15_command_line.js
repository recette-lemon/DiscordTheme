Discord.Console = function(){
	let _this = this;
	this.onCommand = function(){};
	let appMount = document.getElementById("app-mount");
	
	let commandWrapper = document.createElement("div");
	commandWrapper.id = "command-line";
	commandWrapper.className = "hidden";
	appMount.appendChild(commandWrapper);
	
	let commandArrow = document.createElement("span");
	commandArrow.textContent = ">";
	commandWrapper.appendChild(commandArrow);
	
	let commandInput = document.createElement("input");
	commandWrapper.appendChild(commandInput);
	
	window.addEventListener("keydown", function(e) {
		if(e.key == "F12") { 
			commandWrapper.classList.remove("hidden");
			commandInput.focus();
		} else if(e.key == "Escape") {
			commandWrapper.classList.add("hidden");
		}
	}, true);
	
	commandInput.addEventListener("keypress", function(e) {
		if(e.key == "Enter") { 
			_this.onCommand(this.value);
			this.value = "";
		}
	});
};

