const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');

admin.initializeApp();
const db = admin.firestore();

exports.refreshMatchData = functions.pubsub.schedule('every 15 minutes').onRun(async (context) => {
  try {
    const response = await axios.get('https://api.cricapi.com/v1/cricScore?apikey=YOUR_API_KEY');
    const data = response.data.data;

    const batch = db.batch();
    const matchDataRef = db.collection('matchData');

    data.forEach((match) => {
      const docRef = matchDataRef.doc(match.id.toString());
      batch.set(docRef, match);
    });

    await batch.commit();
    console.log('Match data refreshed successfully');
  } catch (error) {
    console.error('Error refreshing match data:', error);
  }
});
