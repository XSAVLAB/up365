const fs = require("fs");
const path = require("path");

// Read the cricketMatches.json file
const dataFilePath = path.join(__dirname, "");
const cricketMatchesData = JSON.parse(fs.readFileSync(dataFilePath, "utf-8"));

// Function to seed the data into the database (replace this with your actual seeding logic)
function seedData() {
  // Example: Loop through each match and insert into the database
  cricketMatchesData.forEach((match) => {
    // Your database insertion logic goes here
    console.log("Seeding match:", match.titletwo);
  });
}

// Call the seedData function to initiate the seeding process
seedData();
