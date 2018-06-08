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
	while(react.tag!=num)
		react = react.return;
	return react;
}