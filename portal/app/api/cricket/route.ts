import { NextResponse } from "next/server";
import EntityCricket from "../../../lib/index";

export async function GET(req: { url: string | URL; }) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const matchId = searchParams.get("matchId");

  const cricketAPI = new EntityCricket({
    api_token: process.env.ENTITYSPORT_API_KEY,
    token_expires: Math.floor(Date.now() / 1000) + 3600,
  });

  try {
    let data;

    if (!cricketAPI.cricket) {
      return NextResponse.json({ error: "Cricket API is not initialized" }, { status: 500 });
    }

    switch (type) {
      case "seasons":
        data = await cricketAPI.cricket.get_seasons_data();
        break;
      case "competitions":
        data = await cricketAPI.cricket.get_competitions_data();
        break;
      case "matches":
        data = await cricketAPI.cricket.get_matches_data();
        break;
      case "scorecard":
        if (!matchId) {
          return NextResponse.json(
            { error: "matchId is required" },
            { status: 400 }
          );
        }
        data = await cricketAPI.cricket.get_matches_scorecard(matchId);
        break;
      case "match_odds":
        if (!matchId) {
          return NextResponse.json(
            { error: "matchId is required" },
            { status: 400 }
          );
        }
        data = await cricketAPI.cricket.get_match_odds(matchId);
        break;
      default:
        return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}