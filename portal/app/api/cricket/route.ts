import { NextResponse } from "next/server";
import EntityCricket from "../../../lib/index";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

const db = getFirestore();

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const matchId = searchParams.get("matchId");

    if (!matchId) {
      return NextResponse.json({ error: "matchId is required" }, { status: 400 });
    }

    const cricketAPI = new EntityCricket({
      api_token: process.env.ENTITYSPORT_API_KEY,
      token_expires: Math.floor(Date.now() / 1000) + 3600,
    });

    if (!cricketAPI?.cricket) {
      return NextResponse.json(
        { error: "Cricket API is not initialized" },
        { status: 500 }
      );
    }

  
    const oddsData = await cricketAPI.cricket.get_match_odds(matchId);

    await db.collection("cricket_odds").doc(matchId).set({
      oddsData,
      createdAt: new Date(),
    });

    await new Promise((resolve) => setTimeout(resolve, 3000));

    return NextResponse.json({ success: true, data: oddsData }, { status: 200 });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
