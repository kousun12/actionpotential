const budo = require('budo');
const path = require('path');
const opn = require('opn');
const fs = require('fs');
const simpleHtml = require('simple-html-index');
// const Kinect2 = require('kinect2');
const babelify = require('babelify')
const ws = require('ws');


var entryPath = path.resolve('src', 'index.js');
budo(entryPath, {
  serve: 'js/index.js',
  live: true,
  dir: __dirname + '/app',
  stream: process.stdout,
  defaultIndex: function (opt) {
    var html = 'index.html';
    if (!fs.existsSync(html)) return simpleHtml(opt);
    return fs.createReadStream(html);
  },
  browserify: {
    transform: [
      babelify,
      ['installify', {save: true}],
      ['glslify', {global: true}]
    ]
  }
}).on('connect', function (ev) {
  const uri = ev.uri + 'index.html';
  opn(uri);
});

const wss = new ws.Server({ port: 8080 });
// const kinect = new Kinect2();

wss.broadcast = function broadcast(data) {
  wss.clients.forEach(function each(client) {
    if (client.readyState === ws.OPEN) {
      client.send(data, function (e) {});
    }
  });
};

wss.on('connection', function connection(ws) {
  console.log('someone connected')
});

wss.on('listening', function l() {
  console.log('ws listening')
  // if (kinect.open()) {
  //   console.log("---Kinect Opened---");
  //   kinect.on('bodyFrame', function (bodyFrame) {
  //     wss.broadcast(JSON.stringify(bodyFrame.bodies));
  //   });
  //   kinect.openBodyReader();
  // }
});

wss.on('error', function connection(e) {
  console.log(e);
});


