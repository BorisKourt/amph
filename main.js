var object, object2;

function loadModel() {

};

var manager = new THREE.LoadingManager( loadModel );

manager.onProgress = function ( item, loaded, total ) {

  console.log( item, loaded, total );

  if (loaded === total) {
    runner();
  }

};


function onError() {}
function onProgress() {}

var loader = new THREE.OBJLoader(manager);

loader.load( 'archipelago.obj', function ( obj ) {

  object = obj;

}, onProgress, onError );

loader.load( 'beaches.obj', function ( obj ) {

  object2 = obj;

}, onProgress, onError );


function runner() {

  var water, clock;

  var params = {
    color: '#eeeeef',
    scale: 100,
    flowX: 20,
    flowY: 20
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
    color: 0x010101,
    metalness: 0.25,
    roughness: 0.6,
    clearCoat: 0.41 ,
    clearCoatRoughness: 0.3 ,
    reflectivity: 0.2,
    envMap: textureEquirec
  });

  var material2 = new THREE.MeshPhysicalMaterial( {
    color: 0x606060,
    metalness: 0.05,
    roughness: 0.9,
    clearCoat: 0.0,
    clearCoatRoughness: 0.2,
    reflectivity: 0.1,
    envMap: textureEquirec
  });

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

  var zNear = 10;
  var zFar = 3500000;

  var cam = graph.camera();
  cam.far = (zFar);
  cam.near = (zNear);
  cam.aspect = (window.innerWidth / window.innerHeight);
  cam.updateProjectionMatrix();



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

  var gridHelper = new THREE.GridHelper( size, divisions, 0x999999, 0x999999 );
  var geometry = new THREE.CircleGeometry( 4000, 128 );

  var directionalLight = new THREE.DirectionalLight( 0x666666, 1.0 );
  directionalLight.position.set( 2000 * 2, 256 * 2, -100 * 2);
  scene.add( directionalLight );

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
      distortionScale: 60.7,
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
      distortionScale: 60.7,
      fog: scene.fog !== undefined
    }
  );

  water2.position.y = -0.01;
  water2.rotation.x = Math.PI / 2;

  gridHelper.position.set(0,0,0);
  //scene.add( gridHelper );

  graph.scene().add(cubeMesh);
  scene.add( water );
  scene.add( water2 );
  scene.fog = new THREE.FogExp2( 0x000000, 0.00005, 20000);

  object.traverse( function ( child ) {

    if ( child.isMesh ) child.material = material;

  });

  object.position.y = 10;
  object.scale.set(3,2,3); 
  scene.add( object );

  object2.traverse( function ( child ) {

    if ( child.isMesh ) child.material = material2;

  });

  object2.position.y = 10;
  object2.scale.set(3,2,3); 
  scene.add( object2 );

}
