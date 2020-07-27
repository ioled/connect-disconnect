let config = {
  projectId: process.env.GCLOUD_PROJECT,
};

// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require("firebase-functions");

// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require("firebase-admin");

admin.initializeApp({
  config,
});

const db = admin.firestore();

const devicesRef = db.collection("devices");
/**
 * Receive data from pubsub, then
 * write telemetry raw data to bigquery
 */
exports.checkDeviceOnline = functions.pubsub
  .topic("connect-disconnect")
  .onPublish((message) => {
    const logEntry = JSON.parse(Buffer.from(message.data, 'base64').toString());
    const deviceId = logEntry.labels.device_id;

    console.log({deviceId: deviceId});

    let online;
    let config;
    switch (logEntry.jsonPayload.eventType) {
      case 'CONNECT':
        online = true;
        console.log({online: online});
        config = {
          online: online
        }
        break;
      case 'DISCONNECT':
        online = false;
        console.log({online: online});
        config = {
          online: online
        }
        break;
      default:
        throw new Error('Invalid message type');
    }

    return Promise.all([updateDeviceDB(deviceId, config)]); 
  });


/**
 * @CristianValdivia
 * Update the config of device
 * @description Update config of device in Firestore
 * @param  {object} req Request
 * @param  {object} res Response
 * @param  {Function} next Callback function
 */
async function updateDeviceDB (id, config){
  try {
    await devicesRef
      .where("deviceID", "==", id)
      .get()
      .then(function (querySnapshot) {
        querySnapshot.forEach(function (doc) {
          devicesRef.doc(doc.id).update(config);
        });
      });
    console.log("[Firestore Service] [updateDeviceDB] Update config:", config);
  } catch (error) {
    console.log(
      "[Firestore Service] [updateDeviceDB] [Error] There was an error update config",
      error
    );
    throw new Error(error);
  }
};

