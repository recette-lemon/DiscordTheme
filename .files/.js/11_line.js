Discord.Line = new (function(){
	let trigger = document.createElement("div");
	trigger.className = "dt-line-trigger";
	let file = new Discord.File("line/line.png");
	file.readBase64().then(function(b64){
		trigger.style.backgroundImage = "url("+b64+")";
	});
	
	let lineContainer = document.createElement("div");
	lineContainer.className = "dt-line-container";
	let current;
	
	let modal = new Discord.Modal(lineContainer);
	trigger.addEventListener("click", function(){
		lineContainer.removeChild(current);
		lineContainer.appendChild(current=lineContainer.elements);
		lineContainer.setAttribute("root", true);
		modal.show();
	});
	
	let back = document.createElement("div");
	back.className = "dt-line-back";
	back.innerHTML = `
		<svg viewBox="0 0 32 32" >
			<path d="M28,14H8.8l4.62-4.62C13.814,8.986,14,8.516,14,8c0-0.984-0.813-2-2-2c-0.531,0-0.994,0.193-1.38,0.58l-7.958,7.958C2.334,14.866,2,15.271,2,16s0.279,1.08,0.646,1.447l7.974,7.973C11.006,25.807,11.469,26,12,26c1.188,0,2-1.016,2-2  c0-0.516-0.186-0.986-0.58-1.38L8.8,18H28c1.104,0,2-0.896,2-2S29.104,14,28,14z"/>
		</svg>
	`;
	lineContainer.appendChild(back);
	
	back.addEventListener("click", function(){
		lineContainer.removeChild(current);
		lineContainer.appendChild(current=lineContainer.elements);
		lineContainer.setAttribute("root", true);
	});
	
	this.appendTo = function(place){
		place.insertBefore(trigger, place.children[0]);
	};
	
	//Building Stickers
	let packs = new Discord.File("line").listFolders();
	lineContainer.elements = document.createElement("div");
	lineContainer.elements.className = "dt-line-inner";
	for(let i=0;i<packs.length;i++){
		let sticker = document.createElement("div");
		sticker.className = "dt-line-sticker";
		let stickerInner = document.createElement("div");
		stickerInner.className = "dt-line-sticker-inner";
		sticker.appendChild(stickerInner);
		let pack = packs[i].list();
		if(!pack.length) continue;
		pack[0].readBase64().then(function(b64){
			stickerInner.style.backgroundImage = "url("+b64+")";
		});
		sticker.elements = document.createElement("div");
		sticker.elements.className = "dt-line-inner";
		for(let j=0;j<pack.length;j++){
			let p = pack[j];
			if(p.basename == "productInfo.meta"){
				let info = JSON.parse(p.readTextSync());
				sticker.name = info.title.en;
				sticker.setAttribute("name", info.title.en);
				continue;
			}
			let s = document.createElement("div");
			s.className = "dt-line-sticker";
			let si = document.createElement("div");
			si.className = "dt-line-sticker-inner";
			s.appendChild(si);
			p.readBase64().then(function(b64){
				si.style.backgroundImage = "url("+b64+")";
			});
			s.addEventListener("click", function(e){
				p.read().then(function(file){
					if(e.shiftKey){
						(new Discord.FileDialog(file)).show();
					}else{
						let form = new FormData();
						form.append("content", "");
						form.append("file", file);
						discord.sendMessage(discord.getCurrentChannel(), form);
					}
				});
				modal.hide();
			});
			sticker.elements.appendChild(s);
		}
		sticker.addEventListener("click", function(){
			lineContainer.removeChild(current);
			lineContainer.appendChild(current=sticker.elements);
			lineContainer.removeAttribute("root");
		});
		let before;
		for(let j=0;j<lineContainer.elements.children.length;j++){
			if(sticker.name < lineContainer.elements.children[j].name){
				lineContainer.elements.insertBefore(sticker, lineContainer.elements.children[j]);
				break;
			}
		}
		if(!sticker.parentNode)
			lineContainer.elements.appendChild(sticker);
	}
	lineContainer.appendChild(current=lineContainer.elements);
})();