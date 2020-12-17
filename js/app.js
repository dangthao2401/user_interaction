
var app=function() {
	 // initiallize scene, camera, objects and renderer
	var scene, camera, renderer;
	var ground, crate,skybox;
	var robot, car;
	var sphere;
	var donuts = [];
	const ARROWLEFT=37,ARROWRIGHT=39,ARROWUP=38,ARROWDOWN=40, W_key=87,S_key=83;//check keycode at https://keycode.info/
	var distance = 0;
	var mouse,raycaster;
	var canvasWidth, canvasHeight;
	const clock = new THREE.Clock();
	var  canvasWidth, canvasWidth; 
	var load_robot_model = function(){
		var objLoader = new THREE.OBJLoader();
		objLoader.load(
			// url
			"./data/models/robot/r2-d2.obj",
			// onload callback
			function(robot){
				robot.name = "robot";
				robot.position.y -=10;
				robot.position.z -=10;
				robot.scale.set(0.08,0.08,0.08);
				scene.add(robot);
			},
			// onProgress callback
			function ( xhr ) {
				console.log("The robot model is" +(xhr.loaded / xhr.total * 100) + '% loaded' );
			},
			// onError callback
			function ( err ) {
				console.log( 'An error happened in loading robot model: '+err);
			}
		);
	}
	var load_car_model = function(){
		var gltfLoader = new THREE.GLTFLoader();
		gltfLoader.load(
			// resource URL
			"./data/models/car/scene.gltf",
			// onload callback
			function ( result ) {
				// get model
				car = result.scene.children[0]; 
				car.scale.setScalar(3);
				scene.add( car);
				car.position.y = 23;
				car.position.x = +13;
				car.position.z = -15;
			},
			// onProgress callback
			function ( xhr ) {

				console.log( ("The car model is" +xhr.loaded / xhr.total * 100 ) + '% loaded' );

			},
			// onError callback
			function ( error ) {

				console.log( 'An error happened'+ error);

			}
		);
	}
	
	var create_ground = function(){
		var geometry = new THREE.PlaneGeometry(100,100,32);
		var grass_texture = new THREE.TextureLoader().load("./data/textures/grass/Green-Grass-Ground-Texture-DIFFUSE.jpg");
		var normal_texture = new THREE.TextureLoader().load("./data/textures/grass/Green-Grass-Ground-Texture-NORMAL.jpg");
		var disp_texture = new THREE.TextureLoader().load("./data/textures/grass/Green-Grass-Ground-Texture-DISP.jpg");
		var specular_texture = new THREE.TextureLoader().load("./data/textures/grass/Green-Grass-Ground-Texture-SPECULAR.jpg");
		var material  = new THREE.MeshPhongMaterial({map:grass_texture,normalMap:normal_texture,displacementMap:disp_texture,specularMap:specular_texture,specular:0xffffff,shininess:20});
		ground = new THREE.Mesh(geometry,material);
		ground.position.z = -15;
		ground.position.y = -10;
		ground.rotation.x -=Math.PI/2;
		ground.name = "ground";
		scene.add(ground);
	}
	var create_crate = function(){
		var geometry = new THREE.BoxGeometry(1,1,1);
		var crate_texture = new THREE.TextureLoader().load("./data/textures/crate/crate0_diffuse.png");
		var bump_map_texture = new THREE.TextureLoader().load("./data/textures/crate/crate0_bump.png");
		var normal_map_texture = new THREE.TextureLoader().load("./data/textures/crate/crate0_normal.png");
		var material = new THREE.MeshPhongMaterial({map:crate_texture,bumpMap:bump_map_texture,normalMap:normal_map_texture});
		var crate = new THREE.Mesh(geometry,material);
		crate.position.z = 65;
		crate.position.y = -2;
		crate.name = "crate";
		//crate.scale.setScalar(0.5);
		scene.add(crate);
		return crate;
	} 
	var create_skybox = function(){
		// create a box geometry
		var geometry = new THREE.BoxGeometry(1000,1000,1000);
		// load texture of sides from images
		var front_texture = new THREE.TextureLoader().load("./data/textures/skybox/arid2_ft.jpg");
		var back_texture = new THREE.TextureLoader().load("./data/textures/skybox/arid2_bk.jpg");
		var up_texture = new THREE.TextureLoader().load("./data/textures/skybox/arid2_up.jpg");
		var down_texture = new THREE.TextureLoader().load("./data/textures/skybox/arid2_dn.jpg");
		var right_texture = new THREE.TextureLoader().load("./data/textures/skybox/arid2_rt.jpg");
		var left_texture = new THREE.TextureLoader().load("./data/textures/skybox/arid2_lf.jpg");
		// add textures to a material arrays in the correct order ( front-back-up-down-right-left)
		var materials = [];
		materials.push(new THREE.MeshBasicMaterial({map:front_texture}));
		materials.push(new THREE.MeshBasicMaterial({map:back_texture}));
		materials.push(new THREE.MeshBasicMaterial({map:up_texture}));
		materials.push(new THREE.MeshBasicMaterial({map:down_texture}));
		materials.push(new THREE.MeshBasicMaterial({map:right_texture}));
		materials.push(new THREE.MeshBasicMaterial({map:left_texture}));
		for(var i=0; i <6; i++)
		{
			materials[i].side = THREE.BackSide;
		}
		// creat skybox
		skybox = new THREE.Mesh(geometry,materials);
		skybox.name = "skybox";
		scene.add(skybox);
	}
	var create_envSphere = function(){
		// create a sphere geometry
		const geometry = new THREE.SphereGeometry( 5, 32, 32 );
		var loader = new THREE.CubeTextureLoader();
		loader.setPath("./data/textures/skybox/");
		var texture_cube = loader.load([
			'arid2_ft.jpg','arid2_bk.jpg','arid2_up.jpg','arid2_dn.jpg','arid2_rt.jpg','arid2_lf.jpg'
		]);
		var material = new THREE.MeshBasicMaterial({color:0xffffff,envMap:texture_cube});
		sphere = new THREE.Mesh( geometry, material );
		//sphere.position.set(position);
		//sphere.position.set(position);
		scene.add( sphere );
	}
	var onKeyDown = function(event){
		console.log("the current key:"+event.keyCode);
		switch(event.keyCode)
		{
			case ARROWLEFT:
				crate.position.x += -0.2;
				break;
			case ARROWRIGHT:
				crate.position.x += 0.2;
				break;
			case ARROWUP:
				crate.position.y += 0.2;
				break;
			case ARROWDOWN:
				crate.position.y += - 0.2;
				break;
			case W_key:
				crate.position.z += -  0.5;
				break;
			case S_key:
				crate.position.z += 0.5;
				break;
			default:
				console.log("the current key:"+e.keyCode);
		}
		
	}
	var onMouseClick = function(event){
		console.log("Click at position("+event.clientX+","+event.clientY+")");
		// calculate mouse position in normailized device coordinates
		// (from -1 to 1) for both components
		mouse.x = (event.clientX/canvasWidth)*2-1;
		mouse.y = -(event.clientY/canvasHeight)*2+1;
		console.log("mouse position("+mouse.x+","+mouse.y+")");
		//update the picking ray with camera and mouse position
		raycaster.setFromCamera(mouse,camera);
		//calculate object intersecting the picking ray
		const intersects = raycaster.intersectObjects(scene.children);
		for(let i = 0; i < intersects.length; i++)
		{
			console.log("Name of the object is "+ intersects[i].object.name);
			if(intersects[i].object.name=="donut")
				intersects[i].object.rotation.x += Math.PI/2; 
		}
	}
	var onMouseMove = function(){};
	var randomInRange = function(min,max){
		return Math.random()*(max-min)+min;
		//Math.random() returns a floating-point in the range(0-1)
	} 
	var create_donuts = function(){
		// each donut has torus geometry. Its radius: 1;  its tube: 0.5, its radialSegments: 5 and tubularSegment: 30. 
		var geometry = new THREE.TorusGeometry(1,0.5,20,50);
		// the color of each donut is ramdom.
		var material = new THREE.MeshBasicMaterial({color:Math.random()*0xffffff});
		var donut = new THREE.Mesh(geometry,material);
		// the position of each donut is ramdom.
		donut.position.x =  randomInRange(-20,20); // donuts are everywhere on scene
		donut.position.y = -3;//randomInRange(-5,5);// each donut is on the top of the scene
		donut.position.z = randomInRange(-50,20);// create different sizes 
		donut.name ="donut";
		//add each donut to scence
		scene.add(donut);
		donuts.push(donut);
	} 
	var update_donut = function(donut,index){
		// the donut moves along the z axis to end of the ground
		if(donut.position.z < 50)
		{
			donut.position.z += 0.05;
		}
		else
		{
		  // remove the donut if camera can't see it
		 if (donut.position.y < -10) 
		 {
			 donuts.splice(index, 1);
			scene.remove(donut);
		 }
		 else
			//  the donut moves along the y axis
			donut.position.y += -0.05
		}
	}
    var init_app = function() {
        // 1. create the scene
		scene = new THREE.Scene();
        // 2. create an locate the camera
		canvasWidth = 1280, canvasHeight= 720;
		var fieldOfViewY = 60, aspectRatio = canvasWidth /canvasHeight, near=0.1, far= 1000.0;
		camera = new THREE.PerspectiveCamera( fieldOfViewY, aspectRatio, near, far );
		camera.position.y = 0;
		camera.position.z = 70;
		
		var ambientLight = new THREE.AmbientLight(0xffffff,0.2);
		scene.add(ambientLight);
		
		var pointLight = new THREE.PointLight(0xffffff,0.8,100);
		pointLight.position.set(3,1,3);
		scene.add(pointLight);
		// add three directional lights
		const keyLight = new THREE.DirectionalLight( 0xffffff, 1);
		keyLight.position.set(100,0,-100);
		scene.add( keyLight);
		const fillLight = new THREE.DirectionalLight( 0xffffff, 1);
		fillLight.position.set(100,0,100);
		scene.add( fillLight);
		const backLight = new THREE.DirectionalLight( 0xffffff, 1);
		backLight.position.set(-100,0,100);
		scene.add( backLight);
		
		//objects
		create_ground();
		create_skybox();
		crate = create_crate();
		create_envSphere();
		
        // 4. create the renderer   
		renderer = new THREE.WebGLRenderer({antialias:true});
		renderer.setSize( canvasWidth, canvasHeight);
		document.body.appendChild( renderer.domElement );
		
		// control camera
		// var controls = new THREE.OrbitControls(camera, renderer.domElement);
		// controls.enableDamping = true;
		// controls.campingFactor = 0.25;
		// controls.enableZoom = true;
		
		// mose picking
		raycaster = new THREE.Raycaster();
		mouse = new THREE.Vector2();

		//handler user input
		document.addEventListener("keydown",onKeyDown,false);
		document.addEventListener("click",onMouseClick,false);
		document.addEventListener("mousemove",onMouseMove,false);
    }; 
    // main animation loop - calls every 50-60 ms.
    var mainLoop = function() {
		let rand = Math.random();
		if(rand < 0.02)
		{
				create_donuts();
		}
		crate.rotation.y += 0.05;
		donuts.forEach(update_donut);
		renderer.render( scene,camera );
		requestAnimationFrame( mainLoop );
		//camera.rotation.y += 0.05;
    };
    init_app();
	mainLoop();	
}

  