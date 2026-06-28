import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import * as MAZE from './mazeGen.js';
import * as FENCE_MODEL from './modelGen.js';
import * as INFO_HANDLER from './infoHandler.js';
import { VRButton } from "https://unpkg.com/three@0.160.0/examples/jsm/webxr/VRButton.js";

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);

const camera = new THREE.PerspectiveCamera(
	60,
	window.innerWidth / window.innerHeight,
	0.01,
	100
);
camera.position.set(0.5, 0.5, -1.5);
scene.add( camera );


const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.xr.enable = true;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

//const geometry = new THREE.BoxGeometry(1, 1, 1);
const BoundingFrame = FENCE_MODEL.makeFrameWindow(3,1);
const material = new THREE.MeshNormalMaterial();
const infoHandler = new INFO_HANDLER.InfoHandler(
	document.getElementById("size-display"),
	document.getElementById("mut-display"),
	document.getElementById("total-time"),
	document.getElementById("maze-time"),
);
infoHandler.resetTimer();
const mazeObj = new MAZE.Maze(3,0,BoundingFrame,infoHandler);
mazeObj.reMakeMaze(scene);
const cube = new THREE.Mesh(BoundingFrame, material);


// a light is required for MeshPhongMaterial to be seen
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5)
directionalLight.position.z = 3
scene.add(directionalLight)
//scene.add(cube);
const pointlight = new THREE.PointLight( 0xcccccc, 0.7, 10 );
pointlight.position.set( 0, 0, 0 );
pointlight.castShadow = false;
//pointlight.parent = camera;
camera.add( pointlight );
const ambientlight = new THREE.AmbientLight( 0xeeeeee, 0.4);
scene.add(ambientlight);

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
const sensitivity = 0.002; // mouse sensitivity
const moveSpeed = 3;

const keys = new Set();
addEventListener("keydown", (e) => keys.add(e.code));
addEventListener("keyup", (e) => keys.delete(e.code));

// Pointer lock
const canvas = renderer.domElement;
canvas.addEventListener("click", () => canvas.requestPointerLock());

addEventListener("mousemove", (e) => {
	if (document.pointerLockElement !== canvas) return;
	yaw   -= e.movementX * sensitivity;
	pitch -= e.movementY * sensitivity;
	const limit = Math.PI / 2 - 0.02;
	pitch = Math.max(-limit, Math.min(limit, pitch));
});

const forward = new THREE.Vector3();
const right = new THREE.Vector3();
const up = new THREE.Vector3().set(0,1,0);

const clock = new THREE.Clock();
let inMaze = false;

function animate() {
	const dt = clock.getDelta();

	
	//const updated = cameraControls.update( delta );
	// Update camera rotation from yaw/pitch
	camera.rotation.set(pitch,yaw,roll,"YXZ");


	// Movement (no collisions; just move camera)
	//forward.set(0, 0, -1).applyQuaternion(camera.quaternion).setY(0).normalize();
	//right.set(1, 0, 0).applyQuaternion(camera.quaternion).setY(0).normalize();
	forward.set(0, 0, -1).applyQuaternion(camera.quaternion).normalize();
	right.set(1, 0, 0).applyQuaternion(camera.quaternion).normalize();

	const v = new THREE.Vector3();
	if (keys.has("KeyW")) v.add(forward);
	if (keys.has("KeyS")) v.sub(forward);
	if (keys.has("KeyD")) v.add(right);
	if (keys.has("KeyA")) v.sub(right);
	if (keys.has("Space")) v.add(up);
	if (keys.has("ShiftLeft")) v.sub(up);
	if (keys.has("KeyE")) roll += dt;
	if (keys.has("KeyQ")) roll -= dt;
	if(keys.has("KeyK")){
		mazeObj.reMakeMaze(scene);
		infoHandler.resetTimer();
		camera.position.set(0.5,0.5,-1.5);
		pitch = 0;
		roll = 0;
		yaw = Math.PI;
	}

	if (v.lengthSq() > 0) v.normalize().multiplyScalar(moveSpeed * dt);
	let oldCamera3 = camera.position.clone();
	camera.position.add(v); // */
	if(!keys.has("KeyL")){
		let c = camera.position;
		c = mazeObj.collideCast(oldCamera3,c);
		camera.position.set(c.x,c.y,c.z);
		if(mazeObj.shouldNoCount(c))inMaze = false;
		if(mazeObj.shouldTimerStart(c)){
			inMaze = true;
			infoHandler.startMazeTimer();
		}
		if(mazeObj.shouldWin(c) && inMaze){
			infoHandler.stopTimer();
		}
	}


	infoHandler.timerTick();

	renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);
