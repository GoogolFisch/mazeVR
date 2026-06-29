import * as THREE from 'three';
import { VRButton } from "three/addons/webxr/VRButton.js";
//import {VRButton} from
//"https://unpkg.com/three@0.160.0/examples/jsm/webxr/VRButton.js";
import {XRControllerModelFactory} from "three/addons/webxr/XRControllerModelFactory.js";


function readControllerInput(controller) {
	//console.log([controller,controller.inputSource]);
	const inputSource = controller.inputSource;
	if (!inputSource || !inputSource.gamepad)
		return null;
	const gp = inputSource.gamepad;
	const buttons = gp.buttons.map(b => b.pressed);
	const axes = gp.axes.slice(); // often [x,y] thumbstick / touchpad
	return { buttons, axes,
		handedness: inputSource.handedness ?? "unknown"
	};
}
const vecFront = new THREE.Vector3();
const vecRight = new THREE.Vector3();
const vecUp = new THREE.Vector3().set(0,1,0);
class Player{
	_setupLight(){
		//pointlight.parent = camera;
		this.camera.add(this.pointlight);
		this.ambientlight = new THREE.AmbientLight( 0xeeeeee, 0.4);
		this.scene.add(this.ambientlight);
	}
	_vrSetup(){
		this.con0Sel = false;
		this.con1Sel = false;
		this.con0Squ = false;
		this.con1Squ = false;
		this.con0Anchor = null;
		this.con1Anchor = null;
		//
		this.controller0 = this.renderer.xr.getController(0);
		this.controller1 = this.renderer.xr.getController(1);
		this.cameraRig.add(this.controller0, this.controller1);
		this.grip0 = this.renderer.xr.getControllerGrip(0);
		this.grip1 = this.renderer.xr.getControllerGrip(1);

		this.controller0.addEventListener('selectstart',
			() => {this.con0Sel = true;});
		this.controller0.addEventListener('selectend',
			() => {this.con0Sel = false;});
		this.controller0.addEventListener('squeezestart',
			() => {this.con0Squ = true;});
		this.controller0.addEventListener('squeezeend',
			() => {this.con0Squ = false;});

		this.controller1.addEventListener('selectstart',
			() => {this.con1Sel = true;});
		this.controller1.addEventListener('selectend',
			() => {this.con1Sel = false;});
		this.controller1.addEventListener('squeezestart',
			() => {this.con1Squ = true;});
		this.controller1.addEventListener('squeezeend',
			() => {this.con1Squ = false;});
		//console.log([controller0,controller1,grip0,grip1]);
		//
		this.boxgeo = new THREE.BoxGeometry(0.1, 0.1, 0.1);
		this.cube0 = new THREE.Mesh(this.boxgeo,
			new THREE.MeshStandardMaterial({ color: 0x33aaff })
		);
		this.cube1 = new THREE.Mesh(this.boxgeo,
			new THREE.MeshStandardMaterial({ color: 0x33aaff })
		);
		this.grip0.add(this.cube0);
		this.cameraRig.add(this.grip0);
		this.grip1.add(this.cube1);
		this.cameraRig.add(this.grip1);
	}
	//
	//
	//
	constructor(renderer,camera,scene){
		this.renderer = renderer;
		this.scene = scene;
		this.camera = camera;
		this.cameraRig = new THREE.Group();
		this.reset();
		this._setupLight();
		this._vrSetup();
		this.cameraRig.add(camera);
		this.scene.add( this.cameraRig );
		this.lastPos = this.cameraRig.position.clone();
		this.moveSpeed = 3;
	}
	reset(){
		this.cameraRig.position.set(0.5, 0.5, -1.5);
		this.cameraRig.rotation.set(0,0,0);
		this.camera.rotation.set(0,0,0);
		this.pitch = 0;
		//this.yaw = -Math.PI / 2;
		this.yaw = Math.PI;
		this.roll = 0;
	}
	//
	//
	//
	addYaw(value){ this.yaw -= value; }
	addRoll(value){ this.roll -= value; }
	addPitch(value){
		this.pitch -= value;
		const limit = Math.PI / 2 - 0.02;
		this.pitch = Math.max(-limit, Math.min(limit, this.pitch));
	}
	updateRigPC(){
		this.camera.rotation.set(this.pitch,this.yaw,this.roll,"YXZ");
		this.camera.position.set(0,0,0);
	}
	updateRigVR(){
		let dif;
		if(this.con0Anchor !== null){
			dif = this.con0Anchor.clone();
			dif.sub(this.grip0.position);
			this.cameraRig.position.add(dif);
		}
		if(this.con1Anchor !== null){
			dif = this.con1Anchor.clone();
			dif.sub(this.grip1.position);
			this.cameraRig.position.add(dif);
		}
		//
		if(!this.con0Squ) this.con0Anchor = null;
		else this.con0Anchor = this.grip0.position.clone();
		if(!this.con1Squ) this.con1Anchor = null;
		else this.con1Anchor = this.grip1.position.clone();
	}
	getForward(){
		vecFront.set(0, 0, -1);
		vecFront.applyQuaternion(this.cameraRig.quaternion);
		vecFront.applyQuaternion(this.camera.quaternion).normalize();
		return vecFront;
	}
	getRight(){
		vecRight.set(1, 0, 0);
		vecRight.applyQuaternion(this.cameraRig.quaternion);
		vecRight.applyQuaternion(this.camera.quaternion).normalize();
		return vecRight;
	}
	getUp(){
		return vecUp; 
	}
	// //
	getOld(){ return this.lastPos; }
	getNew(){ return this.cameraRig.position; }
	setNewPos(pos){this.cameraRig.position.copy(pos);}
	move(vel,dt){
		let fac = dt * this.moveSpeed;
		vel.multiplyScalar(fac);
		this.cameraRig.position.add(vel);
	}
	finishStep(){this.lastPos.copy(this.cameraRig.position);}
};

export {Player};
