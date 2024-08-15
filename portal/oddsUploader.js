import admin from "firebase-admin";
import axios from "axios";
import serviceAccount from "./secret_key.json" assert { type: "json" };

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// Function to get available sports
async function getAvailableSports(apiKey) {
  const url = `https://api.the-odds-api.com/v4/sports?apiKey=${apiKey}`;
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error(`Failed to get sports: ${error.response.status}`);
    return null;
  }
}

// Function to get odds for a specific sport with pagination
async function getAllSportOdds(
  apiKey,
  sportKey,
  regions = "uk",
  markets = "h2h",
  oddsFormat = "decimal"
) {
  let oddsData = [];
  let url = `https://api.the-odds-api.com/v4/sports/${sportKey}/odds`;
  let params = {
    apiKey: apiKey,
    regions: regions,
    markets: markets,
    oddsFormat: oddsFormat,
  };

  while (url) {
    try {
      const response = await axios.get(url, { params });
      oddsData = oddsData.concat(response.data);
      // Check if there's a 'next' link for pagination
      if (
        response.headers.link &&
        response.headers.link.includes('rel="next"')
      ) {
        const nextLink = response.headers.link.match(/<([^>]+)>;\s*rel="next"/);
        url = nextLink ? nextLink[1] : null;
      } else {
        url = null;
      }
    } catch (error) {
      console.error(`Failed to get odds: ${error.response.status}`);
      break;
    }
  }
  return oddsData;
}

// Function to store odds data in Firestore filtered by sport_title
async function storeOddsInFirestore(odds, collectionName) {
  if (odds.length === 0) {
    console.log(`No data found for ${collectionName}`);
    return;
  }

  const batch = db.batch();
  odds.forEach((oddsItem, index) => {
    const docRef = db.collection(collectionName).doc(`match_${index + 1}`);
    batch.set(docRef, oddsItem);
  });

  await batch.commit();
  console.log(
    `Odds data stored successfully in Firestore under ${collectionName} collection`
  );
}

// Your API key
const apiKey = "f8e5dd07c05bb087fa079e5413d46e13";

// Main function to fetch and store odds data
async function updateOddsData() {
  try {
    // Get available sports
    const sports = await getAvailableSports(apiKey);
    if (sports) {
      console.log("Available Sports:");
      sports.forEach((sport) => {
        console.log(` - ${sport.title} (${sport.key})`);
      });
    }

    // Get odds for a specific sport (Cricket)
    const sportKey = "cricket";
    const odds = await getAllSportOdds(apiKey, sportKey);
    if (odds.length > 0) {
      console.log(`\nOdds for ${sportKey}:`);
      console.log(JSON.stringify(odds, null, 2));

      // Store odds data in Firestore under the 'oddsCricket' collection
      await storeOddsInFirestore(odds, "oddsCricket");
    }

    // Optionally, save the odds to a JSON file
    const fs = await import("fs");
    fs.writeFileSync("cricket_odds.json", JSON.stringify(odds, null, 2));
    console.log(
      "\nOdds data saved to cricket_odds.json in the current directory"
    );
  } catch (error) {
    console.error("Error updating odds data:", error);
  }
}

updateOddsData();
