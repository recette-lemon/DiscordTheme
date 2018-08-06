Discord.Line = new (function(){
	let trigger = document.createElement("div");
	trigger.className = "dt-line-trigger";
	let file = new Discord.File("line\\line.png");
	file.readBase64().then(function(b64){
		trigger.style.backgroundImage = "url("+b64+")";
	});
	
	let lineContainer = document.createElement("div");
	lineContainer.className = "dt-modal dt-line-container";
	
	let modal = new Discord.Modal(lineContainer);
	trigger.addEventListener("click", function(){
		lineContainer.innerHTML = "";
		lineContainer.appendChild(lineContainer.elements);
		modal.show();
	});
	
	this.appendTo = function(place){
		place.appendChild(trigger);
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
			s.addEventListener("click", function(){
				p.read().then(function(file){
					let form = new FormData();
					form.append("content", "");
					form.append("file", file);
					discord.sendMessage(discord.getCurrentChannel(), form);
				});
				modal.hide();
			});
			sticker.elements.appendChild(s);
		}
		sticker.addEventListener("click", function(){
			lineContainer.innerHTML = "";
			lineContainer.appendChild(sticker.elements);
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
	lineContainer.appendChild(lineContainer.elements);
})();