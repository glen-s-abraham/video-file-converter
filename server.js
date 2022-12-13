const amqplib = require("amqplib/callback_api");
const { spawn } = require("child_process");

const ffmpegCmd = "ffmpeg";

let amqpChannel;
let VIDEO_PUB_Q = "videopublished";
amqplib.connect("amqp://admin:password@192.168.5.49:5672", (err, conn) => {
  if (err) throw err;
  if (!conn) console.log("Not connected to rabbitmq");
  else
    conn.createChannel((err, ch) => {
      if (err) throw new err();
      amqpChannel = ch;
      if (amqpChannel) {
        amqpChannel.assertQueue(VIDEO_PUB_Q);
        amqpChannel.consume(
          VIDEO_PUB_Q,
          (data) => handleVideoConversion(data.content.toString()),
          {
            noAck: true,
          }
        );
      }
    });
});


const convertTo720 = async (path) => {
  const fileName = path.split("/").pop();
  const storagePath = path.split("/").slice(0, -1).join("/");
  let args = [
    "-i",
    path,
    "-vf",
    "scale=1280x720",
    "-preset",
    "slow",
    "-crf",
    "18",
    `${storagePath}/720-${fileName}`,
  ];
  var proc = spawn(ffmpegCmd, args);

  proc.stdout.on("data", function (data) {
    console.log(data);
  });

  proc.stderr.setEncoding("utf8");
  proc.stderr.on("data", function (data) {
    console.log(data);
    return {status:'fail'}
  });

  proc.on("close", function () {
    return {status:'success'}
  });
};

const convertTo360 = async (path) => {
    const fileName = path.split("/").pop();
    const storagePath = path.split("/").slice(0, -1).join("/");
    let args = [
      "-i",
      path,
      "-vf",
      "scale=480x360",
      "-preset",
      "fast",
      "-crf",
      "18",
      `${storagePath}/360-${fileName}`,
    ];
    var proc = spawn(ffmpegCmd, args);
  
    proc.stdout.on("data", function (data) {
      console.log(data);
    });
  
    proc.stderr.setEncoding("utf8");
    proc.stderr.on("data", function (data) {
      console.log(data);
      return {status:'fail'}
    });
  
    proc.on("close", function () {
      return {status:'success'}
    });
  };

  const convertTo240 = async (path) => {
    const fileName = path.split("/").pop();
    const storagePath = path.split("/").slice(0, -1).join("/");
    let args = [
      "-i",
      path,
      "-vf",
      "scale=320x240",
      "-preset",
      "fast",
      "-crf",
      "18",
      `${storagePath}/240-${fileName}`,
    ];
    var proc = spawn(ffmpegCmd, args);
  
    proc.stdout.on("data", function (data) {
      console.log(data);
    });
  
    proc.stderr.setEncoding("utf8");
    proc.stderr.on("data", function (data) {
      console.log(data);
      return {status:'fail'}
    });
  
    proc.on("close", function () {
      return {status:'success'}
    });
  };

  const convertTo144 = async (path) => {
    const fileName = path.split("/").pop();
    const storagePath = path.split("/").slice(0, -1).join("/");
    let args = [
      "-i",
      path,
      "-vf",
      "scale=192x144",
      "-preset",
      "fast",
      "-crf",
      "18",
      `${storagePath}/144-${fileName}`,
    ];
    var proc = spawn(ffmpegCmd, args);
  
    proc.stdout.on("data", function (data) {
      console.log(data);
    });
  
    proc.stderr.setEncoding("utf8");
    proc.stderr.on("data", function (data) {
      console.log(data);
      return {status:'fail'}
    });
  
    proc.on("close", function () {
      return {status:'success'}
    });
  };
  


//ffmpeg -y -i movie.avi -an -c:v libx264 -x264opts 'keyint=24:min-keyint=24:no-scenecut' -b:v 1500k -maxrate 1500k -bufsize 3000k -vf "scale=-1:720" movie-720.mp4
//ffmpeg -y -i movie.avi -an -c:v libx264 -x264opts 'keyint=24:min-keyint=24:no-scenecut' -b:v 800k -maxrate 800k -bufsize 1600k -vf "scale=-1:540" movie-540.mp4
//ffmpeg -y -i movie.avi -an -c:v libx264 -x264opts 'keyint=24:min-keyint=24:no-scenecut' -b:v 400k -maxrate 400k -bufsize 800k -vf "scale=-1:360" movie-360.mp4
const handleVideoConversion = async (path) => { 
  const ack720 = convertTo720(path);
  const ack360 = convertTo360(path);
  const ack240 = convertTo240(path);
  const ack144 = convertTo144(path);
};
