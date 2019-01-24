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

  cubeMesh = new THREE.Mesh( new THREE.SphereBufferGeometry( 4000, 128, 128), equirectMaterial);
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
    color: 0x18A1f2,
    metalness: 0.0,
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

  var material5 = new THREE.MeshPhysicalMaterial( {
    color: 0x00ffff,
    metalness: 0.0,
    roughness: 0.9,
    clearCoat: 0.2,
    clearCoatRoughness: 0.2,
    reflectivity: 0.3,
    side: THREE.DoubleSide,
    envMap: textureEquirec
  });

  object3.scale.set(15.5 * 2,15.5 * 2,15.5 * 2); 
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

  let highlightNodes = [];
  let highlightLink = null;

  const graph = ForceGraph3D({controlType: "orbit"})(document.getElementById('graph-3d')) 
    .graphData(gData)
    .enableNodeDrag(false)
    .backgroundColor("#000000")
    .showNavInfo(false)
    .linkVisibility(false)
  //.cooldownTime(Infinity)
      .d3AlphaDecay(0.1)
      .d3VelocityDecay(0.02)
    .cameraPosition({z: -2310, y: 135, x: -2200})
    .nodeThreeObject(node => {
      if (node.id % 2 == 0) {
        const obj = new THREE.Mesh(
          new THREE.CircleGeometry( 16 * 2, 32),
          new THREE.MeshLambertMaterial( { color: 0xffffff, map: imgTexture, side: THREE.DoubleSide} )
        );
        obj.rotation.set(0, node.rotation, 0);
        const ox = object3.clone();
        if (highlightNodes.indexOf(node) === -1)  { 

          ox.traverse( function ( child ) {
            if ( child.isMesh ) child.material = material3;
          });

        } else {

          ox.traverse( function ( child ) {
            if ( child.isMesh ) child.material = material5;
          });

        }

        obj.add(ox);
        return obj;
      } else {
        const obj2 = new THREE.Mesh(
          new THREE.CircleGeometry( 16 * 2, 32),
          new THREE.MeshLambertMaterial( { color: 0xffffff, map: imgTexture2, side: THREE.DoubleSide} )
        );
        obj2.rotation.set(0, node.rotation, 0);
        const ox = object3.clone();

        if (highlightNodes.indexOf(node) === -1)  { 

          ox.traverse( function ( child ) {
            if ( child.isMesh ) child.material = material4;
          });

        } else {

          ox.traverse( function ( child ) {
            if ( child.isMesh ) child.material = material5;
          });

        }

        obj2.add(ox);
        return obj2;
      }
    })
  .onNodeHover(node => {
    /*
     document.getElementById('graph-3d').style.cursor = node ? 'pointer' : null     // no state change
          if ((!node && !highlightNodes.length) || (highlightNodes.length === 1 && highlightNodes[0] === node)) return;
          highlightNodes = node ? [node] : [];
          updateGeometries();
          */
        })
    .onNodeClick(node => {
      // Aim at node from outside it
      const distance = 128;
      const distRatio = 1 + distance/Math.hypot(node.x, node.y, node.z);

      graph.cameraPosition(
        { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio }, // new position
        node, // lookAt ({ x, y, z })
        3000  // ms transition duration
      );
    });

  function updateGeometries() {
      graph.nodeRelSize(4); // trigger update of 3d objects in scene
  }

  const linkForce = graph
      .d3Force('link')
      .distance(link => 900);


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
  object.rotation.y = Math.PI / 2;
  object.scale.set(4.5,2.6,4.5); 
  scene.add( object );

  object2.traverse( function ( child ) {

    if ( child.isMesh ) child.material = material2;

  });

  object2.position.y = 16;
  object2.scale.set(4.5,2.6,4.5); 
  object2.rotation.y = Math.PI / 2;
  scene.add( object2 );

  var radius = 4000;
var radials = 16;
var circles = 8;
var divisions = 256;

var helper = new THREE.PolarGridHelper( radius, radials, circles, divisions, 0x222222, 0x262626  );
  helper.position.y = -0.005;
scene.add( helper );


/*  {
      let distance = 2000;
      let distRatio = 1 + distance/Math.hypot(object.position.x, object.position.y, object.position.z);

      graph.cameraPosition(
        { x: object.position.x * distRatio, y: object.position.y * distRatio, z: object.position.z * distRatio }, // new position
        object
      );
  } */

}
