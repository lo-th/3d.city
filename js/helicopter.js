V3D.helicopter = function(base){
	this.base = base;
	this.mesh = new THREE.Object3D();
	this.parts = [];

    this.ToRad = Math.PI / 180;
    this.gaz = 0.6;
    this.ge = 0;

    //this.hud = document.getElementsByClassName('hud');//
    this.hud = document.getElementById('hud').contentDocument;

	this.init();
}

V3D.helicopter.prototype = {
    constructor: V3D.helicopter,
    init:function() {
        this.sound = new Audio("./sound/helico/8534.mp3");
    	var mtx = new THREE.Matrix4().makeScale(1, 1, -1);
    	var m = this.base.meshs['elico'];
    	m.material = this.base.townMaterial;
    	m.geometry.applyMatrix( mtx );
    	m.position.set(0,-0.12,0);
    	this.mesh.add( m );
        this.mesh.position.set(0,1,0);
    	this.parts[0] = m; 

    	var o;

    	for(var i=0;i<m.children.length;i++){
    		o = m.children[i];
    		o.material = this.base.townMaterial;
    		o.geometry.applyMatrix( mtx );
    		if(o.name == 'elico2'){ 
                this.parts[1] = o;
                this.parts[4] = o.children[0];
                this.parts[5] = o.children[1];
                this.parts[4].material = this.base.townMaterial;
                this.parts[5].material = this.base.townMaterial; 
                this.parts[4].geometry.applyMatrix( mtx );
                this.parts[5].geometry.applyMatrix( mtx );
            }
    		if(o.name == 'elico4'){ 
                o.position.z = -o.position.z; this.parts[2] = o; 


            }
    		if(o.name == 'elico3'){ o.position.z = -o.position.z; this.parts[3] = o; }
    	}
    	this.base.scene.add( this.mesh );
       // this.sound.play();
       // this.sound.loop = true;
      // move(1);
    },
    move:function(dir){
        switch(dir){
            case 1:// front
                this.parts[1].rotation.x = -0.08;
            break;
            case 2:
                this.parts[1].rotation.x = 0.08;
            break;
            case 3:// left
                this.parts[4].rotation.z = -3.44;
                this.parts[5].rotation.z = -0.3;
            break;
            case 4:// right
                this.parts[4].rotation.z = -2.84;
                this.parts[5].rotation.z = 0.3;
            break;
        }

        this.parts[1].rotation.y += this.gaz;
        this.parts[2].rotation.x -= this.gaz;

        this.ge++;

        this.rotate("Symbole_2_0_Layer0_0_FILL", this.ge);

    },
    fly:function() {
    	if(this.parts.length>2){
            this.move(1);
	    	
	    }
    },

    //------------------


    rotate : function(name, deg){
        var div = this.hud.getElementById(name);
        if(div){
             div.setAttribute("transform", "rotate(" + (deg) + ")");
        }
    }




}