/* String Prototypes */
String.prototype.capitalize = function() {
    return this[0].toUpperCase() + this.substring(1);
};

/* HTMLElement Prototypes */
HTMLElement.prototype.getReactInstance = function(){
	let start = "__reactFiber$";
	for(let i in this){
		if(i.startsWith(start)) return this[i];
	}
};
HTMLElement.prototype.getReactReturn = function(num, skip){
  if(skip === undefined) skip = 0;
	let react = this.getReactInstance();
	while(react && (react.tag!=num || skip--!=0))
		react = react.return;
	return react;
};
HTMLElement.prototype.getReact = function(num){
	let react;
  if(num !== undefined)
    react = this.getReactReturn(num);
  if(!react)
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
document.waitForCallbacks = {};
document.waitFor = function(selector){
	return new Promise((succ) => {
		let callbacks = document.waitForCallbacks;
		if(!callbacks[selector]) callbacks[selector] = [];
		callbacks[selector].push(succ);
	});
};
(function(){
	let callbacks = document.waitForCallbacks;
	function waitFor(){
		requestIdleCallback(waitFor);
		if(!Object.keys(callbacks).length) return;
		for(let selector in callbacks){
			let element = document.querySelector(selector);
			if(!element) continue

			let _callbacks = callbacks[selector];
			while(_callbacks.length){
				_callbacks.shift()(element);
			}
			delete callbacks[selector];
		}
	}
	requestIdleCallback(waitFor);
})();

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
