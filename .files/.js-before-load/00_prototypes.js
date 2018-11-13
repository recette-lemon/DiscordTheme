/* String Prototypes */
String.prototype.capitalize = function() {
    return this[0].toUpperCase() + this.substring(1);
}

/* HTMLElement Prototypes */
HTMLElement.prototype.getReactInstance = function(){
	let start = "__reactInternalInstance$";
	for(let i in this){
		if(i.startsWith(start)) return this[i];
	}
}
HTMLElement.prototype.getReactReturn = function(num){
	let react = this.getReactInstance();
	while(react && react.tag!=num)
		react = react.return;
	return react;
}
HTMLElement.prototype.getReact = function(){
	let react;
	react = this.getReactReturn(1);
	if(!react)
		react = this.getReactReturn(2);
	return react;
}

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
}