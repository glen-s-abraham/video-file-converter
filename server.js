const fs = require("fs");
const amqplib = require("amqplib/callback_api");



let amqpChannel;
let VIDEO_PUB_Q = "videopublished";
amqplib.connect("amqp://admin:password@localhost:5672", (err, conn) => {
  if (err) throw err;
  if (!conn) console.log("Not connected to rabbitmq");
  else
    conn.createChannel((err, ch) => {
      if (err) throw new err();
      amqpChannel = ch;
      if (amqpChannel) {
        amqpChannel.assertQueue(VIDEO_PUB_Q);
        amqpChannel.consume(VIDEO_PUB_Q, (data) =>
          handleVideoConversion(data.content.toString()),{
              noAck:true
          }
        );
      }
    });
});


const handleVideoConversion = (path)=>{
    console.log(path)
}