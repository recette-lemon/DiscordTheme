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
			let last = sidebar.querySelector("."+selectedClass);
			if(last) last.className = notSelectedClassName;
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
		
		function Options(name, raw, cookie){
			this.div = document.createElement("div");
			let div = this.div;
			
			this.add = function(description, value, fn){
				let item = document.createElement("label");
				item.className = "dt-option";
				item.innerHTML = `
					<input type="radio" name="${raw}"/>
					<div>
						<div>
							<svg name="Checkmark" width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd"><polyline stroke="#7289da" stroke-width="2" points="3.5 9.5 7 13 15 5"></polyline></g></svg>
						</div>
						${description}
					</div>
				`;
				div.appendChild(item);
				let input = item.querySelector("input");
				input.addEventListener("change", function(){
					if(this.checked && (Discord.Settings.Raw[raw]!= value)){
						fn();
						Discord.Settings.Raw[raw] = value;
						Discord.Cookies.set(cookie, value, 365);
					}
				});
				input.checked = (Discord.Settings.Raw[raw] == value);
			}
		}
		
		this.addToggle = function(name, description, defaultValue){
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
		this.createOptions = function(name, defaultValue){
			let raw = (group+"_"+name).toUpperCase();
			let cookie = Discord.Settings.Prefix+raw;
			Discord.Settings.Raw[raw] = Discord.Cookies.get(cookie, defaultValue);
			let options = new Options(name, raw, cookie);
			div.appendChild(options.div);
			options.raw = raw;
			return options;
		}
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
general.addToggle("Greentext", "Color lines beginning with > in green.", false);
general.addToggle("Desu", "Add desu to the end of messages.", false);
let theme = Discord.Settings.Items.createGroup("Theme");
let themeOptions = theme.createOptions("Theme", "default");
let themesFolder = _DISCORD_THEME.root+"themes\\";
let themes = window._fs.readdirSync(themesFolder);
function changeTheme(newTheme){
	window.tearDownCSS(themesFolder+Discord.Settings.Raw[themeOptions.raw]);
	window.applyAndWatchCSS(themesFolder+newTheme);
}
themes.forEach(function(x){
	themeOptions.add(x, x, function(){
		changeTheme(x);
	});
});
window.applyAndWatchCSS(themesFolder+Discord.Settings.Raw[themeOptions.raw]);























