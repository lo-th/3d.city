
//------------------------------------------------------//
//                 DESTRUCTOR                           //
//------------------------------------------------------//

'use strict';

V3D.Destructor = function(){
	this.emitter = null;
	this.particleGroup = null;
	this.atmosphereBurnEmitter = null;

	this.obj = [];
	this.objInfo = [];

	this.timestep = 1000/60;
	this.timer;
	this.time;
	this.maxDecal;
	this.posDecal;
	this.reflectionCube = null;
	this.smokeTexture = null;
	this.isDestroy = false;
	this.isBurn = false;
	

	this.snd_destroy = null;
	this.snd_destroy2 = null;

	init();
}


V3D.Destructor.prototype = {
    constructor: V3D.Destructor,
    init:function() {

    	// environement
		var c3 = document.createElement("canvas");
		var ctx = c3.getContext("2d");
		c3.width = c3.height = 64;
		ctx.rect(0, 0, 64, 64);
	    ctx.fillStyle = "#cc7f66";
		ctx.fill();

		this.reflectionCube = new THREE.Texture([c3,c3,c3,c3,c3,c3]);
		this.reflectionCube.needsUpdate = true;

		// texture
		this.smokeTexture = THREE.ImageUtils.loadTexture('./img/smoke.png');

		// sound
		this.snd_destroy = new Audio("./sound/explosion-low.mp3");
	    this.snd_destroy2 = new Audio("./sound/explosion-high.mp3");
	},
	destruct : function(geo, mat, position){
		var material = mat.clone()
		material.reflectivity = 0;
		material.combine = THREE.MixOperation;
		material.envMap = this.reflectionCube;
		material.side = THREE.DoubleSide;

		var geometry = geo.clone();
		geometry.computeBoundingBox();
		var box = geometry.boundingBox;

		var mesh = new THREE.Mesh(geometry, material);
		mesh.position.copy(position);

		this.objInfo.push( [Number(box.max.y.toFixed(2)), Number(box.min.y.toFixed(2)),  Number((box.max.x + Math.abs(box.min.x)).toFixed(2)),  Number((box.max.z + Math.abs(box.min.z)).toFixed(2)), geometry.vertices.length]);
		this.obj.push(mesh);

		view3d.scene.add(mesh);
	}








}