import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

function geometryAddBlock(array,sx,sy,sz,ex,ey,ez){
	// xy-
	array.push(sx,sy,sz);
	array.push(sx,ey,sz);
	array.push(ex,sy,sz);
	array.push(ex,sy,sz);
	array.push(sx,ey,sz);
	array.push(ex,ey,sz);
	// xy+
	array.push(sx,sy,ez);
	array.push(ex,sy,ez);
	array.push(sx,ey,ez);
	array.push(sx,ey,ez);
	array.push(ex,sy,ez);
	array.push(ex,ey,ez);
	// xz-
	array.push(sx,sy,sz);
	array.push(ex,sy,sz);
	array.push(sx,sy,ez);
	array.push(sx,sy,ez);
	array.push(ex,sy,sz);
	array.push(ex,sy,ez);
	// xz+
	array.push(sx,ey,sz);
	array.push(sx,ey,ez);
	array.push(ex,ey,sz);
	array.push(ex,ey,sz);
	array.push(sx,ey,ez);
	array.push(ex,ey,ez);
	// yz-
	array.push(sx,sy,sz);
	array.push(sx,sy,ez);
	array.push(sx,ey,sz);
	array.push(sx,ey,sz);
	array.push(sx,sy,ez);
	array.push(sx,ey,ez);
	// yz+
	array.push(ex,sy,sz);
	array.push(ex,ey,sz);
	array.push(ex,sy,ez);
	array.push(ex,sy,ez);
	array.push(ex,ey,sz);
	array.push(ex,ey,ez);
}
function makeFrameWindow(windows = 0,scale = 0.5,width = 0.02) {
	// Example: simple custom geometry (replace with your generated data)
	let arr = [];
	let ty = 0;
	let tx = 0;
	let factor = 1.0 / ((scale + 1) * windows + 1);
	for(let yov = 0;yov <= windows;yov++){
		if(yov !== 0){
			tx = 0;
			for(let xov = 0;xov <= windows;xov++){
				if(xov !== 0){ tx += scale * factor; }
				geometryAddBlock(arr,
					tx,ty,-width,
					tx + factor,
					ty + scale * factor,
					width);
				tx += factor;
			}
			ty += scale * factor;
		}
		geometryAddBlock(arr,
			0,ty,-width,
			1, ty + factor, width);
		ty += factor;
	}
	const positions = new Float32Array(arr);

	const geometry = new THREE.BufferGeometry();
	geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
	geometry.computeVertexNormals();

	return geometry;
}
export{makeFrameWindow}
