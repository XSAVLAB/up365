import admin from "firebase-admin";
import axios from "axios";
import serviceAccount from "./secret_key.json" assert { type: "json" };

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function fetchAndStoreMatchData() {
  try {
    const response = await axios.get(
      "https://api.cricapi.com/v1/cricScore?apikey=30003ac7-c7ef-4828-bcce-4a461e26902d"
    );
    const data = response.data.data;

    const batch = db.batch();
    const matchDataRef = db.collection("matchData");

    data.forEach((match) => {
      const docRef = matchDataRef.doc(match.id.toString());
      batch.set(docRef, match);
    });

    await batch.commit();
    console.log("Match data updated successfully");
  } catch (error) {
    console.error("Error updating match data:", error);
  }
}

fetchAndStoreMatchData();
