import EntityCricket from "../../lib/index";

export default async function handler(req, res) {
  const cricketAPI = new EntityCricket({
    api_token: process.env.ENTITYSPORT_API_KEY,
    token_expires: Math.floor(Date.now() / 1000) + 3600,
  });

  try {
    const { type, matchId } = req.query;

    let data;
    switch (type) {
      case "seasons":
        data = await cricketAPI.cricket.getSeasons();
        break;
      case "competitions":
        data = await cricketAPI.cricket.getCompetitions();
        break;
      case "matches":
        data = await cricketAPI.cricket.getMatches();
        break;
      case "scorecard":
        if (!matchId) {
          return res.status(400).json({ error: "matchId is required" });
        }
        data = await cricketAPI.cricket.getMatchScorecard(matchId);
        break;
      case "odds":
        if (!matchId) {
          return res.status(400).json({ error: "matchId is required" });
        }
        data = await cricketAPI.cricket.getMatchOdds(matchId);
        break;
      default:
        return res.status(400).json({ error: "Invalid type" });
    }

    res.status(200).json(data);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: error.message });
  }
}
