// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyCljWSzB-Nzflfd8Pp3Y9OuvMZH9iDdGdI",
    authDomain: "up365-d9e54.firebaseapp.com",
    projectId: "up365-d9e54",
    storageBucket: "up365-d9e54.appspot.com",
    messagingSenderId: "768633978530",
    appId: "1:768633978530:web:8e90112b03efbd666821fb",
    measurementId: "G-NS1KBRCXX9"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };
