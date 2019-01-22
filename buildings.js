/* global THREE */
'use strict';


function fillMaterials() {
	var files = ['images/shop1_side.jpg', 'images/building1_side.jpg', 'images/building2_side.jpg','images/building3_side.jpg',
	'images/building4_side.jpg','images/building5_side.jpg', 'images/building6_side.jpg', 'images/shop7_side.jpg', 
	'images/building8_side.jpg', 'images/building9_side.jpg', 'images/blue_roof.jpg', 'images/blue_roof_bump.jpg'];
	var material = [];
	loader = new THREE.TextureLoader();

	for (var i = 0; i < files.length-2; i++) {
		material = [
	       Physijs.createMaterial(new THREE.MeshLambertMaterial({
	           map: loader.load(files[i])
	       }), .4, .6),
	       Physijs.createMaterial(new THREE.MeshLambertMaterial({
	           map: loader.load(files[i])
	       }), .4, .6),
	       Physijs.createMaterial(new THREE.MeshPhongMaterial({
	           map: loader.load(files[10]), bumpMap: loader.load(files[11])
	       }), .4, .6),
	       Physijs.createMaterial(new THREE.MeshLambertMaterial({
	           map: loader.load(files[i])
	       }), .4, .6),
	      Physijs.createMaterial(new THREE.MeshLambertMaterial({
	           map: loader.load(files[i])
	       }), .4, .6),
	      Physijs.createMaterial(new THREE.MeshLambertMaterial({
	           map: loader.load(files[i])
	       }), .4, .6)]
	    building_materials.push(material)

  	}
}


function populateCity() {
	
	fillMaterials();

	//Building 1
	createBuilding(-113, 0, -113, 38, 38, 38, 1);
	createBuilding(113, 0, 113, 38, 38, 38, 1);
	createBuilding(56.2, 0, -56, 38, 38, 38, 1);

	//Building 2
	createBuilding(-113, 0, -47, 37.5, 30, 56, 2);
	createBuilding(-47, 0, 113, 56, 30, 37.5, 2);
	createBuilding(47, 0, -113, 56, 30, 37.5, 2);
	createBuilding(56.5, 0, 47, 37.5, 30, 56, 2);

	//Building 3
	createBuilding(113, 0, 47, 38, 50, 56, 3);
	createBuilding(-113, 0, 47, 38, 50, 56, 3);
	createBuilding(-47, 0, -113, 56, 50, 38, 3);

	//Building 4
	createBuilding(-113, 0, 113, 38, 35, 38, 4);
	createBuilding(-18.5, 0, -56, 38, 35, 37.5, 4);

	//Building 5
	createBuilding(-56.5, 0, -47, 37, 35, 56, 5);
	createBuilding(113, 0, -47, 37, 35, 56, 5);
	createBuilding(-56.5, 0, -47, 37, 35, 56, 5);
	createBuilding(9, 0, 113, 56, 35, 37, 5);


	//Building 6
	createBuilding(18.5, 0, -56, 38, 25, 38, 6);
	createBuilding(113, 0, -113, 38, 25, 38, 6);
	createBuilding(56, 0, 113, 38, 25, 38, 6);

	//Shop 0
	createBuilding(47, 0, -28, 18, 18, 18, 0);
	createBuilding(-47, 0, 28, 18, 18, 18, 0);

	//Shop 1
	createBuilding(65, 0, -28, 18, 13, 18, 7);
	createBuilding(-65, 0, 28, 18, 13, 18, 7);


	//Building 8
	createBuilding(0, 0, -113, 38, 25, 38, 8);
	createBuilding(-56.2, 0, 56, 38, 30, 38, 8);

	var wall1_material = Physijs.createMaterial(
			new THREE.MeshLambertMaterial({ map: loader.load( 'images/graffiti.jpg' ) }),
			.4, // low friction
			.6 // high restitution
		);
	wall1_material.map.wrapS = wall1_material.map.wrapT = THREE.MirroredRepeatWrapping;
	wall1_material.map.repeat.set(9, 1);

	var wall2_material = Physijs.createMaterial(
			new THREE.MeshLambertMaterial({ map: loader.load( 'images/graffiti.jpg' ) }),
			.4, // low friction
			.6 // high restitution
		);
	wall1_material.map.wrapS = wall1_material.map.wrapT = THREE.MirroredRepeatWrapping;
	wall1_material.map.repeat.set(4, 1);

	var wall4 = new Physijs.BoxMesh(new THREE.BoxGeometry(75, 10, 1), wall1_material, 0);
		wall4.castShadow = wall4.receiveShadow = true;
		wall4.position.set(0, 5, 74.5);
		scene.add(wall4);
	var wall1 = new Physijs.BoxMesh(new THREE.BoxGeometry(25, 10, 1), wall2_material, 0);
		wall1.castShadow = wall1.receiveShadow = true;
		wall1.position.set(-25, 5, 37.5);
		scene.add(wall1);
	var wall2 = new Physijs.BoxMesh(new THREE.BoxGeometry(25, 10, 1), wall2_material, 0);
		wall2.castShadow = wall2.receiveShadow = true;
		wall2.position.set(25, 5, 37.5);
		scene.add(wall2);

} 


function createBuilding(x, y, z, size_x, size_y, size_z, n_material) {
	var build = new Physijs.BoxMesh(new THREE.BoxGeometry(size_x, size_y, size_z), new THREE.MeshFaceMaterial(building_materials[n_material]), 0);
		build.castShadow = build.receiveShadow = true;
		build.position.set(x, size_y/2, z);
		scene.add( build )

	buildings.push(build)
}
