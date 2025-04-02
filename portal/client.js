import axios from "axios";
import "dotenv/config";

const baseURL = `https://rest.entitysport.com/exchange/competitions/129413/matches?token=${process.env.ENTITYSPORT_API_KEY}`;

const client = axios.create({
  baseURL,
  timeout: 10000,
});

export default client;