var object, object2, object3;

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

loader.load( 'blorb.obj', function ( obj ) {

  object3 = obj;

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
    clearCoatRoughness: 0.3,
    reflectivity: 0.2,
    envMap: textureEquirec
  });

  var material2 = new THREE.MeshPhysicalMaterial( {
    color: 0x909090,
    metalness: 0.05,
    roughness: 0.9,
    clearCoat: 0.0,
    clearCoatRoughness: 0.2,
    reflectivity: 0.1,
    envMap: textureEquirec
  });

  var material3 = new THREE.MeshPhysicalMaterial( {
    color: 0x000000,
    metalness: 0.4,
    roughness: 0.9,
    clearCoat: 0.6,
    clearCoatRoughness: 0.2,
    reflectivity: 0.9,
    side: THREE.DoubleSide,
    envMap: textureEquirec
  });

  var material4 = new THREE.MeshPhysicalMaterial( {
    color: 0x000000,
    metalness: 0.2,
    roughness: 0.2,
    clearCoat: 0.2,
    clearCoatRoughness: 0.2,
    reflectivity: 0.3,
    side: THREE.DoubleSide,
    envMap: textureEquirec
  });

  object3.scale.set(15.5,15.5,15.5); 
  object3.rotation.set(Math.PI / 2,0,0);

  const N = 64;
  const gData = {
    nodes: [...Array(N).keys()].map(i => ({ 
      id: i,
      rotation: (Math.random() * (Math.PI * 2.0))
    })),
    links: [...Array(N).keys()]
    .filter(id => id)
    .map(id => ({
      source: id,
      target: Math.round(Math.random() * (id-1))
    }))
  };


  const imgTexture = new THREE.TextureLoader().load(`default.jpg`);
  imgTexture.anisotropy = 1;

  const imgTexture2 = new THREE.TextureLoader().load(`default2.jpg`);
  imgTexture2.anisotropy = 1;

  const graph = ForceGraph3D()(document.getElementById('graph-3d')) 
    .graphData(gData)
    .onNodeHover(node => document.getElementById('graph-3d').style.cursor = node ? 'pointer' : null)
    .backgroundColor("#000000")
    .showNavInfo(false)
    .linkVisibility(false)
    .cameraPosition({z: 610, y: 90, x: -1800})
    .nodeThreeObject(node => {
      if (node.id % 2 == 0) {
        const obj = new THREE.Mesh(
          new THREE.CircleGeometry( 16, 32),
          new THREE.MeshLambertMaterial( { color: 0xffffff, map: imgTexture, side: THREE.DoubleSide} )
        );
        obj.rotation.set(0, node.rotation, 0);
        const ox = object3.clone();

        ox.traverse( function ( child ) {

          if ( child.isMesh ) child.material = material3;

        });

        obj.add(ox);
        return obj;
      } else {
        const obj2 = new THREE.Mesh(
          new THREE.CircleGeometry( 16, 32),
          new THREE.MeshLambertMaterial( { color: 0xffffff, map: imgTexture2, side: THREE.DoubleSide} )
        );
        obj2.rotation.set(0, node.rotation, 0);
        const ox = object3.clone();

        ox.traverse( function ( child ) {

          if ( child.isMesh ) child.material = material4;

        });

        obj2.add(ox);
        return obj2;
      }
    })
    .onNodeClick(node => {
      // Aim at node from outside it
      const distance = 32;
      const distRatio = 1 + distance/Math.hypot(node.x, node.y, node.z);

      graph.cameraPosition(
        { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio }, // new position
        node, // lookAt ({ x, y, z })
        3000  // ms transition duration
      );
    });

  const linkForce = graph
      .d3Force('link')
      .distance(link => 700);


  var renderer = graph.renderer();

  var zNear = 10;
  var zFar = 3500000;

  var cam = graph.camera();
  cam.far = (zFar);
  cam.near = (zNear);
  cam.aspect = (window.innerWidth / window.innerHeight);
  cam.fov = 64;
  cam.updateProjectionMatrix();

  var size = 8000;
  var divisions = 100;

  var gridHelper = new THREE.GridHelper( size, divisions, 0x999999, 0x999999 );

  var directionalLight = new THREE.DirectionalLight( 0x666666, 1.0 );
  directionalLight.position.set( 2000 * 2, 256 * 2, -100 * 2);
  directionalLight.castShadow = true;
  scene.add( directionalLight );

  var geometry = new THREE.CircleGeometry( 4000, 128 );

  water = new THREE.Water(
    geometry,
    {
      textureWidth: 512,
      textureHeight: 512,
      waterNormals: new THREE.TextureLoader().load( 'waternormals.jpg', function ( texture ) {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      } ),
      alpha: 0.5,
      sunColor: 0xffffff,
      sunDirection: directionalLight.position.clone().normalize(),
      waterColor: 0x0f0f1c,
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
      waterColor: 0x22292f,
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

  object.position.y = 16;
  object.scale.set(3,2,3); 
  scene.add( object );

  object2.traverse( function ( child ) {

    if ( child.isMesh ) child.material = material2;

  });

  object2.position.y = 16;
  object2.scale.set(3,2,3); 
  scene.add( object2 );



/*  {
      let distance = 2000;
      let distRatio = 1 + distance/Math.hypot(object.position.x, object.position.y, object.position.z);

      graph.cameraPosition(
        { x: object.position.x * distRatio, y: object.position.y * distRatio, z: object.position.z * distRatio }, // new position
        object
      );
  } */

}
