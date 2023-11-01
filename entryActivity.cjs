const endPoint = 'endPoint';
const topic = 'topic'
const AWS = require('aws-sdk');
const region = 'region';
const qos = 1;
let lpCounter = 1;
const numOfAcivities = 5;
const delaySendActivity = 1000;
const publishMqttMessage = (endPoint, topic, qos) => {
const lpNum = `TEST00${lpCounter++}`;
const timeStamp = Date.now();

  const payLoad = {
    meta: {
      event_time: timeStamp
    },
    data: {
      data: lpNum,
      data2: lpNum,
      event_time: timeStamp,
      activity_id: `activity${timeStamp}`,
    }
  };

  AWS.config.update({ region: region });

  const iotdata = new AWS.IotData({ endpoint: endPoint });

  const params = {
    topic: topic,
    payload: JSON.stringify(payLoad),
    qos: qos 
  };

  iotdata.publish(params, function(err, data) {
    if (err) {
      console.log('Error sending message:', err);
    } else {
      console.log('Message sent successfully:', data);
    };
  });
};

for (let i = 0; i < numOfAcivities; i++) {
  setTimeout(() => {
    publishMqttMessage(endPoint, topic, qos);
  }, i * delaySendActivity);
};