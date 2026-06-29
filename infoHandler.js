
class InfoHandler{
	constructor(vrbutton,canvCallBack){
		this.sizeDisplay  = document.getElementById("size-display");
		this.mutDisplay   = document.getElementById("mut-display");
		this.ttimeDisplay = document.getElementById("total-time");
		this.mtimeDisplay = document.getElementById("maze-time");
		this.infoShow     = document.getElementById("info-show");
		this.escapeShow   = document.getElementById("escape-show");
		this.escapeGrid   = document.getElementById("escape-grid");

		this.canvasCallb = canvCallBack;
		this.VRButton = vrbutton;
		this.ttimer   = null;
		this.mtimer   = null;
		this.noTimer  = false;
		this.maze     = null;
		this._makeSelectors(null);
		this._makeVRButton();
	}
	setMaze(mz){this.maze = mz;}
	_makeRangeSelector(min,max,val,id,label,adding,callback){
		let sel = document.createElement("input");
		sel.type = "range";
		sel.min = min;
		sel.max = max;
		sel.value = val;
		sel.id = id;
		let lab = document.createElement("label");
		lab.for = id;
		lab.innerText = label;
		let valEl = document.createElement("div");
		valEl.innerText = val;
		sel.addEventListener("input",(v) => {
			valEl.innerText = v.target.value;
		});
		adding.appendChild(lab);
		adding.appendChild(sel);
		adding.appendChild(valEl);
		return {sel:sel,lab:lab,val:valEl};
	}
	_makeSelectors(callback){
		this.optionsGrid = document.createElement("div");
		this.optionsGrid.style.display = "grid"
		this.optionsGrid.style.gridTemplateColumns = "auto auto auto"
		let szS = this._makeRangeSelector(
			2,8,3,"size-selector","Size:",this.optionsGrid,null);
		let mtS = this._makeRangeSelector(
			0,8,0,"mut-selector","Mutations:",this.optionsGrid,null);
		this.escapeGrid.appendChild(this.optionsGrid);
		this.sizeSelector = szS.sel;
		this.mutSelector  = mtS.sel;
		this.sizeWrapper = szS;
		this.mutWrapper  = mtS;
		//
		this.mazeButton = document.createElement("button");
		this.mazeButton.innerText = "New Maze";
		/*this.mazeButton.style.width = "fit-content";
		this.mazeButton.style.backgroundColor = "rgba(48,48,48,0.1)";
		this.mazeButton.style.border = "2px solid gray";
		this.mazeButton.style.borderRadius = "4px";*/
		this.mazeButton.addEventListener("click",(e) => this._makeNewMaze(e));
		this.escapeGrid.appendChild(this.mazeButton);
	}
	_makeNewMaze(event){
		if(this.maze == null)return;
		this.maze.setSize(
			this.sizeSelector.value - 0,
			this.mutSelector.value - 0
		);
		this.canvCallBack();
	}
	_makeVRButton(){
		this.VRButtonDiv = document.createElement("div");
		this.VRButton.style.position = "";
		this.VRButton.style.display = "inline-block";
		this.VRButtonDiv.appendChild(this.VRButton);
		this.escapeGrid.appendChild(this.VRButtonDiv);
		//this.escapeShow.appendChild(this.escapeGrid);
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
	hideEsc(){ this.escapeShow.classList.add("no-show"); }
	showEsc(){ this.escapeShow.classList.remove("no-show"); }
	showAll(){this.show();this.showEsc();}
}


export {InfoHandler};
