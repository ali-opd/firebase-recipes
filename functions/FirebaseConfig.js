const functions = require('firebase-functions');
const admin = require('firebase-admin');

const FIREBASE_STORAGE_BUCKET = 'fir-recipes-4f6ea.appspot.com';

const apiFirebaseOptions = {
  ...functions.config().firebase,
  credential: admin.credential.applicationDefault()
};

admin.initializeApp(apiFirebaseOptions);

const firestore = admin.firestore();
const settings = { timeStampsInSnapshot: true };
firestore.settings(settings);

const storageBucket = admin.storage().bucket(FIREBASE_STORAGE_BUCKET);
const auth = admin.auth();

module.exports = {
  functions,
  auth,
  firestore,
  storageBucket,
  admin
};
