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
	let notSelectedClass = getClass(sidebar, "notSelected");
	let place = sidebar.children[sidebar.children.length-5];
	
	let title = document.createElement("div");
	title.className = headerClass;
	title.innerHTML = Discord.Settings.Title;
	sidebar.insertBefore(title, place);
	
	let content = settings.querySelector(".content-column");
	let h2 = getClassName(content, "h2");
	
	Discord.Settings.Items.forEach(function(x){
		let item = document.createElement("div");
		item.classList.add(itemDefaultClass);
		item.classList.add(itemClass);
		item.classList.add(notSelectedClass);
		item.innerHTML = x.name;
		sidebar.insertBefore(item, place);
	});
	
	let separator = sidebar.querySelector('[class*="separator"]').cloneNode();
	sidebar.insertBefore(separator, place);
	
	return true;
}
Discord.Settings.Title = "Theme Settings";
Discord.Settings.Items = new (function(){
	let itemsIndex = {};
	let items = [];
	
	this.createGroup = function(group){
		if(itemsIndex[group]) return;
		items.push(itemsIndex[group] = {name:group});
	};
	this.createSetting = function(group, name, description){
		let g = itemsIndex[group];
		if(!g) return;
		if(!g.settings) g.settings = [];
		g.settings.push({name, description});
	};
	this.forEach = function(fn){
		for(let i=0;i<items.length;i++){
			fn(items[i]);
		}
	};
})();
Discord.Settings.Items.createGroup("General");
Discord.Settings.Items.createSetting("General", "Greentext", "Color lines beginning with > in green.");























