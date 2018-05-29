Discord.Console = new (function(){
	let _this = this;
	this.onCommand = function(){};
	let appMount = document.getElementById("app-mount");
	let commandWrapper;
	let commandArrow;
	let commandInput;
	
	this.init = function(){
		commandWrapper = document.createElement("div");
		commandWrapper.id = "command-line";
		commandWrapper.className = "hidden";
		appMount.appendChild(commandWrapper);
		
		commandArrow = document.createElement("span");
		commandArrow.textContent = ">";
		commandWrapper.appendChild(commandArrow);
		
		commandInput = document.createElement("input");
		commandWrapper.appendChild(commandInput);
		
		_this.show = function(text){
			commandWrapper.classList.remove("hidden");
			if(text) commandInput.value = text;
			commandInput.focus();
		}
		
		_this.hide = function(){
			commandWrapper.classList.add("hidden");
		}
		
		window.addEventListener("keydown", function(e) {
			if(e.key == "F12") { 
				_this.show();
			} else if(e.key == "Escape") {
				_this.hide();
			}
		}, true);
		
		commandInput.addEventListener("keypress", function(e) {
			if(e.key == "Enter") { 
				_this.onCommand(this.value);
				this.value = "";
			}
		});
	}
	
});

