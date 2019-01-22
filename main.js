/* global THREE */
'use strict';
	
Physijs.scripts.worker = 'js/physijs_worker.js';
Physijs.scripts.ammo = 'ammo.js';

/*--------------------------------- Variables ---------------------------------*/
	
var initScene, render, renderer, render_stats, physics_stats, scene, ground,
	vehicle_body, vehicle, loader, input;

/*   Light variables   */
var light, hemilight;

/*   Camera variables   */
var camera, camera1, camera2, camera3, camera4;

/*   Object arrays   */
var buildings = [];
var streetlights = [];

/*   Materials   */
var building_materials = [];

/*   Flags   */
var backwards = false, turn_wheels = false, night = false;

/*--------------------------------- Start ---------------------------------*/

window.onload = function() {
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
	scene.setGravity(new THREE.Vector3( 0, -30, 0 ));
	scene.addEventListener('update', onUpdate);
	
	//Camera
	createCamera();

	// Light
	createLight();

	// Loader
	createGround();

	populateCity();
	createWall();

	createStreetLight(-30, 20, -30);
	createStreetLight(30, 20, -30);
	createStreetLight(-30, 20, 30);
	createStreetLight(30, 20, 30);

	
	var json_loader = new THREE.JSONLoader();

	json_loader.load( "models/mustang.js", function( car, car_materials ) {
		json_loader.load( "models/mustang_wheel.js", function( wheel, wheel_materials ) {
			var mesh = new Physijs.BoxMesh(car,	new THREE.MeshFaceMaterial(car_materials));
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
			}
		});
	});
	document.addEventListener('keyup', onKeyUp);
	document.addEventListener('keydown', onKeyDown);
	requestAnimationFrame(animate);
	scene.simulate();
};


/*--------------------------------- Functions ---------------------------------*/

function onKeyDown(ev) {
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
		case 49: // 1
			camera = camera1;
			break;

		case 50: // 2
			camera = camera2;
			break;

		case 51: // 3
			camera = camera3;
			break;

		case 52:
			camera = camera4;
			break;

		case 77: // M
			turn_wheels = !turn_wheels;
			break;

		case 78: // N
			night = !night;
			break;
	}
}

function onKeyUp(ev) {
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
}

function animate() {
	
	if (vehicle) {
		camera1.position.copy(vehicle.mesh.position).add( new THREE.Vector3( 40, 25, 40 ) );
		camera1.lookAt( vehicle.mesh.position );
		
		var camera3Offset = (new THREE.Vector3(0,5,-20)).applyMatrix4(vehicle.mesh.matrixWorld);
   		camera3.position.copy(camera3Offset);
		camera3.lookAt(vehicle.mesh.position);

		var camera4Offset = (new THREE.Vector3(0,3,5)).applyMatrix4(vehicle.mesh.matrixWorld);
   		camera4.position.copy(camera4Offset);
		camera4.lookAt((new THREE.Vector3(0,3,10)).applyMatrix4(vehicle.mesh.matrixWorld));
		
		if (night) {
			renderer.setClearColor( 0x000000 );
			hemilight.intensity = 0.3;
			light.intensity = 0.5;
			for(var i=0; i<streetlights.length;i++) streetlights[i].castShadow = true;
		}
		else {
			renderer.setClearColor( 0x7EC0EE );
			hemilight.intensity = 0.7;
			light.intensity = 1;
			for(var i=0; i<streetlights.length;i++) streetlights[i].castShadow = false;
		}

	}
	renderer.render( scene, camera );
	render_stats.update();
	requestAnimationFrame(animate);
};


function onUpdate(){
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