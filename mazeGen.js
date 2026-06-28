import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

function getOffFrom(pos,sz,dir){
	if(Math.floor(dir / 2) == 0) return pos +          ((dir    ) * 2 - 1)
	if(Math.floor(dir / 2) == 1) return pos + sz *     ((dir - 2) * 2 - 1)
	if(Math.floor(dir / 2) == 2) return pos + sz * sz *((dir - 4) * 2 - 1)
	return -1;
}
function materialForF(x,y,z,dir,sz){
	let cr = (x + 1) / (sz + 1);
	let cg = (y + 1) / (sz + 1);
	let cb = (z + 1) / (sz + 1);
	cr = Math.floor(cr * 256);
	cg = Math.floor(cg * 256);
	cb = Math.floor(cb * 256);

	return new THREE.MeshPhongMaterial({
		color: `rgb(${cr},${cg},${cb})`,
		flatShading: true,
	});
}
class Maze{
	constructor(sz,mutate,wall=null,infoHandler=null){
		this.size = sz;
		this.mutate = mutate;
		this.mz = [];
		this.objs = [];
		this.wall = wall;
		this.infoHandler = infoHandler;
	}
	setSize(size,mut){
		this.infoHandler.setSize(size);
		this.infoHandler.setMutation(mut);
	}
	genMazeJoin(){
		this.mz = [];
		const sz = this.size;
		const sz3 = sz * sz * sz;
		for(let cnt = 0;cnt < sz3;cnt++)this.mz.push(0);
		const select = Math.floor(Math.random() * sz3);
		let target = [];
		//
		let px = select % sz;
		let py = Math.floor(select / sz) % sz;
		let pz = Math.floor(select / sz / sz) % sz;
		if(px < sz - 1)target.push(select +       1);
		if(py >      0)target.push(select -      sz);
		if(py < sz - 1)target.push(select +      sz);
		if(pz >      0)target.push(select - sz * sz);
		if(pz < sz - 1)target.push(select + sz * sz);
		//
		this.mz[select] = 1024;
		let pos,dir,p2;
		while(target.length){
			let id = Math.floor(Math.random() * target.length);
			pos = target.pop(id);

			if(this.mz[pos] !== 0)continue;
			px = pos % sz;
			py = Math.floor(pos / sz) % sz;
			pz = Math.floor(pos / sz / sz) % sz;
			dir = -1;
			p2 = -1;
			while(1){
				dir = Math.floor(Math.random() * 6);
				p2 = getOffFrom(pos,sz,dir);
				if(px ===      0 && dir === 0)continue;
				if(px === sz - 1 && dir === 1)continue;
				if(py ===      0 && dir === 2)continue;
				if(py === sz - 1 && dir === 3)continue;
				if(pz ===      0 && dir === 4)continue;
				if(pz === sz - 1 && dir === 5)continue;
				if(this.mz[p2] === 0)continue;
				break;
			}
			this.mz[pos] |= 1 << dir;
			this.mz[p2] |= 1 << (1 ^ dir);
			//
				if(px >      0)target.push(pos -       1);
			if(px < sz - 1)target.push(pos +       1);
			if(py >      0)target.push(pos -      sz);
			if(py < sz - 1)target.push(pos +      sz);
			if(pz >      0)target.push(pos - sz * sz);
			if(pz < sz - 1)target.push(pos + sz * sz);
		}
		this.mz[select] &= ~1024;
		return this.mz;
	}
	genMazeMutate(){
		let sz = this.size;
		let m = this.mutate;
		for(let cnt = 0;cnt < m;cnt++){
			for(let _ = 0;_ < sz * m;_++){
				let pos = Math.floor(Math.random() * this.mz.length);
				let px = pos % sz;
				let py = Math.floor(pos / sz) % sz;
				let pz = Math.floor(pos / sz / sz) % sz;
				let dir = -1;
				let p2 = -1;
				//  //  //  //
				dir = Math.floor(Math.random() * 6);
				p2 = getOffFrom(pos,sz,dir);
				if(px ===      0 && dir === 0)continue;
				if(px === sz - 1 && dir === 1)continue;
				if(py ===      0 && dir === 2)continue;
				if(py === sz - 1 && dir === 3)continue;
				if(pz ===      0 && dir === 4)continue;
				if(pz === sz - 1 && dir === 5)continue;
				if(this.mz[pos] & (1 << dir))continue;
				//  //  //  //
				this.mz[pos] |= 1 << dir;
				this.mz[p2] |= 1 << (1 ^ dir);
				break;
			}
		}
	}
	makeMaze(gener){
		let sz = this.size;
		this.mz[0] |= 16;
		this.mz[sz * sz * sz - 1] |= 32;
		let sz2 = sz * sz;

		this.objs = [];
		for(let r = 0;r < sz;r++){
			for(let h = 0;h < sz;h++){
				if(!(this.mz[r + h * sz + (sz - 1) * sz2] & (1 << 5))){
					let o = new THREE.Mesh(
						this.wall,
						materialForF(r,h,sz,"Z",sz)
					);
					this.objs.push(o);
					o.position.x = r;
					o.position.y = h;
					o.position.z = sz;
				}
				if(!(this.mz[r + h * sz2 + (sz - 1) * sz] & (1 << 3))){
					let o = new THREE.Mesh(
						this.wall,
						materialForF(r,sz,h,"Y",sz)
					);
					this.objs.push(o);
					o.position.x = r;
					o.position.y = sz;
					o.position.z = h;
					o.rotation.set(Math.PI / 2,0,0);
				}
				if(!(this.mz[r * sz + h * sz2 + (sz - 1)] & (1 << 1))){
					let o = new THREE.Mesh(
						this.wall,
						materialForF(sz,r,h,"X",sz)
					);
					this.objs.push(o);
					o.position.x = sz;
					o.position.y = r;
					o.position.z = h;
					o.rotation.set(0,-Math.PI / 2,0);
				}
			}
		}
		for(let layer = 0;layer < sz;layer++){
			for(let r = 0;r < sz;r++){
				for(let h = 0;h < sz;h++){
					if(!(this.mz[r + h * sz + layer * sz2] & (1 << 4))){
						let o = new THREE.Mesh(
							this.wall,
							materialForF(r,h,layer,"Z",sz)
						);
						this.objs.push(o);
						o.position.x = r;
						o.position.y = h;
						o.position.z = layer;
					}
					if(!(this.mz[r + h * sz2 + layer * sz] & (1 << 2))){
						let o = new THREE.Mesh(
							this.wall,
							materialForF(r,layer,h,"Y",sz)
						);
						this.objs.push(o);
						o.position.x = r;
						o.position.y = layer;
						o.position.z = h;
						o.rotation.set(Math.PI / 2,0,0);
					}
					if(!(this.mz[r * sz + h * sz2 + layer] & (1 << 0))){
						let o = new THREE.Mesh(
							this.wall,
							materialForF(layer,r,h,"X",sz)
						);
						this.objs.push(o);
						o.position.x = layer;
						o.position.y = r;
						o.position.z = h;
						o.rotation.set(0,-Math.PI / 2,0);
					}
				}
			}
		}
		return this.objs;
	}
	reMakeMaze(scene){
		this.objs.forEach((v) => {
			scene.remove(v);
		});
		//this.objs = this.makeMaze(() => this.genMazeJoin());
		this.genMazeJoin();
		this.genMazeMutate();
		this.objs = this.makeMaze();
		this.objs.forEach((v) => {
			scene.add(v);
		});
		return this.objs;
	}
	//  //
	_collideAABB(pos){
		if(-1 > pos.x || pos.x > this.size)return false;
		if(-1 > pos.y || pos.y > this.size)return false;
		if(-1 > pos.z || pos.z > this.size)return false;
		return true;
	}
	_collideInsideAABB(pos){
		if(0 > pos.x || pos.x >= this.size)return false;
		if(0 > pos.y || pos.y >= this.size)return false;
		if(0 > pos.z || pos.z >= this.size)return false;
		return true;
	}
	_collideRadiusAABB(pos,radius){
		if(-radius > pos.x || pos.x >= this.size + radius)return false;
		if(-radius > pos.y || pos.y >= this.size + radius)return false;
		if(-radius > pos.z || pos.z >= this.size + radius)return false;
		return true;
	}
	_collideRadius(pos,radius){
		let rx = pos.x - Math.round(pos.x);
		let ry = pos.y - Math.round(pos.y);
		let rz = pos.z - Math.round(pos.z);
		let fac = 1;
		if(radius * radius > rx * rx + ry * ry){
			fac = radius / Math.sqrt(rx * rx + ry * ry);
			rx *= fac;
			ry *= fac;
		}
		if(radius * radius > rx * rx + rz * rz){
			fac = radius / Math.sqrt(rx * rx + rz * rz);
			rx *= fac;
			rz *= fac;
		}
		if(radius * radius > ry * ry + rz * rz){
			fac = radius / Math.sqrt(ry * ry + rz * rz);
			ry *= fac;
			rz *= fac;
		}
		return {x:Math.round(pos.x) + rx,
			y:Math.round(pos.y) + ry,
			z:Math.round(pos.z) + rz}

	}
	_collideInside(pos,radius){
		let fx = pos.x % 1;
		let fy = pos.y % 1;
		let fz = pos.z % 1;
		let hx = Math.floor(pos.x);
		let hy = Math.floor(pos.y);
		let hz = Math.floor(pos.z);
		let idx = hx + this.size * hy + this.size * this.size * hz;
		let ft = this.mz[idx];
		if((ft & (1 << 0)) == 0 && fx <     radius)
			fx =     radius;
		if((ft & (1 << 1)) == 0 && fx > 1 - radius)
			fx = 1 - radius;
		if((ft & (1 << 2)) == 0 && fy <     radius)
			fy =     radius;
		if((ft & (1 << 3)) == 0 && fy > 1 - radius)
			fy = 1 - radius;
		if((ft & (1 << 4)) == 0 && fz <     radius)
			fz =     radius;
		if((ft & (1 << 5)) == 0 && fz > 1 - radius)
			fz = 1 - radius;
		return {x:fx + hx,y: fy + hy,z:fz + hz}; 
	}
	_collideOutside(pos,radius){
		let fx = pos.x - Math.floor(pos.x);
		let fy = pos.y - Math.floor(pos.y);
		let fz = pos.z - Math.floor(pos.z);
		let pInX = Math.max(0,Math.min(Math.floor(pos.x),this.size - 1));
		let pInY = Math.max(0,Math.min(Math.floor(pos.y),this.size - 1));
		let pInZ = Math.max(0,Math.min(Math.floor(pos.z),this.size - 1));
		let idx = pInX + this.size * pInY + this.size * this.size * pInZ;
		let ft = this.mz[idx];
		let inX = 0 < pos.x && pos.x < this.size;
		let inY = 0 < pos.y && pos.y < this.size;
		let inZ = 0 < pos.z && pos.z < this.size;
		if((ft & (1 << 1)) == 0 && fx <     radius &&
			pos.x >= this.size && inY && inZ) fx =     radius;
		if((ft & (1 << 0)) == 0 && fx > 1 - radius &&
			pos.x <= 0         && inY && inZ) fx = 1 - radius;
		if((ft & (1 << 3)) == 0 && fy <     radius &&
			pos.y >= this.size && inX && inZ) fy =     radius;
		if((ft & (1 << 2)) == 0 && fy > 1 - radius &&
			pos.y <= 0         && inX && inZ) fy = 1 - radius;
		if((ft & (1 << 5)) == 0 && fz <     radius &&
			pos.z >= this.size && inY && inX) fz =     radius;
		if((ft & (1 << 4)) == 0 && fz > 1 - radius &&
			pos.z <= 0         && inY && inX) fz = 1 - radius;
		return {x:Math.floor(pos.x) + fx,
			y:Math.floor(pos.y) + fy,
			z:Math.floor(pos.z) + fz};
	}
	collideWith(pos,radius = 0.15){
		if(this._collideInsideAABB(pos)){
			pos = this._collideInside(pos,radius);
		}else if(this._collideRadiusAABB(pos,radius)){
			pos = this._collideOutside(pos,radius);
		}
		if(this._collideRadiusAABB(pos,radius)){
			pos = this._collideRadius(pos,radius);
		}/**/

		return pos;
	}
	collideCast(pos,pos2){
		const radius = 0.15;
		let dir = {x:pos2.x - pos.x,y:pos2.y - pos.y,z:pos2.z - pos.z};
		let len = Math.sqrt(dir.x * dir.x + dir.y * dir.y + dir.z * dir.z);
		let fact = radius / len;
		dir = {x:dir.x * fact,y:dir.y * fact,z:dir.z * fact};
		let delta = 1;
		// this is dumb!
		for(let itr = 0;itr < len;itr += delta){
			delta = Math.min(radius,len-itr);
			pos = { x:pos.x + dir.x * delta / radius,
				y:pos.y + dir.y * delta / radius,
				z:pos.z + dir.z * delta / radius};
			pos = this.collideWith(pos,radius);
		}
		return pos;
	}

	shouldTimerStart(pos){
		return  0 < pos.x && pos.x < 1 &&
			0 < pos.y && pos.y < 1 &&
			0 < pos.z && pos.z < 1;
	}
	shouldNoCount(pos){
		return  0 > pos.x || 0 > pos.y || 0 > pos.z;
	}
	shouldWin(pos){
		return (!this.shouldNoCount(pos)) && (
			pos.x > this.size ||
			pos.y > this.size ||
			pos.z > this.size
		);
	}
}

export {Maze};
