import { Base } from '../Base.js';
import { AppState } from '../../AppState.js'

//------------------------------------------------------//
//                HUB BUILD INTERFACE                   //
//------------------------------------------------------//


export class Hub_Build {

	constructor( parent ) {

        const target = parent.hub

		const self = this

        this.currentToolName = 0;

		this.img0 = document.createElement("img");
        this.img0.src = "./assets/img/build_0.png";
        this.img0.style.cssText ='position:absolute; margin:0px; padding:0px; top:0px; left:0px; pointer-events:none; display:none;';

        this.img1 = document.createElement("img");
        this.img1.src = "./assets/img/build_1.png";
        this.img1.style.cssText ='position:absolute; margin:0px; padding:0px; top:0px; left:0px; pointer-events:none; display:none;';

		this.content = document.createElement('div');
        this.content.style.cssText ='position:absolute; bottom:0px; left:0; width:100%; height:200px; pointer-events:none;  background:none;' + ' transform: scale(0.66); transform-origin: bottom;';
        target.appendChild( this.content );

        this.inner = document.createElement('div');
        this.inner.style.cssText ='position:absolute; bottom:0px; left:50%; margin-left:-548px; border:4px solid var(--c-border); border-radius:20px 20px 0 0; width:1096px; height:176px; pointer-events:none; background:var(--c-surface-alt); box-sizing: content-box; box-shadow: var(--shadow-hub);';
        this.content.appendChild( this.inner );

        this.innerb = document.createElement('div');
        this.innerb.style.cssText ='position:absolute; top:12px; padding:3px 3px; left:14px; width:1072px; height:118px; pointer-events:none; display:flex; align-items:center; ';

        this.inner.appendChild(this.img0);
        this.inner.appendChild(this.img1);
        this.inner.appendChild(this.innerb);

        const b0 = this.addBottomButton(this.inner, 407, 'BUILD')
        const b1 = this.addBottomButton(this.inner, 550, 'SERVICE')
        b0.addEventListener('click',  (e)=>{ e.preventDefault(); self.switchMenu(0); }, false);
        b1.addEventListener('click',  (e)=>{ e.preventDefault(); self.switchMenu(1); }, false);


        for(let i = 0; i<10; i++) this.addToolButton(this.innerb, i)


        this.speedSelect = 'rgba(74,158,220,0.6)'//'linear-gradient(rgba(255,255,255,0.8), rgba(255,255,255,0), rgba(255,255,255,0.2), rgba(255,255,255,0.8))';
        this.speedButton = []
        for(let i = 0; i<5; i++) this.speedButton[i] = this.addSpeedButton(this.inner, 774, i);

        this.toolOver = document.createElement('div');
        this.toolOver.style.cssText ="position:absolute; top:20px; width:100px; height:100px; border:3px solid #ffffff; pointer-events:none; border-radius:6px; display:none; ";
		this.inner.appendChild(this.toolOver)

		this.toolSelect = document.createElement('div');
        this.toolSelect.style.cssText ="position:absolute; top:20px; width:100px; height:100px; border:6px solid #ffffff; pointer-events:none; border-radius:6px; display:none;";
		this.inner.appendChild(this.toolSelect)

		this.toolInfo = this.addBottomButton(this.inner, 12, '')//document.createElement('div');
		this.toolInfo.style.width = '385px'
        this.toolInfo.style.bottom = '0px'

        this.addRCI()

        this.switchMenu(0)

	}

    addRCI(){

        this.rci = []
        let r 

        for(let i = 0; i<3; i++){
            r = document.createElement('div');
            r.style.cssText ="position:absolute; top:11px; width:66px; height:4px; pointer-events:none; border-radius:3px; background:none; ";
            r.style.left = 38 + (i*106)+'px'
            this.inner.appendChild(r)
            this.rci[i] = r
        }
        
    }

    updateRCI( r, c, i ){

        this.rci[0].style.width = r*0.033 + 'px'
        this.rci[1].style.width = c*0.033 + 'px'
        this.rci[2].style.width = i*0.033 + 'px'

        this.rci[0].style.background = r>0 ? '#dce8f5' : '#CC6600'
        this.rci[1].style.background = c>0 ? '#dce8f5' : '#CC6600'
        this.rci[2].style.background = i>0 ? '#dce8f5' : '#CC6600'

    }

	switchMenu( N ){

		this.resetTool()

		switch (N){
			case 0:
			this.tool = [ 1,2,3,7,8,9,11,10,12,14 ]
			this.img0.style.display = 'block';
			this.img1.style.display = 'none'; 
            this.rci[0].style.display = 'block'
            this.rci[1].style.display = 'block'
            this.rci[2].style.display = 'block'
			break;
			case 1:
			this.tool = [ 5,6,4,13,15,17,16,18,20,19 ]
			this.img0.style.display = 'none';
			this.img1.style.display = 'block';
            this.rci[0].style.display = 'none'
            this.rci[1].style.display = 'none'
            this.rci[2].style.display = 'none' 
			break;
		}

	}

    setActiveSpeed( id ){

        AppState.main.setSpeed(Number(id));

        for(let i=0; i<5; i++){ 
            this.speedButton[i].dataset.state = 'close'
            this.speedButton[i].style.background = 'none'
        }

        this.speedButton[id].style.background = this.speedSelect;
        this.speedButton[id].dataset.state = 'select';

    }

    addSpeedButton( target, left, id ) {

        const self = this;

        var b = document.createElement( 'div' );
        b.style.cssText ="position:absolute; bottom:6px; width:47px; height:30px; pointer-events:auto; cursor:pointer; display:flex; background:none;" 
        if(id===0) b.style.cssText += "border-radius:50% 0% 0% 50%;" 
        if(id===4) b.style.cssText += "border-radius:0% 50% 50% 0%;" 
        b.style.left = left+(id*47)+'px';
        b.id = id;
        b.dataset.state = 'close';
        if(id===2){ 
            b.dataset.state = 'select';
            b.style.background = this.speedSelect;
        }
        target.appendChild( b );
        b.addEventListener( 'mouseover', function ( e ) { e.preventDefault(); this.style.background = 'rgba(255,255,255,0.2)' }, false );
        b.addEventListener( 'mouseout', function ( e ) { e.preventDefault();  this.style.background = this.dataset.state !== 'close' ? self.speedSelect : 'none'  }, false );
        b.addEventListener( 'click', function ( e ) { e.preventDefault(); self.setActiveSpeed( this.id ); }, false )
        return b;

    }

	addBottomButton( target, left, name ) {

		var b = document.createElement( 'div' );
        b.style.cssText ="position:absolute; bottom:4px; width:137px; height:43px; pointer-events:auto; cursor:pointer; display:flex; text-transform: uppercase;" 
        b.style.cssText += "justify-content:center; align-items:center; color: var(--c-text); font: 700 20px/1 var(--font-ui); letter-spacing: 0.04em; text-shadow: 0 1px 4px rgba(0,0,0,0.8);";
        b.style.left = left+'px'
        b.textContent = name;
        target.appendChild( b );
        return b;

	}

	addToolButton( target, id ) {

		const self = this

        var b = document.createElement( 'div' );
        b.id = id
        b.style.cssText ="margin:3px 3px; width:100px; height:100px; border:2px solid #284766; pointer-events:auto; cursor:pointer; border-radius:6px";
        b.addEventListener('mouseover', function ( e ) { e.preventDefault(); self.overId(id) }, false );
        b.addEventListener('mouseout', function ( e ) { e.preventDefault(); self.toolOver.style.display = 'none'; self.toolInfo.innerHTML = ''}, false );
        b.addEventListener('click',  function(e){ e.preventDefault();  self.selectId(id); }, false);
        target.appendChild( b );
        return b;

    }

    overId( id ) {

    	this.toolOver.style.display = 'block';
    	this.toolOver.style.left = 20 + (id*106) + 'px';

    	this.showToolInfo(id)
    
    }

    selectId( id ) {

    	let tid = this.tool[id];

        // if same remove desactive tool !
        if( this.currentToolName === tid ){
            this.resetTool()
            return
        }

    	this.toolSelect.style.display = 'block';
    	this.toolSelect.style.left = 20 + (id*106) + 'px';
    	this.toolSelect.style.borderColor = Base.toolSet[tid].color

    	// disable turbine for the moment 
    	if(tid === 14) tid = 0

    	this.currentToolName = tid;
    	AppState.main.selectTool(this.currentToolName);

    }

    showToolInfo( id ) {

    	let tid = this.tool[id];

        this.toolOver.style.borderColor = Base.toolSet[tid].color
        var name = Base.toolSet[tid].tool;
        name = name.charAt(0).toUpperCase() + name.substring(1).toLowerCase();
        if(id.name===19) this.toolInfo.innerHTML = 'Drag view';
        else if(id.name===20) this.toolInfo.innerHTML = 'Get info';
        else if(id.name===21) this.toolInfo.innerHTML = 'Rotate view';
        else this.toolInfo.innerHTML = name+'&nbsp;<span style="color:#00d26a;">'+ Base.toolSet[tid].price+'</span>💲';
    
    }

    resetTool() {

        this.toolSelect.style.display = 'none';
        this.currentToolName = 0;
        this.toolInfo.innerHTML = ''
        AppState.main.selectTool(this.currentToolName);

    }


}