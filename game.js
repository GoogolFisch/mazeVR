//import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import * as THREE from 'three';
import * as MAZE from './mazeGen.js';
import * as FENCE_MODEL from './modelGen.js';
import * as PLAYER from './player.js';
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
const infoControl = new INFO_CONTROL.InfoControl(mazeObj,scene);
infoHandler.setMaze(mazeObj);

const player = new PLAYER.Player(renderer,camera,scene,mazeObj);

// a light is required for MeshPhongMaterial to be seen

function onResize(){
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', onResize);
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
	player.reset();
}
function init(){
	infoHandler.canvCallBack = () => {mouseLock();resetGame();};
	canvas.addEventListener("click", mouseLock);
	addEventListener("mousemove", (e) => {
		if (document.pointerLockElement !== canvas){
			reinitNone();
			return;
		}
		player.addYaw  (e.movementX * sensitivity);
		player.addPitch(e.movementY * sensitivity);
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

//
reinitNone();

function handlePC(dt){
	if(document.pointerLockElement === canvas) infoHandler.hideEsc();
	if(document.pointerLockElement !== canvas) infoHandler.showEsc();
	//const updated = cameraRig.update( delta );
	// Update cameraRig rotation from yaw/pitch
	player.updateRigPC();


	// Movement (no collisions; just move cameraRig)
	//forward.set(0, 0, -1).applyQuaternion(cameraRig.quaternion).setY(0).normalize();
	//right.set(1, 0, 0).applyQuaternion(cameraRig.quaternion).setY(0).normalize();

	const v = new THREE.Vector3();
	if (keys.has("KeyW")) v.add(player.getForward());
	if (keys.has("KeyS")) v.sub(player.getForward());
	if (keys.has("KeyD")) v.add(player.getRight());
	if (keys.has("KeyA")) v.sub(player.getRight());
	if (keys.has("Space")) v.add(player.getUp());
	if (keys.has("ShiftLeft")) v.sub(player.getUp());
	if (keys.has("KeyE")) player.addRoll(dt);
	if (keys.has("KeyQ")) player.addRoll(-dt);
	if (keys.has("KeyK")) mazeObj.reMakeMaze(scene);

	if (v.lengthSq() > 0) v.normalize()
	if(!keys.has("KeyL")){
		player.move(v,dt);
		let oldCam3 = player.getOld();
		let newCam3 = player.getNew();
		newCam3 = mazeObj.collideCast(oldCam3,newCam3);
		newCam3 = infoControl.collideWith(newCam3);
		player.setNewPos(newCam3);
	}else{
		player.move(v,dt);
	}
}
let counter = 0;
function handleVR(dt){
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
	player.updateRigVR();
	let c = player.getNew();
	c = mazeObj.collideCast(player.getOld(),c);
	c = infoControl.collideWith(c);
	player.setNewPos(c);
}
let oldInVR = true;
function animate() {
	const dt = clock.getDelta();
	const inVR = renderer.xr.isPresenting;
	//if(inVR && !oldInVR) player.updateToVR();
	if(!inVR && oldInVR) onResize();
	if(inVR)handleVR(dt);
	else handlePC(dt);
	oldInVR = inVR;
	//
		//
	//
	player.finishStep();
	if(mazeObj.shouldNoCount(player.getOld()))inMaze = false;
	if(mazeObj.shouldEnter  (player.getOld()))inMaze =  true;
	if(mazeObj.shouldTimerStart(player.getOld())){
		infoHandler.startMazeTimer();
	}
	if(mazeObj.shouldWin(player.getOld()) && inMaze){
		infoHandler.stopTimer();
	}

	infoHandler.timerTick();
	renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);
