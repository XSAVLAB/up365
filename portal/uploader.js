import admin from "firebase-admin";
import { join, dirname } from "path";
import { readdir } from "fs/promises";
import { createRequire } from "module";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const serviceAccount = require("./secret_key.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const firestore = admin.firestore();
const directoryPath = join(__dirname, "seeds");

async function uploadFiles() {
  try {
    const files = await readdir(directoryPath);
    for (const file of files) {
      if (file.endsWith(".json")) {
        const lastDotIndex = file.lastIndexOf(".");
        const collectionName = file.substring(0, lastDotIndex);
        const menu = require(`./seeds/${file}`);

        for (const obj of menu) {
          console.log(`Processing object: ${JSON.stringify(obj)}`);

          try {
            await firestore.collection(collectionName).add(obj);
            console.log(`Document written in collection "${collectionName}"`);
          } catch (error) {
            console.error(`Error writing document:`, error);
          }
        }
      } else {
        console.log(`Skipping non-JSON file: ${file}`);
      }
    }
  } catch (error) {
    console.error("Error scanning directory or adding document:", error);
  }
}

uploadFiles();
