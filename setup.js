/* global THREE */

function createLight() {
	light = new THREE.DirectionalLight( 0xFFFFFF, 1);
	light.position.set(20, 80, 20);
	light.target.position.copy(scene.position);
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
	scene.add(light);

	//A light source positioned directly above the scene, with color fading from the sky color to the ground color. 
	hemilight = new THREE.HemisphereLight( 0x7EC0EE, 0xffffff, 0.7);
	scene.add(hemilight);

}

function createStreetLight(x, y, z) {
   	var streetlights_material = Physijs.createMaterial(
			new THREE.MeshLambertMaterial({ map: loader.load( 'images/metal.jpg' ) }),
			.4, // low friction
			.6 // high restitution
		);
	var mesh = new Physijs.CylinderMesh( new THREE.CylinderGeometry(0.5, 0.5, y, 32), streetlights_material, 1000);
	mesh.receiveShadow = mesh.castShadow = true;
	mesh.position.set(x, y/2, z);
	scene.add(mesh);

	var lightCandle = new THREE.PointLight(0xffcc99, 1, y+y, 1);
	lightCandle.add( new THREE.Mesh( new THREE.SphereBufferGeometry(1, 16, 8 ), new THREE.MeshBasicMaterial( { color: 0xffcc99 } ) ) );
	lightCandle.position.set(x, y+1, z);
	streetlights.push(lightCandle);
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

	/* camera4 - first person view*/
	camera4 = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 1, 1000);

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
	wall_material.map.wrapS = wall_material.map.wrapT = THREE.MirroredRepeatWrapping;
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
	var ground_material = Physijs.createMaterial(
		new THREE.MeshLambertMaterial({ map: loader.load( 'images/ground2.jpg' ) }),
		0,//.3, // low friction
		0//.4 // low restitution
	);

	ground_material.map.wrapS = ground_material.map.wrapT = THREE.MirroredRepeatWrapping;
	ground_material.map.repeat.set( 2, 2 );

	// Ground
	var ground_geometry = new THREE.PlaneGeometry( 300, 300, 100, 100 );
	for ( var i = 0; i < ground_geometry.vertices.length; i++ ) {
		var vertex = ground_geometry.vertices[i];
	}
	ground_geometry.computeFaceNormals();
	ground_geometry.computeVertexNormals();

	
	ground = new Physijs.PlaneMesh(ground_geometry,	ground_material, 0);
	ground.rotation.x = -Math.PI / 2;
	ground.receiveShadow = true;
	scene.add( ground );

}
