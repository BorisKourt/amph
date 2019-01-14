var object, water, clock;

var params = {
  color: '#eeeeef',
  scale: 1,
  flowX: 20,
  flowY: 9
};

clock = new THREE.Clock();

sceneCube = new THREE.Scene();

var textureLoader = new THREE.TextureLoader();
textureEquirec = textureLoader.load( "skythin.png" );
textureEquirec.mapping = THREE.EquirectangularReflectionMapping;
textureEquirec.magFilter = THREE.LinearFilter;
textureEquirec.minFilter = THREE.LinearMipMapLinearFilter;
textureEquirec.encoding = THREE.sRGBEncoding;

var equirectShader = THREE.ShaderLib[ "equirect" ];

var equirectMaterial = new THREE.ShaderMaterial( {
  fragmentShader: equirectShader.fragmentShader,
  vertexShader: equirectShader.vertexShader,
  uniforms: equirectShader.uniforms,
  depthWrite: false,
  side: THREE.BackSide
} );

equirectMaterial.uniforms[ "tEquirect" ].value = textureEquirec;

Object.defineProperty( equirectMaterial, 'map', {

  get: function () {

    return this.uniforms.tEquirect.value;

  }

} );

cubeMesh = new THREE.Mesh( new THREE.SphereBufferGeometry( 4000, 32, 32), equirectMaterial);
cubeMesh.material = equirectMaterial;
cubeMesh.visible = true;

var material = new THREE.MeshPhysicalMaterial( {
  color: 0,
  metalness: 0.6,
  roughness: 0.7,
  clearCoat: 0.11 ,
  clearCoatRoughness: 0.2 ,
  reflectivity: 0.9 ,
  envMap: textureEquirec
});

var material2 = new THREE.MeshPhysicalMaterial( {
  color: 0x999999,
  metalness: 0.6,
  roughness: 0.7,
  clearCoat: 0.11 ,
  clearCoatRoughness: 0.2 ,
  reflectivity: 0.9 ,
  envMap: textureEquirec
});

var object, object2;

function loadModel() {

  object.traverse( function ( child ) {

    if ( child.isMesh ) child.material = material;

  });

  object.position.y = 100;
  object.scale = new THREE.Vector3(2.1,1.1,2.2);
  scene.add( object );

  object2.traverse( function ( child ) {

    if ( child.isMesh ) child.material = material2;

  });

  object2.position.y = 90;
  object2.scale = new THREE.Vector3(2.2,0.1,9.9);
  // Exclude for now.
  //scene.add( object2 );

};

var manager = new THREE.LoadingManager( loadModel );

manager.onProgress = function ( item, loaded, total ) {

  console.log( item, loaded, total );

};

var loader = new THREE.OBJLoader(manager);


function onError() {}
function onProgress() {}

var loader = new THREE.OBJLoader( manager );

loader.load( 'island.obj', function ( obj ) {

  object = obj.clone();
  object2 = obj.clone();

}, onProgress, onError );


const N = 256;
const gData = {
  nodes: [...Array(N).keys()].map(i => ({ id: i })),
  links: [...Array(N).keys()]
  .filter(id => id)
  .map(id => ({
    source: id,
    target: Math.round(Math.random() * (id-1))
  }))
};



const graph = ForceGraph3D()
(document.getElementById('graph-3d'))
  .graphData(gData)
  .onNodeHover(node => document.getElementById('graph-3d').style.cursor = node ? 'pointer' : null)
  .backgroundColor("#000000")
  .showNavInfo(false)
  .linkVisibility(false)
  .onNodeClick(node => {
    // Aim at node from outside it
    const distance = 40;
    const distRatio = 1 + distance/Math.hypot(node.x, node.y, node.z);

    graph.cameraPosition(
      { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio }, // new position
      node, // lookAt ({ x, y, z })
      3000  // ms transition duration
    );
  });


const planeGeometry = new THREE.PlaneGeometry(1000, 1000, 1, 1);
const planeMaterial = new THREE.MeshLambertMaterial({color: 0xFF0000, side: THREE.DoubleSide});
// Add the island.
const mesh = new THREE.Mesh(planeGeometry, material);
mesh.position.set(-100, -200, -100);
mesh.rotation.set(0.5 * Math.PI, 0, 0);

var ambient = new THREE.AmbientLight( 0xffffff );
scene.add( ambient );

var size = 8000;
var divisions = 100;

var gridHelper = new THREE.GridHelper( size, divisions, 0x111111, 0x111111 );
var geometry = new THREE.CircleGeometry( 4000, 128 );

var directionalLight = new THREE.DirectionalLight( 0xffffff, 1.0 );
directionalLight.position.set( 2000 * 2, 500 * 2, -2000 * 2);
scene.add( directionalLight );

//var circle = new THREE.Mesh( geometry, material );
//:	var waterGeometry = new THREE.PlaneBufferGeometry( 4000, 4000 );
/*
water2 = new THREE.Water( geometry, {
        color: params.color,
        scale: params.scale,
        flowDirection: new THREE.Vector2( params.flowX, params.flowY ),
        textureWidth: 1024,
        textureHeight: 1024
      } );

water2.position.y = -0.01;
water2.rotation.x = Math.PI *  0.5;

water = new THREE.Water( geometry, {
        color: params.color,
        scale: params.scale,
        flowDirection: new THREE.Vector2( params.flowX, params.flowY ),
        textureWidth: 1024,
        textureHeight: 1024
      } );

water.position.y = 0.01;
water.rotation.x = Math.PI * - 0.5;
*/
water = new THREE.Water(
  geometry,
  {
    textureWidth: 512,
    textureHeight: 512,
    waterNormals: new THREE.TextureLoader().load( 'waternormals.jpg', function ( texture ) {
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    } ),
    alpha: 0.5,
    //sunDirection: //new THREE.Vector3( 2000, 2000, 2000 ).normalize(), //Math.PI/2, //light.position.clone().normalize(),
    sunDirection: directionalLight.position.clone().normalize(),
    sunColor: 0xffffff,
    waterColor: 0x000001,
    distortionScale: 6.7,
    fog: scene.fog !== undefined
  }
);
water.rotation.x = - Math.PI / 2;

water2 = new THREE.Water(
  geometry,
  {
    textureWidth: 512,
    textureHeight: 512,
    waterNormals: new THREE.TextureLoader().load( 'waternormals.jpg', function ( texture ) {
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    } ),
    alpha: 0.3,
    sunDirection: directionalLight.position.clone().normalize(),
    sunColor: 0xffffff,
    waterColor: 0x000000,
    distortionScale: 6.7,
    fog: scene.fog !== undefined
  }
);
water2.position.y = -0.01;
water2.rotation.x = Math.PI / 2;


//circle.rotation.set( -(Math.PI / 2), 0, 0);

gridHelper.position.set(0,0,0);

//scene.add( circle );
//scene.add( gridHelper );
graph.scene().add(cubeMesh);
scene.add( water );
scene.add( water2 );
scene.fog = new THREE.FogExp2( 0x000000, 0.00005, 20000);

/*
window.setTimeout(function() {

  water.material.uniforms.time.value += 1.0 / 60.0;
  water2.material.uniforms.time.value += 1.0 / 60.0;
  graph.renderer().render( graph.scene(), graph.camera() );

}, 16);
*/
