const amqplib = require("amqplib/callback_api");
const { spawn } = require("child_process");
const fs = require('fs');
const EventEmitter = require('events');

const ffmpegCmd = "ffmpeg";

const eventEmitter = new EventEmitter();

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


eventEmitter.on('conversionFailed',(err)=>{
    console.log(err);
    //handle by publishing event to rabbitmq and letting use know 
})

eventEmitter.on('conversionSuccess',(hlsPath)=>{
    console.log(`completed`);
    let manifest = '#EXTM3U'
    manifest+='\n#EXT-X-VERSION:3'
    manifest+='\n#EXT-X-STREAM-INF:BANDWIDTH=800000,RESOLUTION=640x360'
    manifest+='\n#360p.m3u8'
    manifest+='\n#EXT-X-STREAM-INF:BANDWIDTH=1400000,RESOLUTION=842x480'
    manifest+='\n480p.m3u8'
    manifest+='\n#EXT-X-STREAM-INF:BANDWIDTH=2800000,RESOLUTION=1280x720'
    manifest+= '720p.m3u8'
    manifest+= '#EXT-X-STREAM-INF:BANDWIDTH=5000000,RESOLUTION=1920x1080'
    manifest+= '1080p.m3u8'
    manifest+= '#EXTM3U'

    fs.writeFileSync(`${hlsPath}/playlist.m3u8`,manifest);
     
})

const convertToHLS = (path)=>{
    const fileName = path.split('/').pop();
    const storagePath = path.split("/").slice(0, -1).join("/");
       const n = path.lastIndexOf('.mp4');
       newDir = path.slice(0, n) + path.slice(n).replace('.mp4', '');
       fs.mkdirSync(newDir);
       const args = [
        '-i', path,

        '-vf','scale=1920x1080','-c:a','aac','-ar','48000','-b:a','128k','-c:v','h264','-profile:v','main',
        '-crf','20','-g','48','-keyint_min','48','-sc_threshold','0','-b:v','2500k','-maxrate','2675k','-bufsize',
        '3750k','-hls_time','4','-hls_playlist_type','vod','-hls_segment_filename',`${newDir}/1080p_%03d.ts`, `${newDir}/1080p.m3u8`,

        '-vf','scale=1280x720','-c:a','aac','-ar','48000','-b:a','128k','-c:v','h264','-profile:v','main',
        '-crf','20','-g','48','-keyint_min','48','-sc_threshold','0','-b:v','2500k','-maxrate','2675k','-bufsize',
        '3750k','-hls_time','4','-hls_playlist_type','vod','-hls_segment_filename',`${newDir}/720p_%03d.ts`, `${newDir}/720p.m3u8`,

        '-vf','scale=842x480','-c:a','aac','-ar','48000','-b:a','128k','-c:v','h264','-profile:v','main',
        '-crf','20','-g','48','-keyint_min','48','-sc_threshold','0','-b:v','2500k','-maxrate','2675k','-bufsize',
        '3750k','-hls_time','4','-hls_playlist_type','vod','-hls_segment_filename',`${newDir}/480p_%03d.ts`, `${newDir}/480p.m3u8`,

        '-vf','scale=640x360','-c:a','aac','-ar','48000','-b:a','128k','-c:v','h264','-profile:v','main',
        '-crf','20','-g','48','-keyint_min','48','-sc_threshold','0','-b:v','2500k','-maxrate','2675k','-bufsize',
        '3750k','-hls_time','4','-hls_playlist_type','vod','-hls_segment_filename',`${newDir}/360p_%03d.ts`, `${newDir}/360p.m3u8`,

    ];
    var proc = spawn(ffmpegCmd, args);
  
    proc.stdout.on("data", function (data) {
      console.log(data);
    });
  
    proc.stderr.setEncoding("utf8");
    proc.stderr.on("data", function (data) {
      eventEmitter.emit('conversionFailed',data);
    });
  
    proc.on("close", function () {
        eventEmitter.emit('conversionSuccess',`${newDir}`);
    });
};

//ffmpeg -y -i movie.avi -an -c:v libx264 -x264opts 'keyint=24:min-keyint=24:no-scenecut' -b:v 1500k -maxrate 1500k -bufsize 3000k -vf "scale=-1:720" movie-720.mp4
//ffmpeg -y -i movie.avi -an -c:v libx264 -x264opts 'keyint=24:min-keyint=24:no-scenecut' -b:v 800k -maxrate 800k -bufsize 1600k -vf "scale=-1:540" movie-540.mp4
//ffmpeg -y -i movie.avi -an -c:v libx264 -x264opts 'keyint=24:min-keyint=24:no-scenecut' -b:v 400k -maxrate 400k -bufsize 800k -vf "scale=-1:360" movie-360.mp4
const handleVideoConversion = async (path) => { 
  convertToHLS(path);
};
