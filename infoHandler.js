
class InfoHandler{
	constructor(sDisp,mDisp,ttDisp,mtDisp){
		this.sizeDisplay  = document.getElementById("size-display");
		this.mutDisplay   = document.getElementById("mut-display");
		this.ttimeDisplay = document.getElementById("total-time");
		this.mtimeDisplay = document.getElementById("maze-time");
		this.infoShow     = document.getElementById("info-show");
		this.escapeShow   = document.getElementById("escape-show");

		this.ttimer = null;
		this.mtimer = null;
		this.noTimer = false;
	}
	setSize(value){
		this.sizeDisplay.innerText = `Size: ${value}`;
	}
	setMutation(value){
		this.mutDisplay.innerText = `Mut: ${value}`;
	}
	_displayTime(start){
		let current = new Date();
		let deltaMs = current - start;
		let csec = Math.floor(deltaMs / 10) % 10;
		let dsec = Math.floor(deltaMs / 100) % 10;
		let sec0 = Math.floor(deltaMs / 1000) % 10;
		let sec1 = Math.floor(deltaMs / 10000) % 6;
		let min0 = Math.floor(deltaMs / 60000) % 10;
		return `${min0}:${sec1}${sec0}:${dsec}${csec}`;
	}
	resetTimer(){
		this.noTimer = false;
		this.ttimer = new Date();
		this.mtimer = null;
		this.ttimeDisplay.innerText = "0:00:00";
		this.mtimeDisplay.innerText = "0:00:00";
	}
	startMazeTimer(){
		if(!this.noTimer && this.mtimer === null)
			this.mtimer = new Date();
		this.noTimer = true;
	}
	stopTimer(){
		this.ttimer = null;
		this.mtimer = null;
	}
	timerTick(){
		if(this.mtimer !== null)
			this.mtimeDisplay.innerText = this._displayTime(this.mtimer);
		if(this.ttimer !== null)
			this.ttimeDisplay.innerText = this._displayTime(this.ttimer);
	}
	hide(){
		this.infoShow.classList.add("no-show");
		this.escapeShow.classList.add("no-show");
	}
	show(){
		this.infoShow.classList.remove("no-show");
		//this.escapeShow.classList.remove("no-show");
	}
}


export {InfoHandler};
