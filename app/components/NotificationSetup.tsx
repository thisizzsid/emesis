"use client";

import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import {
  getMessaging,
  getToken,
  onMessage,
  isSupported,
} from "firebase/messaging";
import { db } from "@/firebase";
import { doc, updateDoc, arrayUnion, getDoc } from "firebase/firestore";

export function useNotifications() {
  const [notificationEnabled, setNotificationEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();

  useEffect(() => {
    const setupNotifications = async () => {
      try {
        // Check if notifications are supported
        const supported = await isSupported();
        if (!supported) {
          console.log("❌ Notifications not supported");
          setLoading(false);
          return;
        }

        // Check if user is logged in
        if (!auth.currentUser) {
          setLoading(false);
          return;
        }

        // Check if notifications are already set up
        const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
        const user = userDoc.data();

        if (user?.notificationsEnabled === false) {
          setLoading(false);
          return;
        }

        // Register service worker
        if ("serviceWorker" in navigator) {
          navigator.serviceWorker.register("/firebase-messaging-sw.js");
        }

        // Request notification permission
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          const messaging = getMessaging();
          const token = await getToken(messaging, {
            vapidKey:
              "BPqL1h2N3v4R5t6U7w8X9y0Z1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0",
          });

          if (token) {
            // Save token to Firestore
            await updateDoc(doc(db, "users", auth.currentUser.uid), {
              fcmTokens: arrayUnion(token),
              notificationsEnabled: true,
            });

            console.log("✅ Notifications enabled with token:", token);
            setNotificationEnabled(true);

            // Listen for foreground messages
            onMessage(messaging, (payload) => {
              console.log("📬 Foreground message:", payload);

              // Show custom notification
              if (Notification.permission === "granted") {
                new Notification(payload.notification?.title || "EMESIS", {
                  body: payload.notification?.body,
                  icon: "/logoemesis.png",
                  badge: "/logoemesis.png",
                  tag: payload.data?.type || "notification",
                  data: payload.data,
                });
              }
            });
          }
        } else {
          console.log("⚠️ Notification permission denied");
        }

        setLoading(false);
      } catch (error) {
        console.error("❌ Error setting up notifications:", error);
        setLoading(false);
      }
    };

    setupNotifications();
  }, [auth.currentUser]);

  return { notificationEnabled, loading };
}

export default function NotificationSetup() {
  const { notificationEnabled, loading } = useNotifications();

  if (loading) return null;

  return (
    <div>
      {notificationEnabled ? (
        <p style={{ color: "#4ade80", fontSize: "0.8em" }}>
          ✅ Push notifications enabled
        </p>
      ) : (
        <p style={{ color: "#fbbf24", fontSize: "0.8em" }}>
          📱 Allow notifications to get bot updates
        </p>
      )}
    </div>
  );
}
