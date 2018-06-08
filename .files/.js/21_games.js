function Games(parent){
	let list = [];
	let current, listElement;
	(function init(){
		// Add games here
		list.push(new Snake());
		
		listElement = document.createElement("div");
		listElement.className = "games-list-element";
		parent.appendChild(listElement);
		
		for(let i=0;i<list.length;i++){
			let g = list[i];
			let gameElement = document.createElement("div");
			gameElement.className = "games-game-element";
			gameElement.addEventListener("click", function(){
				start(g);
			});
			listElement.appendChild(gameElement);
			
			let gameName = document.createElement("div");
			gameName.className = "games-game-name";
			gameName.textContent = g.name;
			gameElement.appendChild(gameName);
			
			for(let x in g.info){
				let gameInfo = document.createElement("div");
				gameInfo.className = "games-game-info";
				gameElement.appendChild(gameInfo);
				
				let gameInfoName = document.createElement("div");
				gameInfoName.className = "games-game-info-name";
				gameInfoName.textContent = x+":";
				gameInfo.appendChild(gameInfoName);
				
				let gameInfoValue = document.createElement("div");
				gameInfoValue.className = "games-game-info-value";
				gameInfoValue.textContent = g.info[x];
				Games.addInfoListener(g, function(info){
					gameInfoValue.textContent = info[x];
				});
				gameInfo.appendChild(gameInfoValue);
			}
		}
	})();
	
	this.back = function(){
		return stop();
	}
	
	function start(game){
		listElement.classList.add("hidden");
		current = game;
		current.appendTo(parent);
		current.start();
	};
	
	function stop(){
		listElement.classList.remove("hidden");
		if(current){
			current.stop();
			current.remove();
			current = undefined;
			return true;
		}
		return false;
	};

}
Games.listeners = {};
Games.addInfoListener = function(game, fn){
	if(!Games.listeners[game.name]) Games.listeners[game.name] = [];
	Games.listeners[game.name].push(fn);
}
Games.onInfo = function(game){
	let l = Games.listeners[game.name];
	if(l){
		for(let i=0;i<l.length;i++){
			l[i](game.info);
		}
	}
}
Games.setInfo = function(game){
	Discord.Cookies.set("Games."+game.name, JSON.stringify(game.info), 100*365);
	Games.onInfo(game);
}
Games.getInfo = function(game){
	let v = Discord.Cookies.get("Games."+game.name);
	if(v) return JSON.parse(v);
	else return {};
}
