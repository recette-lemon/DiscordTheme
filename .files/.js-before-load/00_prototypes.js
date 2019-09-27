/* String Prototypes */
String.prototype.capitalize = function() {
    return this[0].toUpperCase() + this.substring(1);
};

/* HTMLElement Prototypes */
HTMLElement.prototype.getReactInstance = function(){
	let start = "__reactInternalInstance$";
	for(let i in this){
		if(i.startsWith(start)) return this[i];
	}
};
HTMLElement.prototype.getReactReturn = function(num){
	let react = this.getReactInstance();
	while(react && react.tag!=num)
		react = react.return;
	return react;
};
HTMLElement.prototype.getReact = function(){
	let react;
	react = this.getReactReturn(1);
	if(!react)
		react = this.getReactReturn(2);
	return react;
};

/* File Prototypes */
File.prototype.toBase64 = function(){
	let _this = this;
	return new Promise(function(succ, err){
		var reader = new FileReader();
		reader.readAsDataURL(_this);
		reader.onload = function () {
			succ(reader.result);
		};
		reader.onerror = function (error) {
			err(error);
		};
	});
};

/* Document */
document.waitFor = function(selector){
	return new Promise((succ) => {
		function waitFor(){
			let element = document.querySelector(selector);
			if(element) return succ(element);
			requestIdleCallback(waitFor);
		}
		requestIdleCallback(waitFor);
	});
};

/* A simple MutationObserver wrapper */
HTMLElement.prototype.onMutation = function(type, callback, config){
	let observer = new MutationObserver((mutationsList, observer) => {
		[...mutationsList].forEach(mutation => {
			let value = mutation[type];
			if(!type) return;
			if(value instanceof NodeList){
				if(!value.length) return;
				[...value].forEach(v => callback(v, mutation));
			}else{
				callback(value, mutation);
			}				
		});
	});
	observer.observe(this, config||{childList:true});
	return observer;
};