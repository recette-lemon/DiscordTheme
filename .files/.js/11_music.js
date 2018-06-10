Discord.MusicPlayer = new (function(){
	let musicList = [];
	let index=0;
	let _this = this;
	let div, player, ready;
	let musicPlayer, playButton;
	
	this.init = function(){
		let old = window.onYouTubeIframeAPIReady;
		window.onYouTubeIframeAPIReady = function(){
			player = new YT.Player(div, {
				playerVars: {
					autoplay: 1
				},
				events: {
					onReady: function(e){
						player.setVolume(10);
						Discord.MusicPlayer.onReady(e.target);
					},
					onStateChange: function(e){
						switch(e.data){
							case 0:_this.playing=false;_this.innerOnEnd();break;
							case 2:_this.playing=false;_this.innerOnPause();break;
							case 1:_this.playing=true;_this.innerOnStart();break;
						}
					}
				}
			});
			if(old) old();
		}
		window.onYouTubeIframeAPIReady.toString = function(){return "[[[Native Code]]]"}
			
		let tag = document.createElement('script');
		tag.src = "https://www.youtube.com/iframe_api";
		let firstScriptTag = document.getElementsByTagName('script')[0];
		firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

		div = document.createElement("div");
		div.style.position = "absolute";
		div.style.left = "-1000px";
		document.body.appendChild(div);
		
		let wordmark = document.querySelector('[class*="wordmark-"]');
		
		musicPlayer = document.createElement("div");
		musicPlayer.className="dt-music-player";
		musicPlayer.style.display = "none";
		wordmark.parentNode.insertBefore(musicPlayer, wordmark.nextSibling);
		
		musicPlayer.innerHTML = `
			<div id="dt-music-player-play" class="dt-music-player-button">
				<svg class="svg-play" viewBox="0 0 48 48">
					<path d="M16 10v28l22-14z"/>
				</svg>
				<svg class="svg-pause" viewBox="0 0 48 48">
					<path d="M12 38h8V10h-8v28zm16-28v28h8V10h-8z"/>
				</svg>
			</div>
		`;
		playButton = musicPlayer.querySelector("#dt-music-player-play");
		playButton.addEventListener("click", function(){
			_this.toggle();
		});
	}
	
	this.playing = false;
	this.onStart = this.onStop = function(){};
	this.innerOnStart = function(){
		musicPlayer.classList.add("dt-music-player-playing");
		_this.onStart();
	}
	this.innerOnPause = function(){
		musicPlayer.classList.remove("dt-music-player-playing");
		_this.onStop();
	}
	this.innerOnEnd = function(){
		index = (index+1)%(musicList.length);
		player.loadVideoById(musicList[index]);
	}
	this.onReady = function(player){
		_this.play = player.playVideo.bind(player);
		_this.pause = player.pauseVideo.bind(player);
		_this.toggle = function(){
			if(_this.playing) 	_this.pause();
			else 				_this.play();
		}
		_this.start = function(){
			musicPlayer.style.display = "";
			player.loadVideoById(musicList[index]);
			_this.play();
		}
		_this.stop = function(){
			musicList = [];
			index=0;
			_this.pause();
			musicPlayer.style.display = "none";
		}
	}
	
	this.add = function(url){
		let info = {};
		url.split("?")[1].split("&").forEach(function(x){
			let parts = x.split("=");
			info[parts[0]] = parts[1];
		});
		musicList.push(info.v);
		if(!_this.playing)
			_this.start();
		_this.play();
	}
	
})();