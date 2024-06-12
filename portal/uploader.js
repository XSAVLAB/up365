import admin from "firebase-admin";
import axios from "axios";
import serviceAccount from "./secret_key.json" assert { type: "json" };

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// async function fetchAndStoreMatchData() {
//   try {
//     const response = await axios.get(
//       "https://api.cricapi.com/v1/cricScore?apikey=30003ac7-c7ef-4828-bcce-4a461e26902d"
//     );
//     const data = response.data.data;

//     const batch = db.batch();
//     const matchDataRef = db.collection("matchData");

//     data.forEach((match) => {
//       const docRef = matchDataRef.doc(match.id.toString());
//       batch.set(docRef, match);
//     });

//     await batch.commit();
//     console.log("Match data updated successfully");
//   } catch (error) {
//     console.error("Error updating match data:", error);
//   }
// }

// fetchAndStoreMatchData();

// Function to fetch cricket data from the API
async function fetchCricketData() {
  const API_KEY = "2dc77f32-82dc-4048-9b54-50baa8ab8ef8";
  const url = `https://api.cricapi.com/v1/cricScore?apikey=${API_KEY}`;
  try {
    const response = await axios.get(url);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching cricket data:", error);
    throw error;
  }
}

// Function to group matches by series
function groupMatchesBySeries(matches) {
  return matches.reduce((acc, match) => {
    const seriesName = match.series;
    if (!acc[seriesName]) {
      acc[seriesName] = [];
    }
    acc[seriesName].push(match);
    return acc;
  }, {});
}

// Function to store matches in Firestore
async function storeMatchesInFirestore(seriesMatches) {
  const batch = db.batch();
  for (const [seriesName, matches] of Object.entries(seriesMatches)) {
    const seriesDocRef = db.collection("cricketDataNew").doc(seriesName);
    batch.set(seriesDocRef, { matches }, { merge: true });
  }
  await batch.commit();
  console.log("Matches stored in Firestore successfully");
}

async function updateMatches() {
  try {
    const matches = await fetchCricketData();
    const seriesMatches = groupMatchesBySeries(matches);
    await storeMatchesInFirestore(seriesMatches);
  } catch (error) {
    console.error("Error updating matches:", error);
  }
}

updateMatches();
