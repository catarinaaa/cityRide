/* global THREE */
'use strict';
	
Physijs.scripts.worker = 'js/physijs_worker.js';
Physijs.scripts.ammo = 'ammo.js';
	
var initScene, render, ground_material, streetlights_material, 
	renderer, render_stats, physics_stats, scene, ground,
	vehicle_body, vehicle, loader, skyBox;
var backwards = false, turn_wheels = false;

/*   Light variables   */
var light, headlight1, headlight2, sunlight, hemilight, lightHelper, lightCandle;

/*   Camera variables   */
var camera, camera1, camera2, camera3;
var box, obj;

var buildings = [];
var building_materials = [];


function createLight() {
	light = new THREE.DirectionalLight( 0xFFFFFF, 1);
	light.position.set(20, 80, 20);
	light.target.position.copy( scene.position );
	light.castShadow = true;
	light.shadowCameraLeft = -150;
	light.shadowCameraTop = -150;
	light.shadowCameraRight = 150;
	light.shadowCameraBottom = 150;
	light.shadowCameraNear = 20;
	light.shadowCameraFar = 400;
	light.shadowBias = -.0001
	light.shadowMapWidth = light.shadowMapHeight = 2048;
	light.shadowDarkness = .5;

	hemilight = new THREE.HemisphereLight( 0x7EC0EE, 0xffffff, 0.7);
	scene.add( hemilight );



	scene.add(light);
	//sunlight = new THREE.AmbientLight( 0xFFFFFF, 0.1); // soft white light
	//scene.add( sunlight );
	obj = new THREE.Object3D();
	obj.position.set(0,0,3);
	obj.matrixAutoUpdate = true;
	headlight1 =  new THREE.SpotLight(0xffffff, 4, 25, Math.PI/6, 0.3, 1);
	headlight2 = new THREE.SpotLight(0xffffff, 1);
	headlight1.position.set(1.6, 1, 5.3);
	headlight2.position.set(-1.6, 0, 3.3);
	//headlight1.target.position.set(1.6, 1, -10);
	headlight1.target = obj;
	headlight2.target.position.set(-1.6, 0, 5.3);
	headlight1.castShadow = true;
	scene.add( headlight1 );
	scene.add( headlight2 );
	scene.add(obj);

	headlight1.shadow.mapSize.width = 1024;
	headlight1.shadow.mapSize.height = 1024;

	headlight1.shadow.camera.near = 500;
	headlight1.shadow.camera.far = 4000;
	headlight1.shadow.camera.fov = 30;

	lightHelper = new THREE.SpotLightHelper( headlight1 );
	scene.add( lightHelper );
}

function createCandle(x, y, z) {
   	var streetlights_material = Physijs.createMaterial(
			new THREE.MeshLambertMaterial({ map: loader.load( 'images/metal.jpg' ) }),
			.4, // low friction
			.6 // high restitution
		);
   var geometry = new THREE.CylinderGeometry(0.5, 0.5, y, 32);
   var mesh = new Physijs.CylinderMesh(geometry, streetlights_material, 1000);
   mesh.receiveShadow = true;
   mesh.position.set(x, y/2, z);
   scene.add(mesh)

   lightCandle = new THREE.PointLight(0xffcc99, 1, y+y, 1);
	lightCandle.position.set(x, y+1, z);
	//lightCandle.castShadow = true;
	scene.add(lightCandle);
}

function createCamera() {
	/* camera1 - perspective view */
	camera1 = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 1, 1000);
	/* camera2 - top view */
	camera2 = new THREE.OrthographicCamera(window.innerWidth/-6, window.innerWidth/6 , window.innerHeight/6, window.innerHeight/-6 , 1, 1000);
	camera2.position.set( 0, 200, 0 );
	camera2.lookAt(scene.position);
	/* camera3 - back view */
	camera3 = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);

	// assign camera
	camera = camera1;
	scene.add( camera );
	
}


function createWall() {
	loader = new THREE.TextureLoader();

	var wall_material = Physijs.createMaterial(
			new THREE.MeshLambertMaterial({ map: loader.load( 'images/brick_dark.jpg' ) }),
			.4, // low friction
			.6 // high restitution
		);
	wall_material.map.wrapS = ground_material.map.wrapT = THREE.MirroredRepeatWrapping;
	wall_material.map.repeat.set(10, 1);

	var wall1 = new Physijs.BoxMesh(new THREE.BoxGeometry(1, 10, 300), wall_material, 0);
		wall1.castShadow = wall1.receiveShadow = true;
		wall1.position.set(-149.5, 5, 0);
		scene.add( wall1);
	var wall2 = new Physijs.BoxMesh(new THREE.BoxGeometry(1, 10, 300), wall_material, 0);
		wall2.castShadow = wall2.receiveShadow = true;
		wall2.position.set(149.5, 5, 0);
		scene.add( wall2);
	var wall3 = new Physijs.BoxMesh(new THREE.BoxGeometry(300, 10, 1), wall_material, 0);
		wall3.castShadow = wall3.receiveShadow = true;
		wall3.position.set(0, 5, -149.5);
		scene.add( wall3);
	var wall4 = new Physijs.BoxMesh(new THREE.BoxGeometry(300, 10, 1), wall_material, 0);
		wall4.castShadow = wall4.receiveShadow = true;
		wall4.position.set(0, 5, 149.5);
		scene.add( wall4);
}

function createGround() {
	loader = new THREE.TextureLoader();
	
	// Materials
	ground_material = Physijs.createMaterial(
		new THREE.MeshLambertMaterial({ map: loader.load( 'images/ground2.jpg' ) }),
		0,//.3, // low friction
		0//.4 // low restitution
	);

	ground_material.map.wrapS = ground_material.map.wrapT = THREE.MirroredRepeatWrapping;
	ground_material.map.repeat.set( 2, 2 );

	// Ground
	var NoiseGen = new SimplexNoise;

	var ground_geometry = new THREE.PlaneGeometry( 300, 300, 100, 100 );
	for ( var i = 0; i < ground_geometry.vertices.length; i++ ) {
		var vertex = ground_geometry.vertices[i];
		//vertex.y = NoiseGen.noise( vertex.x / 30, vertex.z / 30 ) * 1;
	}
	ground_geometry.computeFaceNormals();
	ground_geometry.computeVertexNormals();

	// If your plane is not square as far as face count then the HeightfieldMesh
	// takes two more arguments at the end: # of x faces and # of z faces that were passed to THREE.PlaneMaterial
	ground = new Physijs.PlaneMesh(
			ground_geometry,
			ground_material,
			0 // mass
	);
	ground.rotation.x = -Math.PI / 2;
	ground.receiveShadow = true;
	scene.add( ground );

}

function onKeyDown(ev) {
	switch ( ev.keyCode ) {
		case 49: // 1
			camera = camera1;
			break;

		case 50: // 2
			camera = camera2;
			break;

		case 51: // 3
			camera = camera3;
			break;

		case 77: // M
			turn_wheels = !turn_wheels;
			break;
	}
}


initScene = function() {
	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.shadowMap.enabled = true;
	renderer.shadowMapSoft = true;

	renderer.setClearColor( 0x7EC0EE );
	document.getElementById( 'viewport' ).appendChild( renderer.domElement );
	
	render_stats = new Stats();
	render_stats.domElement.style.position = 'absolute';
	render_stats.domElement.style.top = '1px';
	render_stats.domElement.style.zIndex = 100;
	document.getElementById( 'viewport' ).appendChild( render_stats.domElement );

	physics_stats = new Stats();
	physics_stats.domElement.style.position = 'absolute';
	physics_stats.domElement.style.top = '50px';
	physics_stats.domElement.style.zIndex = 100;
	document.getElementById( 'viewport' ).appendChild( physics_stats.domElement );
	
	scene = new Physijs.Scene;
	scene.add(new THREE.AxisHelper(10));
	scene.setGravity(new THREE.Vector3( 0, -30, 0 ));
	scene.addEventListener('update', function() {
		if ( input && vehicle ) {
			if ( input.direction !== null ) {
				input.steering += input.direction / 50;
				if ( input.steering < -.6 ) input.steering = -.6;
				if ( input.steering > .6 ) input.steering = .6;
			}
			else {
				if (!turn_wheels) input.steering = 0;
			}
			vehicle.setSteering( input.steering, 0 );
			vehicle.setSteering( input.steering, 1 );

			if ( input.power === true ) {
				if(!backwards)
					vehicle.applyEngineForce( 300 );
				else
					vehicle.applyEngineForce( -300 );
			} else if ( input.power === false ) {
				vehicle.setBrake( 25, 2 );
				vehicle.setBrake( 25, 3 );
			} else {
				vehicle.applyEngineForce( 0 );
			}
		}

		scene.simulate( undefined, 2 );
		physics_stats.update();
	}
	);
	
	//Camera
	createCamera();

	// Light
	createLight();

	var input;

	// Loader
	createGround();

	populateCity();
	createWall();

	createCandle(-30, 20, -30);
	createCandle(30, 20, -30);
	createCandle(-30, 20, 30);
	createCandle(30, 20, 30);

	
	var json_loader = new THREE.JSONLoader();

	json_loader.load( "models/mustang.js", function( car, car_materials ) {
		json_loader.load( "models/mustang_wheel.js", function( wheel, wheel_materials ) {
			var mesh = new Physijs.BoxMesh(
				car,
				new THREE.MeshFaceMaterial( car_materials )
			);
			mesh.position.y = 2;
			mesh.castShadow = mesh.receiveShadow = true;

			vehicle = new Physijs.Vehicle(mesh, new Physijs.VehicleTuning(
				5,//10.88,
				1.83,
				0,//0.28,
				500,
				5, //10.5,
				6000
			));
			scene.add( vehicle );


			var wheel_material = new THREE.MeshFaceMaterial( wheel_materials );

			for ( var i = 0; i < 4; i++ ) {
				vehicle.addWheel(
					wheel,
					wheel_material,
					new THREE.Vector3(
							i % 2 === 0 ? -1.6 : 1.6,
							-1,
							i < 2 ? 3.3 : -3.2
					),
					new THREE.Vector3( 0, -1, 0 ),
					new THREE.Vector3( -1, 0, 0 ),
					0.1, //tuning
					0.7, //wheel radius
					i < 2 ? false : true //is front wheel
				);
			}

			input = {
				power: null,
				direction: null,
				steering: 0
			};
			document.addEventListener('keydown', function( ev ) {
					switch ( ev.keyCode ) {
						case 37: // left
							input.direction = 1;
							break;

						case 38: // forward
							backwards = false;
							input.power = true;
							break;

						case 39: // right
							input.direction = -1;
							break;

						case 66: // brake
							input.power = false;
							break;

						case 40: // back
							backwards = true;
							input.power = true;
							break;
					}
				});
				document.addEventListener('keyup', function( ev ) {
					switch ( ev.keyCode ) {
						case 37: // left
							input.direction = null;
							break;

						case 38: // forward
							input.power = null;
							break;

						case 39: // right
							input.direction = null;
							break;

						case 66: // brake
							input.power = null;
							break;

						case 40: // back
							input.power = null;
							break;
					}
				});
			});
		});
	document.addEventListener('keydown', onKeyDown);
	requestAnimationFrame( render );
	scene.simulate();
};

render = function() {
	requestAnimationFrame( render );
	if ( vehicle ) {
		camera1.position.copy( vehicle.mesh.position ).add( new THREE.Vector3( 40, 25, 40 ) );
		camera1.lookAt( vehicle.mesh.position );
		//camera3.position.copy( vehicle.mesh.position).add(new THREE.Vector3( 0, 5, -20));
		//var cameraOffset = vehicle.mesh.localToWorld(new THREE.Vector3(0,5,-20));
		var cameraOffset = (new THREE.Vector3(0,5,-20)).applyMatrix4(vehicle.mesh.matrixWorld);
   		camera3.position.copy(cameraOffset);
		//camera3.applyQuaternion(new THREE.Quaternion(vehicle.mesh.position.x, vehicle.mesh.position.y, vehicle.mesh.position.z, 1));

		camera3.lookAt(vehicle.mesh.position);
		var lightsOffset = (new THREE.Vector3(1.6,1,-10)).applyMatrix4(vehicle.mesh.matrixWorld);

   		//headlight1.position.copy(lightsOffset);
   		headlight2.position.copy(lightsOffset);
		//headlight1.target.position.set(lightsOffset.x,lightsOffset.y, lightsOffset.z);
		headlight2.target.position.set(lightsOffset.x, lightsOffset.y, lightsOffset.z);

    	//headlight.position.set(vehicle.mesh.position.x+5, vehicle.mesh.position.y, vehicle.mesh.position.z);
    	//headlight.target.position.set(vehicle.mesh.position.x+10, vehicle.mesh.position.y, vehicle.mesh.position.z);
    	//headlight.setLinearVelocity(vehicle.mesh._physijs.linearVelocity)
    	//headlight.setAngularVelocity(vehicle.mesh._physijs.angularVelocity)
    	//headlight.target.rotation.set(vehicle.mesh.rotation.x, vehicle.mesh.rotation.y, vehicle.mesh.rotation.z);
		//scene.add(headlight.target);
		//light.target.position.copy( vehicle.mesh.position );
		//light.position.addVectors( light.target.position, new THREE.Vector3( 20, 20, -15 ) );

		headlight1.target.updateMatrixWorld();
		//scene.add( headlight1.target );


		headlight2.target.updateMatrixWorld();

	}
	renderer.render( scene, camera );
	render_stats.update();
};

window.onload = initScene;
