/* global THREE */
'use strict';


function fillMaterials() {
	var files = ['images/building1_side.jpg', 'images/building2_side.jpg','images/building3_side.jpg','images/building4_side.jpg','images/building5_side.jpg'];
	var material = [];
	loader = new THREE.TextureLoader();

	for (var i = 0; i < files.length; i++) {
		material = [
	       Physijs.createMaterial(new THREE.MeshLambertMaterial({
	           map: loader.load(files[i])
	       }), .4, .6),
	       Physijs.createMaterial(new THREE.MeshLambertMaterial({
	           map: loader.load(files[i])
	       }), .4, .6),
	       Physijs.createMaterial(new THREE.MeshLambertMaterial({
	           map: loader.load(files[i])
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
	createBuilding(-100, 0, -100, 40, 40, 40, 0);
	createBuilding(-30, 0, -100, 40, 30, 40, 1);
	createBuilding(0, 0, 100, 50, 65, 50, 2);
	createBuilding(100, 0, 100, 40, 35, 40, 3);
	createBuilding(150, 0, 150, 50, 35, 50, 4);
} 


function createBuilding(x, y, z, size_x, size_y, size_z, n_material) {
	var build = new Physijs.BoxMesh(new THREE.BoxGeometry(size_x, size_y, size_z), new THREE.MeshFaceMaterial(building_materials[n_material]));
		build.castShadow = build.receiveShadow = true;
		build.position.set(x, size_y/2, z);
		scene.add( build )

	buildings.push(build)
}
