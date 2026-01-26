import { NextResponse } from "next/server";
import { adminDb, adminMessaging } from "@/lib/firebase-admin";

export async function POST(req: Request) {
  try {
    const { password, title, body, image, link } = await req.json();

    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

    if (password !== adminPassword) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!title || !body) {
      return NextResponse.json({ error: "Missing title or body" }, { status: 400 });
    }

    // Fetch all users with notifications enabled
    const usersSnapshot = await adminDb.collection("users").get();
    
    let tokens: string[] = [];
    
    usersSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.fcmTokens && Array.isArray(data.fcmTokens) && data.fcmTokens.length > 0) {
        // You might want to filter for notificationsEnabled !== false
        // assuming true by default if tokens exist
        tokens.push(...data.fcmTokens);
      }
    });

    // Deduplicate tokens
    tokens = [...new Set(tokens)];

    if (tokens.length === 0) {
      return NextResponse.json({ message: "No users to send to" });
    }

    // Send messages in batches of 500
    const batchSize = 500;
    const batches = [];
    
    for (let i = 0; i < tokens.length; i += batchSize) {
      const batchTokens = tokens.slice(i, i + batchSize);
      
      const message: any = {
        notification: {
          title,
          body,
        },
        data: {
          click_action: link || "/feed",
          url: link || "/feed",
        },
        tokens: batchTokens,
      };

      if (image) {
        message.notification.imageUrl = image;
      }

      batches.push(adminMessaging.sendEachForMulticast(message));
    }

    const results = await Promise.all(batches);
    
    let successCount = 0;
    let failureCount = 0;

    results.forEach((result) => {
      successCount += result.successCount;
      failureCount += result.failureCount;
    });

    return NextResponse.json({ 
      success: true, 
      sent: successCount, 
      failed: failureCount,
      total: tokens.length 
    });

  } catch (error: any) {
    console.error("Push notification error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" }, 
      { status: 500 }
    );
  }
}
