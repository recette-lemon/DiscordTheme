Discord.Settings = function(target){
	let settings = target.querySelector('[class*="standardSidebarView-"]');
	if(!settings || settings.getReact().memoizedProps.section!="My Account") return false;
	function getClass(target, c){
		let name;
		target.querySelector('[class*="'+c+'-"]').classList.forEach(x=>x.startsWith(c+"-")&&(name=x));
		return name;
	}
	function getClassName(target, c){
		return target.querySelector('[class*="'+c+'-"]').className;
	}
	let sidebar = settings.querySelector('[class*="sidebar-"]').children[0];
	let headerClass = getClass(sidebar, "header");
	let itemClass = getClass(sidebar, "item");
	let itemDefaultClass = "";//getClass(sidebar, "itemDefault");
	let itemSelectedClass = "";//getClass(sidebar, "itemSelected");
	let notSelectedClass = "";//getClass(sidebar, "notSelected");
	let selectedClass = getClass(sidebar, "selected");
	let themedClass = getClass(sidebar, "themed");
	let place = sidebar.children[sidebar.children.length-6];
	let notSelectedClassName = [itemDefaultClass, itemClass, notSelectedClass, themedClass].join(" ");
	let selectedClassName = [itemSelectedClass, itemClass, selectedClass, themedClass].join(" ");

	let title = document.createElement("div");
	title.className = headerClass;
	title.innerHTML = Discord.Settings.Title;
	sidebar.insertBefore(title, place);

	let content = settings.querySelector('[class*="contentColumn-"]');

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
		item.className = notSelectedClassName;
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
	let tabsIndex = this.Tabs = {};
	let tabs = [];

	function buildRaw(name){
		return name.replace(/ +/g, "");
	}

	function Tab(tab){
		let rawTab = buildRaw(tab);
		Discord.Settings.Raw[rawTab] = {};

		let groupIndex = this.Groups = {};
		let groups = [];

		this.name = tab;
		let tabDiv = this.div = document.createElement("div");
		tabDiv.className = "dt-settings";
		tabDiv.tab = tab;
		let title = document.createElement("div");
		title.className = "dt-settings-title";
		title.textContent = tab;
		tabDiv.appendChild(title);

		function Group(group){
			let rawGroup = buildRaw(group);
			Discord.Settings.Raw[rawTab][rawGroup] = {};

			this.name = group;
			let div = this.div = document.createElement("div");
			tabDiv.appendChild(div);

			function buildCookieName(name){
				return Discord.Settings.Prefix + (rawTab+"-"+rawGroup+"-"+name.replace(/\s+/g, "_")).toUpperCase();
			}

			function Options(name, cookie){
				this.div = document.createElement("div");
				let div = this.div;

				this.add = function(description, value, fn){
					let item = document.createElement("label");
					item.className = "dt-option";
					item.innerHTML = `
						<input type="radio" name="${cookie}"/>
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
						if(this.checked && (Discord.Settings.Raw[rawTab][rawGroup][name]!= value)){
							fn();
							Discord.Settings.Raw[rawTab][rawGroup][name] = value;
							Discord.Cookies.set(cookie, value, 365);
						}
					});
					input.checked = (Discord.Settings.Raw[rawTab][rawGroup][name] == value);
				}
			}

			this.addText = function(name, description, defaultValue, fn){
				name = buildRaw(name);
				let cookie = buildCookieName(name);
				Discord.Settings.Raw[rawTab][rawGroup][name] = Discord.Cookies.get(cookie, defaultValue);
				let item = document.createElement("div");
				item.className = "dt-settings-item";
				item.innerHTML = `
					<div class="dt-settings-item-main">
						<div class="dt-settings-item-name">${name}</div>
						<input type="text"/>
					</div>
					<div class="dt-settings-item-description">${description}</div>
				`;
				div.appendChild(item);
				let input = item.querySelector("input");
				input.addEventListener("change", function(){
					Discord.Settings.Raw[rawTab][rawGroup][name] = this.value;
					Discord.Cookies.set(cookie, this.value, 365);
					if(fn) fn();
				});
				input.value = Discord.Settings.Raw[rawTab][rawGroup][name];
			}
			this.addToggle = function(name, description, defaultValue, fn){
				let _n = name;
				name = buildRaw(name);
				let cookie = buildCookieName(name);
				Discord.Settings.Raw[rawTab][rawGroup][name] = Discord.Cookies.get(cookie, defaultValue);
				let item = document.createElement("div");
				item.className = "dt-settings-item";
				item.innerHTML = `
					<div class="dt-settings-item-main">
						<div class="dt-settings-item-name">${_n}</div>
						<label class="dt-switch">
							<input type="checkbox"/>
							<div></div>
						</div>
					</div>
					<div class="dt-settings-item-description">${description}</div>
				`;
				div.appendChild(item);
				let input = item.querySelector("input");
				input.addEventListener("change", function(){
					Discord.Settings.Raw[rawTab][rawGroup][name] = this.checked;
					Discord.Cookies.set(cookie, this.checked, 365);
					if(fn) fn();
				});
				input.checked = Discord.Settings.Raw[rawTab][rawGroup][name];
			};
			this.createOptions = function(name, defaultValue){
				name = buildRaw(name);
				let cookie = buildCookieName(name);
				Discord.Settings.Raw[rawTab][rawGroup][name] = Discord.Cookies.get(cookie, defaultValue);
				let options = new Options(name, cookie);
				div.appendChild(options.div);
				return options;
			}
		}

		this.addSeparator = function(name){
			let title = document.createElement("div");
			title.className = "dt-settings-title";
			title.textContent = name;
			tabDiv.appendChild(title);
		}

		this.createGroup = function(group){
			if(groupIndex[group]) return;
			this.addSeparator(group);
			let t = new Group(group);
			groups.push(groupIndex[group] = t);
			return t;
		}
	}

	this.createTab = function(tab){
		if(tabsIndex[tab]) return;
		let t = new Tab(tab);
		tabs.push(tabsIndex[tab] = t);
		return t;
	};
	this.forEach = function(fn){
		for(let i=0;i<tabs.length;i++){
			fn(tabs[i]);
		}
	};
})();

// GENERAL
let generalTab = Discord.Settings.Items.createTab("General");
let general = generalTab.createGroup("General");
general.addToggle("Image Links", "When posting an image link as a message, replace it with an upload instead.", false);
general.addToggle("Image Link Dialog", "Show a dialog when posting an image link with the above option enabled.", false);
general.addToggle("Global Emotes", "Use emotes from all servers and even animated ones.", false);
general.addToggle("Character Count", "Add a character count to the bottom right of the textarea.", false);
general.addToggle("Greentext", "Color lines beginning with > in green.", false);
general.addToggle("Don't Send Typing", "Other users will stop seeing you type.", false);
general.addToggle("Rainbow Text", "Color all messages in rainbow.", false, setRainbow);
function setRainbow(){
	if(Discord.Settings.Raw.General.General.RainbowText)
		document.documentElement.setAttribute("rainbow", true);
	else
		document.documentElement.removeAttribute("rainbow");
}
setRainbow();


//THEME
let themeTab = Discord.Settings.Items.createTab("Theme");
let theme = themeTab.createGroup("Theme");
let themeOptions = theme.createOptions("Theme", "default");
let themesFolder = DT.root+"themes\\";
let themes = window._fs.readdirSync(themesFolder);
function changeTheme(newTheme){
	if(Discord.Settings.Raw.Theme.Theme.Theme)
		window.tearDownCSS(themesFolder+Discord.Settings.Raw.Theme.Theme.Theme);
	window.applyAndWatchCSS(themesFolder+newTheme);
}
themeOptions.add("None", "", function(){
	window.tearDownCSS(themesFolder+Discord.Settings.Raw.Theme.Theme.Theme);
});
themes.forEach(function(x){
	themeOptions.add(x, x, function(){
		changeTheme(x);
	});
});
if(Discord.Settings.Raw.Theme.Theme.Theme) window.applyAndWatchCSS(themesFolder+Discord.Settings.Raw.Theme.Theme.Theme, true);
