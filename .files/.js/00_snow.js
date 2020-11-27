function Snow(options){
	let defaultOptions = {
		color: "white",
		maxNewParticles: 25,
		maxSize: 3,
		minSpeed: 1,
		maxSpeed: 3,
		wind:3,
		above:true
	};

	for(d in defaultOptions){
		if(!options[d])
			options[d] = defaultOptions[d];
	}

	let running = false;
	let snow = [];
	let pStyle = window.getComputedStyle(options.parent);
	let canvas = document.createElement("canvas");
	canvas.width = parseInt(pStyle.width);
	canvas.height = parseInt(pStyle.height);
	let ctx = canvas.getContext("2d");

	function Particle(x, y, size, speed){
		this.x = x;
		this.y = y;
		this.size = size;

		let sizeRatio = (options.maxSize-size)/options.maxSize;
		this.move = function(){
			this.y += speed;
			this.x += options.wind*sizeRatio;
		}
	}

	let snowCooldown;
	let speedDif = options.maxSpeed - options.minSpeed;
	function tick(){
		if(!running) return;
		resize();

		//Create snow particles
		let width = canvas.width, width2 = width*2;
		if(!snowCooldown){
			snowCooldown = 10;
			let max = Math.random()*options.maxNewParticles;
			for(let i=0;i<max;i++){
				let x = (Math.random()*width2)-width;
				let size = Math.random()*options.maxSize;
				let speed = Math.random()*speedDif+options.minSpeed;
				let particle = new Particle(x, 0, size, speed);
				snow.push(particle);
			}
		}
		snowCooldown--;

		//Render and move snow particles
		let newSnow = [];
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		snow.forEach(s => {
			ctx.beginPath();
			ctx.arc(s.x, s.y, s.size, 0, 2*Math.PI, false);
			ctx.fill();
			s.move();
			if(s.y < canvas.height && s.x < canvas.width)
				newSnow.push(s);
		});
		snow = newSnow;

		//Request new frame
		requestAnimationFrame(tick);
	}
	//Resize canvas to match parent
	function resize(){
		canvas.width = parseInt(pStyle.width);
		canvas.height = parseInt(pStyle.height);
		ctx.fillStyle = options.color;
	}

	this.start = function(){
		canvas.style.display = "";
		running = true;
		tick();
	}
	this.pause = function(){
		canvas.style.display = "none";
		running = false;
	}

	canvas.style.display = "none";
	canvas.style.position = "absolute";
	canvas.style.top = "0px";
	canvas.style.left = "0px";
	canvas.style.zIndex = "1000";
	if(options.above)
		canvas.style.pointerEvents = "none";
	else
		canvas.style.zIndex = "-1";
	options.parent.appendChild(canvas);
}
let snow = new Snow({
	color: "white",
	maxNewParticles: 30,
	parent: document.body
});
