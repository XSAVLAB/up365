import admin from "firebase-admin";
import axios from "axios";
import serviceAccount from "./secret_key.json" assert { type: "json" };

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// Fetch cricket data from the API
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

// Group cricket matches by series
function groupMatchesBySeries(matches) {
  return matches.reduce((acc, match) => {
    const seriesName = match.series
      .replace(/[^\w\s]/gi, "")
      .replace(/\s+/g, "_"); // Replace invalid characters
    if (!seriesName) {
      console.error("Invalid series name:", match.series);
      return acc;
    }
    if (!acc[seriesName]) {
      acc[seriesName] = [];
    }
    acc[seriesName].push(match);
    return acc;
  }, {});
}

// Store cricket matches in Firestore
async function storeCricketMatchesInFirestore(seriesMatches) {
  const batch = db.batch();
  for (const [seriesName, matches] of Object.entries(seriesMatches)) {
    const seriesDocRef = db.collection("cricketData").doc(seriesName);
    batch.set(seriesDocRef, { matches }, { merge: true });
  }
  await batch.commit();
  console.log("Cricket matches stored in Firestore successfully");
}

// Fetch FIFA World Cup Qualifying data from the API
async function fetchFootball1Data() {
  const API_KEY = "55e69f1de8854bf3990a08e105adb700";
  const competitionId = 2000; // Replace with actual competition ID for FIFA World Cup Qualifying
  const url = `https://api.football1-data.org/v4/competitions/${competitionId}/matches`;
  try {
    const response = await axios.get(url, {
      headers: { "X-Auth-Token": API_KEY },
    });
    return response.data.matches;
  } catch (error) {
    console.error("Error fetching FIFA World Cup Qualifying data:", error);
    throw error;
  }
}

// Store football1 matches in Firestore
async function storeFootball1MatchesInFirestore(matches) {
  const batch = db.batch();
  const docRef = db.collection("football1Data").doc("FIFAWorldCupQualifying");
  batch.set(docRef, { matches }, { merge: true });
  await batch.commit();
  console.log("Football1 matches stored in Firestore successfully");
}

// Main function to update both cricket and football1 data
async function updateMatches() {
  try {
    // Update cricket matches
    const cricketMatches = await fetchCricketData();
    const seriesMatches = groupMatchesBySeries(cricketMatches);
    await storeCricketMatchesInFirestore(seriesMatches);

    // Update football1 matches
    const football1Matches = await fetchFootball1Data();
    await storeFootball1MatchesInFirestore(football1Matches);
  } catch (error) {
    console.error("Error updating matches:", error);
  }
}

updateMatches();
