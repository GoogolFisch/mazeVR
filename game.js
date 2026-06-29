//import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import * as THREE from 'three';
import * as MAZE from './mazeGen.js';
import * as FENCE_MODEL from './modelGen.js';
import * as INFO_HANDLER from './infoHandler.js';
import * as INFO_CONTROL from './infoControl.js';
import { VRButton } from "three/addons/webxr/VRButton.js";
//import {VRButton} from
//"https://unpkg.com/three@0.160.0/examples/jsm/webxr/VRButton.js";
import {XRControllerModelFactory} from "three/addons/webxr/XRControllerModelFactory.js";

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);

const camera = new THREE.PerspectiveCamera(
	60,
	window.innerWidth / window.innerHeight,
	0.01,
	100
);
const cameraRig = new THREE.Group();
cameraRig.position.set(0.5, 0.5, -1.5);
cameraRig.rotation.set(Math.PI,0,0);
cameraRig.add(camera);
scene.add( cameraRig );


const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
renderer.xr.enabled = true;
const canvas = renderer.domElement;
document.body.appendChild(canvas);

//const geometry = new THREE.BoxGeometry(1, 1, 1);
const BoundingFrame = FENCE_MODEL.makeFrameWindow(3,1);
const infoHandler = new INFO_HANDLER.InfoHandler(
	VRButton.createButton( renderer ),mouseLock);
infoHandler.resetTimer();
const mazeObj = new MAZE.Maze(3,0,BoundingFrame,infoHandler);
mazeObj.reMakeMaze(scene);
const infoControl = new INFO_CONTROL.InfoControl(mazeObj,camera,scene);
infoHandler.setMaze(mazeObj);


// a light is required for MeshPhongMaterial to be seen

window.addEventListener('resize', () => {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
});
// -- Minimal FPS Controller
// --- Minimal FPS controls ---
let yaw = Math.PI;    // camera heading
let pitch = 0;  // camera look up/down
let roll = 0;  // camera look up/down
const sensitivity = 0.003; // mouse sensitivity
const moveSpeed = 3;

const keys = new Set();
addEventListener("keydown", (e) => keys.add(e.code));
addEventListener("keyup", (e) => keys.delete(e.code));

// Pointer lock

const forward = new THREE.Vector3();
const right = new THREE.Vector3();
const up = new THREE.Vector3().set(0,1,0);

const clock = new THREE.Clock();
let inMaze = false;

let stopInit = false;
function mouseLock(){
	canvas.requestPointerLock();
	infoHandler.hideEsc();
	reinitPC();
}
function resetGame(){
	mazeObj.reMakeMaze(scene);
	infoHandler.resetTimer();
	cameraRig.position.set(0.5,0.5,-1.5);
	pitch = 0;
	roll = 0;
	yaw = Math.PI;
}
function init(){
	infoHandler.canvCallBack = () => {mouseLock();resetGame();};
	canvas.addEventListener("click", mouseLock);
	addEventListener("mousemove", (e) => {
		if (document.pointerLockElement !== canvas){
			reinitNone();
			return;
		}
		yaw   -= e.movementX * sensitivity;
		pitch -= e.movementY * sensitivity;
		const limit = Math.PI / 2 - 0.02;
		pitch = Math.max(-limit, Math.min(limit, pitch));
	});
}
init();
function reinitNone(){
	if(stopInit){return;}
	infoHandler.showAll();
	stopInit = true;
}
function reinitPC(){
	stopInit = false;
	infoHandler.show();
}
const controller0 = renderer.xr.getController(0);
const controller1 = renderer.xr.getController(1);
cameraRig.add(controller0, controller1);
const grip0 = renderer.xr.getControllerGrip(0);
const grip1 = renderer.xr.getControllerGrip(1);
function onSelectStart() { console.log('select start'); }
function onSelectEnd()   { console.log('select end'); }

// Some runtimes use squeeze for grip/secondary
function onSqueezeStart() { console.log('squeeze start'); }
function onSqueezeEnd()   { console.log('squeeze end'); }

controller0.addEventListener('selectstart', onSelectStart);
controller0.addEventListener('selectend', onSelectEnd);
controller0.addEventListener('squeezestart', onSqueezeStart);
controller0.addEventListener('squeezeend', onSqueezeEnd);

controller1.addEventListener('selectstart', onSelectStart);
controller1.addEventListener('selectend', onSelectEnd);
controller1.addEventListener('squeezestart', onSqueezeStart);
controller1.addEventListener('squeezeend', onSqueezeEnd);
console.log([controller0,controller1,grip0,grip1]);
//
const boxgeo = new THREE.BoxGeometry(0.1, 0.1, 0.1);
const cube0 = new THREE.Mesh( boxgeo,
	new THREE.MeshStandardMaterial({ color: 0x33aaff })
);
const cube1 = new THREE.Mesh( boxgeo,
	new THREE.MeshStandardMaterial({ color: 0x33aaff })
);
grip0.add(cube0);
cameraRig.add(grip0);
grip1.add(cube1);
cameraRig.add(grip1);

//
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
function hookEvents(controller) {
	controller.addEventListener("selectstart", () => controller.userData.selecting = true);
	controller.addEventListener("selectend", () => controller.userData.selecting = false);
}
hookEvents(controller0);
hookEvents(controller1);
function reinitVR(){
	stopInit = false;
	infoHandler.hide();
}
//init();
reinitNone();

let lastCamera = cameraRig.position;
function handlePC(dt){
	if(document.pointerLockElement === canvas) infoHandler.hideEsc();
	if(document.pointerLockElement !== canvas) infoHandler.showEsc();
	//const updated = cameraRig.update( delta );
	// Update cameraRig rotation from yaw/pitch
	cameraRig.rotation.set(pitch,yaw,roll,"YXZ");


	// Movement (no collisions; just move cameraRig)
	//forward.set(0, 0, -1).applyQuaternion(cameraRig.quaternion).setY(0).normalize();
	//right.set(1, 0, 0).applyQuaternion(cameraRig.quaternion).setY(0).normalize();
	forward.set(0, 0, -1).applyQuaternion(cameraRig.quaternion).normalize();
	right.set(1, 0, 0).applyQuaternion(cameraRig.quaternion).normalize();

	const v = new THREE.Vector3();
	if (keys.has("KeyW")) v.add(forward);
	if (keys.has("KeyS")) v.sub(forward);
	if (keys.has("KeyD")) v.add(right);
	if (keys.has("KeyA")) v.sub(right);
	if (keys.has("Space")) v.add(up);
	if (keys.has("ShiftLeft")) v.sub(up);
	if (keys.has("KeyE")) roll += dt;
	if (keys.has("KeyQ")) roll -= dt;

	if (v.lengthSq() > 0) v.normalize().multiplyScalar(moveSpeed * dt);
	if(!keys.has("KeyL")){
		let oldCamera3 = cameraRig.position.clone();
		cameraRig.position.add(v); // *
		let c = cameraRig.position;
		c = mazeObj.collideCast(oldCamera3,c);
		c = infoControl.collideWith(c);
		cameraRig.position.set(c.x,c.y,c.z);
	}else{
		cameraRig.position.add(v);
	}
}
let counter = 0;
function handleVR(dt){
	let cam = camera;
	renderer.xr.getCamera(cam); // safe even if already set
	counter += dt
	if(counter > 1){
		counter--;
		/*
		const both = [
			readControllerInput(controller0),
			readControllerInput(controller1),
			readControllerInput(grip0),
			readControllerInput(grip1),
		];
		if(both[0] != null)
			console.log(both);
		const gp = controller1.gamepad; // may be null depending on device/session
		if (gp) {
			// Map indices by your controller; common patterns:
			// gp.buttons[0] often trigger, gp.buttons[1] often grip/secondary (varies!)
			const pressed = gp.buttons[0]?.pressed;
			if (pressed) console.log('button 0 pressed');
		}
		// */
	}
	let c = cam.position;
	c = mazeObj.collideCast(lastCamera,c);
	c = infoControl.collideWith(c);
	cam.position.copy(c.x,c.y,c.z);
}
function animate() {
	const dt = clock.getDelta();
	const inVR = renderer.xr.isPresenting;
	if(inVR)handleVR(dt);
	else handlePC(dt);
	lastCamera = cameraRig.position.clone();
	if(mazeObj.shouldNoCount(cameraRig.position))inMaze = false;
	if(mazeObj.shouldEnter  (cameraRig.position))inMaze =  true;
	if(mazeObj.shouldTimerStart(cameraRig.position)){
		infoHandler.startMazeTimer();
	}
	if(mazeObj.shouldWin(cameraRig.position) && inMaze){
		infoHandler.stopTimer();
	}

	infoHandler.timerTick();
	renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);
