import admin from "firebase-admin";
import axios from "axios";
import serviceAccount from "./secret_key.json" assert { type: "json" };

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

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
    const seriesDocRef = db.collection("cricketData").doc(seriesName);
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
