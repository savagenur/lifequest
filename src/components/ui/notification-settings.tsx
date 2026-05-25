"use client";

import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Bell, BellOff, Loader2 } from "lucide-react";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function NotificationSettings() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [permission, setPermission] = useState<NotificationPermission>("default");

  const { data: subscription, refetch } = trpc.notification.getSubscription.useQuery();
  const subscribeMutation = trpc.notification.subscribe.useMutation({
    onSuccess: () => {
      setIsSubscribed(true);
      refetch();
    },
  });
  const unsubscribeMutation = trpc.notification.unsubscribe.useMutation({
    onSuccess: () => {
      setIsSubscribed(false);
      refetch();
    },
  });

  useEffect(() => {
    const checkSupport = async () => {
      const supported = "serviceWorker" in navigator && "PushManager" in window;
      setIsSupported(supported);

      if (supported) {
        setPermission(Notification.permission);
        
        try {
          const registration = await navigator.serviceWorker.ready;
          const existingSub = await registration.pushManager.getSubscription();
          setIsSubscribed(!!existingSub && !!subscription);
        } catch {
          setIsSubscribed(false);
        }
      }
      setIsLoading(false);
    };

    checkSupport();
  }, [subscription]);

  const handleToggle = async () => {
    if (!isSupported) return;

    setIsLoading(true);

    try {
      if (isSubscribed) {
        const registration = await navigator.serviceWorker.ready;
        const existingSub = await registration.pushManager.getSubscription();
        if (existingSub) {
          await existingSub.unsubscribe();
          await unsubscribeMutation.mutateAsync({ endpoint: existingSub.endpoint });
        }
      } else {
        const perm = await Notification.requestPermission();
        setPermission(perm);

        if (perm === "granted") {
          const registration = await navigator.serviceWorker.ready;
          
          const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
          if (!vapidKey) {
            console.error("VAPID public key not configured");
            setIsLoading(false);
            return;
          }

          const sub = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(vapidKey) as BufferSource,
          });

          const subJson = sub.toJSON();
          if (subJson.endpoint && subJson.keys?.p256dh && subJson.keys?.auth) {
            await subscribeMutation.mutateAsync({
              endpoint: subJson.endpoint,
              p256dh: subJson.keys.p256dh,
              auth: subJson.keys.auth,
            });
          }
        }
      }
    } catch (error) {
      console.error("Error toggling notifications:", error);
    }

    setIsLoading(false);
  };

  if (!isSupported) {
    return (
      <div className="flex items-center gap-3 p-4">
        <BellOff className="w-5 h-5 text-text-muted" />
        <div className="flex-1">
          <span className="text-text-primary">Push Notifications</span>
          <p className="text-xs text-text-muted">Not supported in this browser</p>
        </div>
      </div>
    );
  }

  if (permission === "denied") {
    return (
      <div className="flex items-center gap-3 p-4">
        <BellOff className="w-5 h-5 text-error" />
        <div className="flex-1">
          <span className="text-text-primary">Push Notifications</span>
          <p className="text-xs text-error">Blocked - enable in browser settings</p>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className="w-full flex items-center gap-3 p-4 text-left hover:bg-surface-hover transition-colors disabled:opacity-50"
    >
      {isLoading ? (
        <Loader2 className="w-5 h-5 text-primary animate-spin" />
      ) : isSubscribed ? (
        <Bell className="w-5 h-5 text-primary" />
      ) : (
        <BellOff className="w-5 h-5 text-text-muted" />
      )}
      <div className="flex-1">
        <span className="text-text-primary">Push Notifications</span>
        <p className="text-xs text-text-muted">
          {isSubscribed ? "Enabled - get streak reminders" : "Enable to get streak reminders"}
        </p>
      </div>
      <div
        className={`w-11 h-6 rounded-full transition-colors relative ${
          isSubscribed ? "bg-primary" : "bg-surface-secondary"
        }`}
      >
        <div
          className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
            isSubscribed ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </div>
    </button>
  );
}
