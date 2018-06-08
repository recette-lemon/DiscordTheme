Discord.Settings = function(target){
	let settings = target.querySelector(".ui-standard-sidebar-view");
	if(!settings || settings.getReactReturn(2).memoizedProps.section!="ACCOUNT") return false;
	function getClass(target, c){
		let name;
		target.querySelector('[class*="'+c+'-"]').classList.forEach(x=>x.startsWith(c+"-")&&(name=x));
		return name;
	}
	function getClassName(target, c){
		return target.querySelector('[class*="'+c+'-"]').className;
	}
	let sidebar = settings.querySelector(".sidebar").children[0];
	let headerClass = getClass(sidebar, "header");
	let itemClass = getClass(sidebar, "item");
	let itemDefaultClass = getClass(sidebar, "itemDefault");
	let itemSelectedClass = getClass(sidebar, "itemSelected");
	let notSelectedClass = getClass(sidebar, "notSelected");
	let selectedClass = getClass(sidebar, "selected");
	let place = sidebar.children[sidebar.children.length-5];
	let notSelectedClassName = `${itemDefaultClass} ${itemClass} ${notSelectedClass}`;
	let selectedClassName = `${itemSelectedClass} ${itemClass} ${selectedClass}`;
	
	let title = document.createElement("div");
	title.className = headerClass;
	title.innerHTML = Discord.Settings.Title;
	sidebar.insertBefore(title, place);
	
	let content = settings.querySelector(".content-column");

	sidebar.addEventListener("mousedown", function(e){
		if(!e.target.matches("."+itemClass)) return;
		if(content.customSettings){
			let last = sidebar.querySelector("."+selectedClass);
			if(last) last.className = notSelectedClassName;
			content.removeChild(content.customSettings);
			content.customSettings=false;
		}
	}, true);
	
	Discord.Settings.Items.forEach(function(x){
		let item = document.createElement("div");
		item.classList.add(itemDefaultClass);
		item.classList.add(itemClass);
		item.classList.add(notSelectedClass);
		item.innerHTML = x.name;
		item.addEventListener("mousedown", function(){
			sidebar.querySelector("."+selectedClass).className = notSelectedClassName;
			item.className = selectedClassName;
			content.innerHTML = "";
			content.appendChild(x.div);
			content.customSettings = x.div;
		});
		sidebar.insertBefore(item, place);
	});
	
	let separator = sidebar.querySelector('[class*="separator"]').cloneNode();
	sidebar.insertBefore(separator, place);
	return true;
}
Discord.Settings.Prefix = "DISCORD_THEME_";
Discord.Settings.Raw = {};
Discord.Settings.Title = "Theme Settings";
Discord.Settings.Items = new (function(){
	let groupsIndex = {};
	let groups = [];
	function Group(group){
		this.name = group;
		this.div = document.createElement("div");
		let div = this.div;
		div.className = "dt-settings";
		div.group = group;
		let title = document.createElement("div");
		title.className = "dt-settings-title";
		title.textContent = group;
		div.appendChild(title);
		
		this.addSetting = function(name, description, defaultValue){
			let raw = (group+"_"+name).toUpperCase();
			let cookie = Discord.Settings.Prefix+raw;
			Discord.Settings.Raw[raw] = Discord.Cookies.get(cookie, defaultValue);
			let item = document.createElement("div");
			item.className = "dt-settings-item";
			item.innerHTML = `
				<div class="dt-settings-item-main">
					<div class="dt-settings-item-name">${name}</div>
					<label class="dt-switch">
						<input type="checkbox" name="${raw}"/>
						<div></div>
					</div>
				</div>
				<div class="dt-settings-item-description">${description}</div>
			`;
			div.appendChild(item);
			let input = item.querySelector("input");
			input.addEventListener("change", function(){
				Discord.Settings.Raw[raw] = this.checked;
				Discord.Cookies.set(cookie, this.checked, 365);
			});
			input.checked = Discord.Settings.Raw[raw];
		};
	}
	
	this.createGroup = function(group){
		if(groupsIndex[group]) return;
		let g = new Group(group);
		groups.push(groupsIndex[group] = g);
		return g;
	};
	this.forEach = function(fn){
		for(let i=0;i<groups.length;i++){
			fn(groups[i]);
		}
	};
})();
let general = Discord.Settings.Items.createGroup("General");
general.addSetting("Greentext", "Color lines beginning with > in green.", false);
general.addSetting("Desu", "Add desu to the end of messages.", false);























