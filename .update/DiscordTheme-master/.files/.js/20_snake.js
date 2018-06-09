function Snake(){
	let _this = this;
	let scoreWrapper, hScore, hScoreElem, cScore, cScoreElem, canvas, ctx;
	let size, direction, field, snake, speed, fruit, lastDirection;
	let side = 20, square, minSpeed = 50, walls = true;
	let playing = false;
	let timeout = false, input = true;
	let start;
	
	// Mandatory Variables
	this.name = "Snake";
	this.info = {};
	
	(function init(){
		_this.info = Games.getInfo(_this);
		if(!_this.info.Highscore) _this.info.Highscore = 0;
		if(!_this.info.Played) _this.info.Played = 0;
		Games.setInfo(_this);
		
		scoreWrapper = document.createElement("div");
		scoreWrapper.className = "snake-score";
		
		hScore = _this.info.Highscore;
		hScoreElem = document.createElement("div");
		hScoreElem.className = "snake-hscore";
		scoreWrapper.appendChild(hScoreElem);
		setHighScore(hScore);
		
		cScore = 0;
		cScoreElem = document.createElement("div");
		cScoreElem.className = "snake-cscore";
		scoreWrapper.appendChild(cScoreElem);
		setScore(0);
		
		canvas = document.createElement("canvas");
		canvas.width = canvas.height = 600;
		ctx = canvas.getContext("2d");
		ctx.fillStyle = "white";//"#20C20E";
		
		square = canvas.width/side;
	})();
	
	function placeFruit(){
		do{
			fruit = {
				x: (Math.random()*side)|0,
				y: (Math.random()*side)|0
			}
		}while(field[fruit.x][fruit.y]);
	}
	function step(){
		let next;
		switch(direction){
			case "up":{
				let s = snake[0]
				let x = s.x;
				let y = s.y;
				y--;
				if(y==-1 && !walls) y+=side;
				next = {x, y};
				break;
				break;
			}
			case "down":{
				let s = snake[0]
				let x = s.x;
				let y = s.y;
				y++;
				if(y==side && !walls) y-=side;
				next = {x, y};
				break;
			}
			case "left":{
				let s = snake[0]
				let x = s.x;
				let y = s.y;
				x--;
				if(x==-1 && !walls) x+=side;
				next = {x, y};
				break;
			}
			case "right":{
				let s = snake[0]
				let x = s.x;
				let y = s.y;
				x++;
				if(x==side && !walls) x-=side;
				next = {x, y};
				break;
			}
		}
		
		if(field[next.x][next.y]){
			playing = false;
			timeout = setTimeout(start, 1000);
			return;
		}
		
		let gotFruit = false;
		if(next.x == fruit.x && next.y == fruit.y){
			setScore(cScore + 10);
			size++;
			if(speed>minSpeed)speed-=10;
			gotFruit = true;
		}
		
		snake.unshift(next);
		field[next.x][next.y] = true;
		lastDirection = direction;
		if(snake.length > size){
			let last = snake.pop();
			field[last.x][last.y] = false;
		}
		if(gotFruit) placeFruit();
		
		draw();
		input = true;
		if(playing) timeout = setTimeout(step, speed);
	}
	function draw(){
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		for(let j=0;j<20;j++){
			let y = j*square;
			for(let i=0;i<20;i++){
				let x = i*square;
				if(field[i][j])
					ctx.fillRect(x, y, square, square);
			}
		}
		let sq2 = square/2;
		ctx.fillRect((fruit.x*square + sq2/2)|0, (fruit.y*square + sq2/2)|0, (sq2)|0, (sq2)|0);
	}
	window.addEventListener("keydown", function(e){
		let key = false;
		switch(e.key){
			case "ArrowUp":
				if(lastDirection=="down" || lastDirection=="up")break;
				key=true;
			case "ArrowDown":
				if(lastDirection=="up" || lastDirection=="down")break;
				key=true;
			case "ArrowLeft":
				if(lastDirection=="right" || lastDirection=="left")break;
				key=true;
			case "ArrowRight":
				if(lastDirection=="left" || lastDirection=="right")break;
				key=true;
		}
		if(key){
			direction = e.key.substring(5).toLowerCase();
			if(playing && input){
				input = false;
				if(timeout) clearTimeout(timeout);
				step();
			}
		}
	});
	
	// AUX FUNCTIONS
	function setScore(score) {
		cScore = score;
		
		let scoreTxt = "000000"+score;
		let sSize = scoreTxt.length;
		scoreTxt = scoreTxt.substring(sSize-6, sSize);
		cScoreElem.textContent = scoreTxt;
	}
	function setHighScore(score) {
		_this.info.Highscore = hScore = score;
		
		let scoreTxt = "000000"+score;
		let sSize = scoreTxt.length;
		scoreTxt = scoreTxt.substring(sSize-6, sSize);
		hScoreElem.textContent = scoreTxt;
		
		Games.setInfo(_this);
	}
	
	// Mandatory Functions
	this.start = start = function(){
		_this.info.Played++;
		Games.setInfo(_this);
		playing = true;
		speed = 200;
		size = 3;
		direction = "right";
		field = [];
		for(let i=-1;i<=side;i++)
			field[i] = [];
		field[0][0] = true;
		if(walls){
			for(let i=0;i<side;i++) field[-1][i] = true;
			for(let i=0;i<side;i++) field[side][i] = true;
			for(let i=0;i<side;i++) field[i][-1] = true;
			for(let i=0;i<side;i++) field[i][side] = true;
		}
		snake = [];
		snake.push({x:0, y:0});
		placeFruit();
		draw();
		timeout = setTimeout(step, speed);
		
		if(cScore > hScore) setHighScore(cScore);
		setScore(0);
	}
	this.stop = function(){
		clearTimeout(timeout);
		playing = false;
	}
	this.appendTo = function(parent){
		parent.appendChild(scoreWrapper);
		parent.appendChild(canvas);
	}
	this.remove = function(){
		let parent = canvas.parentNode;
		parent.removeChild(scoreWrapper);
		parent.removeChild(canvas);
	}
}

