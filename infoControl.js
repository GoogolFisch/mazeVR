import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

function makeTextTexture(text){
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  const W = 200, H = 50;
  canvas.width = W;
  canvas.height = H;

  // background
  ctx.fillStyle = "#1e293b"; // slate-ish
  ctx.fillRect(0, 0, W, H);

  // border
  ctx.strokeStyle = "#93c5fd"; // light blue
  ctx.lineWidth = 10;
  ctx.strokeRect(10, 10, W - 20, H - 20);

  // text
  ctx.fillStyle = "#e5e7eb"; // light gray
  ctx.font = "bold 64px system-ui, -apple-system, Segoe UI, Roboto, Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, W / 2, H / 2);

  // optional: small subtle highlight
  ctx.fillStyle = "rgba(255,255,255,0.06)";
  ctx.fillRect(0, 0, W, 70);

  const texture = new THREE.CanvasTexture(canvas);
  //texture.minFilter = THREE.LinearFilter;
  //texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.magFilter = THREE.NearestFilter;
  texture.needsUpdate = true;
  return texture;
};
class InfoControl{
	_setupLight(){
		this.directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
		this.directionalLight.position.z = 3;
		this.scene.add(this.directionalLight);
		//
		this.ambientlight = new THREE.AmbientLight( 0xeeeeee, 0.4);
		this.scene.add(this.ambientlight);
	}
	constructor(mazeObj,scene){
		this.scene = scene;
		this.mazeObj = mazeObj;
		this._setupLight();
		//
		this.planeObj = null;
		this.rebuildPlane();
	}
	rebuildPlane(){
		if(this.planeObj !== null)
			this.scene.remove(this.planeObj);
		let mzsz = this.mazeObj.size;
		this.planeObj = new THREE.Mesh(
			new THREE.PlaneGeometry(mzsz * 2,mzsz * 2),
			new THREE.MeshPhongMaterial({
				color:"#cccccc",
				//flatShading: true,
			})
		);
		this.planeObj.position.set(mzsz / 2,-2,mzsz / 2);
		this.planeObj.rotation.set(-Math.PI / 2,0,0);
		this.scene.add(this.planeObj);
	}
	onFrame(){
	}
	collideWith(pos){
		let ylow = this.planeObj.position.y + 0.15;
		if(pos.y < ylow){pos.y = ylow;}
		return pos;
	}
};

export {InfoControl,makeTextTexture};
