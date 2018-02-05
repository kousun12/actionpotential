const dat = require('dat-gui');
const Stats = require('stats.js');
const css = require('dom-css');
const raf = require('raf');

const THREE = require('three');

const OrbitControls = require('./controls/OrbitControls');
const settings = require('./core/settings');

const math = require('./utils/math');
const ease = require('./utils/ease');
const mobile = require('./fallback/mobile');
const encode = require('mout/queryString/encode');

const WebSocket = require('ws');
const postprocessing = require('./3d/postprocessing/postprocessing');
const motionBlur = require('./3d/postprocessing/motionBlur/motionBlur');
const fxaa = require('./3d/postprocessing/fxaa/fxaa');
const bloom = require('./3d/postprocessing/bloom/bloom');
// const reflectedGround = require('./3d/reflectedGround');
const fboHelper = require('./3d/fboHelper');

const simulator = require('./3d/simulator');
const simulator2 = require('./3d/simulator2');
const simulator3 = require('./3d/simulator3');
const simulator4 = require('./3d/simulator4');
const simulator5 = require('./3d/simulator5');
const simulator6 = require('./3d/simulator6');

const lsimulator = require('./3d/lsimulator');
const lsimulator2 = require('./3d/lsimulator2');
const lsimulator3 = require('./3d/lsimulator3');
const lsimulator4 = require('./3d/lsimulator4');
const lsimulator5 = require('./3d/lsimulator5');
const lsimulator6 = require('./3d/lsimulator6');

const bsimulator = require('./3d/bsimulator');
const bsimulator2 = require('./3d/bsimulator2');
const bsimulator3 = require('./3d/bsimulator3');
const bsimulator4 = require('./3d/bsimulator4');
const bsimulator5 = require('./3d/bsimulator5');
const bsimulator6 = require('./3d/bsimulator6');

const particles = require('./3d/particles');
const particles2 = require('./3d/particles2');
const particles3 = require('./3d/particles3');
const particles4 = require('./3d/particles4');
const particles5 = require('./3d/particles5');
const particles6 = require('./3d/particles6');

const lparticles = require('./3d/lparticles');
const lparticles2 = require('./3d/lparticles2');
const lparticles3 = require('./3d/lparticles3');
const lparticles4 = require('./3d/lparticles4');
const lparticles5 = require('./3d/lparticles5');
const lparticles6 = require('./3d/lparticles6');

const bparticles = require('./3d/bparticles');
const bparticles2 = require('./3d/bparticles2');
const bparticles3 = require('./3d/bparticles3');
const bparticles4 = require('./3d/bparticles4');
const bparticles5 = require('./3d/bparticles5');
const bparticles6 = require('./3d/bparticles6');

const lights = require('./3d/lights');
// const lights2 = require('./3d/lights2');
const floor = require('./3d/floor');

let undef;
let _gui;
let _stats;

let _width = 0;
let _height = 0;

let _control;
let _camera;
let _scene;
let _renderer;

let _time = 0;
let _ray = new THREE.Ray();

let _initAnimation = 0;

let _bgColor;
let bodies = [];
let lbodies = [];

let bodyDirections = [
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(0, 0, 0),
];
let bodyPos = [
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(0, 0, 0),
];

let lbodyDirections = [
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(0, 0, 0),
];
let lbodyPos = [
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(0, 0, 0),
];

let bbodyDirections = [
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(0, 0, 0),
];
let bbodyPos = [
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(0, 0, 0),
];
const jointTestGeo = new THREE.SphereBufferGeometry(5, 32, 32);
const material = new THREE.MeshBasicMaterial({color: 0xffff00});
const jointTestSphere = new THREE.Mesh(jointTestGeo, material);
jointTestSphere.name = 'test Joint';
let newBodyData = false;

function init() {

  let ws = new WebSocket('ws://localhost:8080');

  ws.onopen = function () {
    console.log('WS OPEN')
  };

  ws.onmessage = function (ev) {
    bodies = JSON.parse(ev.data);
    newBodyData = true;
  };

  if (settings.useStats) {
    _stats = new Stats();
    css(_stats.domElement, {
      position: 'absolute',
      left: '0px',
      top: '0px',
      zIndex: 2048
    });

    document.body.appendChild(_stats.domElement);
  }

  _bgColor = new THREE.Color(settings.bgColor);
  settings.mouse = new THREE.Vector2(0, 0);
  settings.mouse3d = _ray.origin;
  settings.bodyPos = bodyPos;
  settings.lbodyPos = lbodyPos;
  settings.bbodyPos = bbodyPos;

  _renderer = new THREE.WebGLRenderer({
    antialias: true
  });
  _renderer.setClearColor(settings.bgColor);
  _renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  _renderer.shadowMap.enabled = true;
  document.body.appendChild(_renderer.domElement);

  _scene = new THREE.Scene();
  _scene.fog = new THREE.FogExp2(settings.bgColor, 0.001);

  _camera = new THREE.PerspectiveCamera(45, 1, 10, 3000);
  _camera.position.set(300, 10, 500).normalize().multiplyScalar(1000);

  let helper = new THREE.CameraHelper(_camera);
  // _scene.add(helper);

  settings.camera = _camera;
  settings.cameraPosition = _camera.position;

  fboHelper.init(_renderer);
  postprocessing.init(_renderer, _scene, _camera);

  simulator.init(_renderer);
  simulator2.init(_renderer);
  simulator3.init(_renderer);
  simulator4.init(_renderer);
  simulator5.init(_renderer);
  simulator6.init(_renderer);

  bsimulator.init(_renderer);
  bsimulator2.init(_renderer);
  bsimulator3.init(_renderer);
  bsimulator4.init(_renderer);
  bsimulator5.init(_renderer);
  bsimulator6.init(_renderer);

  lsimulator.init(_renderer);
  lsimulator2.init(_renderer);
  lsimulator3.init(_renderer);
  lsimulator4.init(_renderer);
  lsimulator5.init(_renderer);
  lsimulator6.init(_renderer);

  particles.init(_renderer);
  particles2.init(_renderer);
  particles3.init(_renderer);
  particles4.init(_renderer);
  particles5.init(_renderer);
  particles6.init(_renderer);

  lparticles.init(_renderer);
  lparticles2.init(_renderer);
  lparticles3.init(_renderer);
  lparticles4.init(_renderer);
  lparticles5.init(_renderer);
  lparticles6.init(_renderer);

  bparticles.init(_renderer);
  bparticles2.init(_renderer);
  bparticles3.init(_renderer);
  bparticles4.init(_renderer);
  bparticles5.init(_renderer);
  bparticles6.init(_renderer);

  _scene.add(particles.container);
  _scene.add(particles2.container);
  _scene.add(particles3.container);
  _scene.add(particles4.container);
  _scene.add(particles5.container);
  _scene.add(particles6.container);

  _scene.add(lparticles.container);
  _scene.add(lparticles2.container);
  _scene.add(lparticles3.container);
  _scene.add(lparticles4.container);
  _scene.add(lparticles5.container);
  _scene.add(lparticles6.container);

  _scene.add(bparticles.container);
  _scene.add(bparticles2.container);
  _scene.add(bparticles3.container);
  _scene.add(bparticles4.container);
  _scene.add(bparticles5.container);
  _scene.add(bparticles6.container);

  lights.init(_renderer);
  _scene.add(lights.mesh);

  // lights2.init();
  // _scene.add(lights2.mesh);

  floor.init(_renderer);
  floor.mesh.position.y = -100;
  _scene.add(floor.mesh);
  // _scene.add(jointTestSphere);
  window.scene = _scene;

  _control = new OrbitControls(_camera, _renderer.domElement);
  _control.target.y = 50;
  _control.maxDistance = 1000;
  _control.minPolarAngle = 0.3;
  _control.maxPolarAngle = Math.PI / 2 - 0.1;
  _control.noPan = true;
  // _control.autoRotate = true;
  _control.update();

  _gui = new dat.GUI();
  if (!settings.useStats) {
    _gui.domElement.hidden = true;
  }

  if (settings.isMobile) {
    _gui.close();
    _control.enabled = false;
  }

  const simulatorGui = _gui.addFolder('Simulator');
  simulatorGui.add(settings.query, 'amount', settings.amountList).onChange(function () {
    if (confirm('It will restart the demo')) {
      window.location.href = window.location.href.split('#')[0] + encode(settings.query).replace('?', '#');
      window.location.reload();
    }
  });
  simulatorGui.add(settings, 'speed', 0, 3).listen();
  simulatorGui.add(settings, 'dieSpeed', 0.0005, 0.05).listen();
  simulatorGui.add(settings, 'radius', 0.2, 3);
  simulatorGui.add(settings, 'curlSize', 0.001, 0.05).listen();
  simulatorGui.add(settings, 'attraction', -2, 2);
  simulatorGui.add(settings, 'followMouse').name('follow mouse');
  simulatorGui.add(settings, 'useKinect').name('useKinect');
  simulatorGui.open();

  const renderingGui = _gui.addFolder('Rendering');
  renderingGui.add(settings, 'shadowDarkness', 0, 1).name('shadow');
  renderingGui.add(settings, 'useTriangleParticles').name('new particle');
  renderingGui.addColor(settings, 'color1').name('base Color');
  renderingGui.addColor(settings, 'color2').name('fade Color');
  renderingGui.addColor(settings, 'bgColor').name('background Color');
  renderingGui.open();


  const postprocessingGui = _gui.addFolder('Post-Processing');
  postprocessingGui.add(settings, 'fxaa').listen();
  motionBlur.maxDistance = 120;
  motionBlur.motionMultiplier = 7;
  motionBlur.linesRenderTargetScale = settings.motionBlurQualityMap[settings.query.motionBlurQuality];
  const motionBlurControl = postprocessingGui.add(settings, 'motionBlur');
  const motionMaxDistance = postprocessingGui.add(motionBlur, 'maxDistance', 1, 300).name('motion distance').listen();
  const motionMultiplier = postprocessingGui.add(motionBlur, 'motionMultiplier', 0.1, 15).name('motion multiplier').listen();
  const motionQuality = postprocessingGui.add(settings.query, 'motionBlurQuality', settings.motionBlurQualityList).name('motion quality').onChange(function (val) {
    motionBlur.linesRenderTargetScale = settings.motionBlurQualityMap[val];
    motionBlur.resize();
  });
  let controlList = [motionMaxDistance, motionMultiplier, motionQuality];
  motionBlurControl.onChange(enableGuiControl.bind(this, controlList));
  enableGuiControl(controlList, settings.motionBlur);

  // reflectedGround.init(_renderer, _scene, _camera);
  // _scene.add(reflectedGround.mesh);
  const bloomControl = postprocessingGui.add(settings, 'bloom');
  const bloomRadiusControl = postprocessingGui.add(bloom, 'blurRadius', 0, 3).name('bloom radius');
  const bloomAmountControl = postprocessingGui.add(bloom, 'amount', 0, 3).name('bloom amount');
  controlList = [bloomRadiusControl, bloomAmountControl];
  bloomControl.onChange(enableGuiControl.bind(this, controlList));
  enableGuiControl(controlList, settings.bloom);
  postprocessingGui.open();

  function enableGuiControl(controls, flag) {
    controls = controls.length ? controls : [controls];
    let control;
    for (let i = 0, len = controls.length; i < len; i++) {
      control = controls[i];
      control.__li.style.pointerEvents = flag ? 'auto' : 'none';
      control.domElement.parentNode.style.opacity = flag ? 1 : 0.1;
    }
  }

  const preventDefault = function (evt) {
    evt.preventDefault();
    this.blur();
  };
  Array.prototype.forEach.call(_gui.domElement.querySelectorAll('input[type="checkbox"],select'), function (elem) {
    elem.onkeyup = elem.onkeydown = preventDefault;
    elem.style.color = '#000';
  });

  window.addEventListener('resize', _onResize);
  window.addEventListener('mousemove', _onMove);
  window.addEventListener('touchmove', _bindTouch(_onMove));
  window.addEventListener('keyup', _onKeyUp);

  _time = Date.now();
  _onResize();
  _loop();

}

function _onKeyUp(evt) {
  console.log(evt);
  if (evt.keyCode === 32) {
    settings.speed = settings.speed === 0 ? 1 : 0;
    settings.dieSpeed = settings.dieSpeed === 0 ? 0.015 : 0;
  }
  if (evt.key === 'd') {
    dat.GUI.toggleHide();
  }
}

function _bindTouch(func) {
  return function (evt) {
    if (settings.isMobile && evt.preventDefault) {
      evt.preventDefault();
    }
    func(evt.changedTouches[0]);
  };
}

function _onMove(evt) {
  settings.mouse.x = (evt.pageX / _width) * 2 - 1;
  settings.mouse.y = -(evt.pageY / _height) * 2 + 1;
}

function _onResize() {
  _width = window.innerWidth;
  _height = window.innerHeight;

  postprocessing.resize(_width, _height);

}

function _loop() {
  const newTime = Date.now();
  raf(_loop);
  if (settings.useStats) _stats.begin();
  _render(newTime - _time, newTime);
  if (settings.useStats) _stats.end();
  _time = newTime;
}

const bodyMult = new THREE.Vector3(1,1,2);
function _render(dt, newTime) {

  motionBlur.skipMatrixUpdate = !(settings.dieSpeed || settings.speed) && settings.motionBlurPause;

  const osc = newTime / 3000
  const speedRange = settings.speedMax - settings.speedMin;
  const speedNorm = speedRange / 2;
  settings.speed = speedRange / 2 * Math.sin(osc) + speedNorm;
  settings.bspeed = settings.speed / 4;

  const dspeedRange = settings.dieSpeedMax - settings.dieSpeedMin;
  const dspeedNorm = dspeedRange / 2;
  settings.dieSpeed = Math.max(dspeedRange / 2 * Math.cos(osc) + dspeedNorm, settings.dieSpeedMin);
  settings.bdieSpeed = settings.dieSpeed + 0.02;


  _bgColor.setStyle(settings.bgColor);
  const tmpColor = floor.mesh.material.color;
  tmpColor.lerp(_bgColor, 0.05);
  _scene.fog.color.copy(tmpColor);
  _renderer.setClearColor(tmpColor.getHex());

  _initAnimation = Math.min(_initAnimation + dt * 0.00025, 1);
  simulator.initAnimation = _initAnimation;
  simulator2.initAnimation = _initAnimation;
  simulator3.initAnimation = _initAnimation;
  simulator4.initAnimation = _initAnimation;
  simulator5.initAnimation = _initAnimation;
  simulator6.initAnimation = _initAnimation;
  lsimulator.initAnimation = _initAnimation;
  lsimulator2.initAnimation = _initAnimation;
  lsimulator3.initAnimation = _initAnimation;
  lsimulator4.initAnimation = _initAnimation;
  lsimulator5.initAnimation = _initAnimation;
  lsimulator6.initAnimation = _initAnimation;

  bsimulator.initAnimation = _initAnimation;
  bsimulator2.initAnimation = _initAnimation;
  bsimulator3.initAnimation = _initAnimation;
  bsimulator4.initAnimation = _initAnimation;
  bsimulator5.initAnimation = _initAnimation;
  bsimulator6.initAnimation = _initAnimation;

  _control.maxDistance = _initAnimation === 1 ? 1000 : math.lerp(1000, 450, ease.easeOutCubic(_initAnimation));
  _control.update();
  lights.update(dt, _camera);
  // lights2.update(dt, _camera);

  // update mouse3d
  _camera.updateMatrixWorld();
  _ray.origin.setFromMatrixPosition(_camera.matrixWorld);
  _ray.direction.set(settings.mouse.x, settings.mouse.y, 0.5).unproject(_camera).sub(_ray.origin).normalize();
  const distance = _ray.origin.length() / Math.cos(Math.PI - _ray.direction.angleTo(_ray.origin));
  _ray.origin.add(_ray.direction.multiplyScalar(distance * 1.0));

  bodies.forEach(function (body) {
    const idx = body.bodyIndex;
    if (body.tracked) {
      if (newBodyData) {
        bodyPos[idx].setFromMatrixPosition(_camera.matrixWorld);
        bodyDirections[idx].set(
          (body.joints[11].depthX - 0.5) * 2,
          (body.joints[11].depthY - 0.5) * -2,
          (body.joints[11].cameraZ / 2 - 0.5) * 2
        ).unproject(_camera).sub(bodyPos[idx]).normalize();

        lbodyPos[idx].setFromMatrixPosition(_camera.matrixWorld);
        lbodyDirections[idx].set(
          (body.joints[7].depthX - 0.5) * 2,
          (body.joints[7].depthY - 0.5) * -2,
          (body.joints[7].cameraZ / 2 - 0.5) * 2
        ).unproject(_camera).sub(lbodyPos[idx]).normalize();

        bbodyPos[idx].setFromMatrixPosition(_camera.matrixWorld);
        bbodyDirections[idx].set(
          (body.joints[0].depthX - 0.5) * 2,
          (body.joints[0].depthY - 0.5) * -2,
          (body.joints[0].cameraZ / 2 - 0.5) * 2
        ).unproject(_camera).sub(bbodyPos[idx]).normalize();
      }
      let d = bodyPos[idx].length() / Math.cos(Math.PI - bodyDirections[idx].angleTo(bodyPos[idx]));
      let ld = lbodyPos[idx].length() / Math.cos(Math.PI - lbodyDirections[idx].angleTo(lbodyPos[idx]));
      let bd = bbodyPos[idx].length() / Math.cos(Math.PI - bbodyDirections[idx].angleTo(bbodyPos[idx]));
      if (d) {
        bodyPos[idx].add(bodyDirections[idx].multiplyScalar(d * 0.5).multiply(bodyMult));
        lbodyPos[idx].add(lbodyDirections[idx].multiplyScalar(ld * 0.5).multiply(bodyMult));
        bbodyPos[idx].add(bbodyDirections[idx].multiplyScalar(bd * 0.5).multiply(bodyMult));
      }
    } else {
      bodyPos[idx].set(0,0,0);
      bodyDirections[idx].set(0,0,0);
      lbodyPos[idx].set(0,0,0);
      lbodyDirections[idx].set(0,0,0);
      bbodyPos[idx].set(0,0,0);
      bbodyDirections[idx].set(0,0,0);
    }
  });

  simulator.update(dt);
  simulator2.update(dt);
  simulator3.update(dt);
  simulator4.update(dt);
  simulator5.update(dt);
  simulator6.update(dt);

  bsimulator.update(dt);
  bsimulator2.update(dt);
  bsimulator3.update(dt);
  bsimulator4.update(dt);
  bsimulator5.update(dt);
  bsimulator6.update(dt);

  lsimulator.update(dt);
  lsimulator2.update(dt);
  lsimulator3.update(dt);
  lsimulator4.update(dt);
  lsimulator5.update(dt);
  lsimulator6.update(dt);

  particles.update(dt);
  particles2.update(dt);
  particles3.update(dt);
  particles4.update(dt);
  particles5.update(dt);
  particles6.update(dt);

  lparticles.update(dt);
  lparticles2.update(dt);
  lparticles3.update(dt);
  lparticles4.update(dt);
  lparticles5.update(dt);
  lparticles6.update(dt);

  bparticles.update(dt);
  bparticles2.update(dt);
  bparticles3.update(dt);
  bparticles4.update(dt);
  bparticles5.update(dt);
  bparticles6.update(dt);
  // reflectedGround.update();

  fxaa.enabled = !!settings.fxaa;
  motionBlur.enabled = !!settings.motionBlur;
  bloom.enabled = !!settings.bloom;

  // _renderer.render(_scene, _camera);
  postprocessing.render(dt, newTime);

}

mobile.pass(init);
