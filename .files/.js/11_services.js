Discord.Services = new (function(){
	let _this = this;
	let services = [];
	let sid = 0;
	let active = 0;

	let servicesElement = document.createElement('div');
	servicesElement.className = 'dt-show dt-hidden';
	servicesElement.id = 'dt-services';
	let arrow = document.createElement('div');
	arrow.id = 'dt-services-arrow';
	arrow.className = 'dt-hidden';
	arrow.addEventListener('click', e => {
		if(servicesElement.classList.contains('dt-show')){
			servicesElement.classList.remove('dt-show');
			arrow.classList.add('dt-show');
		}else{
			servicesElement.classList.add('dt-show');
			arrow.classList.remove('dt-show');
		}
	});

	// Returns an id to be used when calling remove
	// append parameter appends service id to name
	this.addService = function(name, callback, append=true){
		let myID = sid++;
		active++;
		servicesElement.classList.remove('dt-hidden');
		arrow.classList.remove('dt-hidden');

		if(append) name += ' '+myID;

		let element = document.createElement('div');
		element.className = "dt-service";
		element.innerHTML = `
			<span>${name}</span>
			<span class="dt-service-close"></span>
		`;
		element.addEventListener('click', e => {
			if(!e.target.matches('.dt-service-close')) return;
			this.removeService(myID, true);
		});
		servicesElement.appendChild(element);

		services[myID] = {name, callback, element};
		return myID;
	};
	this.removeService = function(id, callback=false){
		if(!services[id]) return;
		if(--active == 0){
			servicesElement.classList.add('dt-hidden');
			arrow.classList.add('dt-hidden');
		}

		if(callback) services[id].callback();
		services[id].element.remove();
		delete services[id];
	}
	this.renameService = function(id, name, append=true){
		if(!services[id]) return;
		if(append) name += ' '+id;
		services[id].element.children[0].innerText = name;
	}

	this.appendTo = function(form){
		form.insertBefore(servicesElement, form.children[0]);
		form.insertBefore(arrow, form.children[0]);
	}
})();
