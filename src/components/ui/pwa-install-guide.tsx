"use client";

import { useState, useEffect, useRef } from "react";
import { Smartphone, X, Share, MoreVertical, Plus, Download } from "lucide-react";

type DeviceType = "ios" | "android" | "desktop" | "unknown";

function getDeviceType(): DeviceType {
  if (typeof window === "undefined") return "unknown";
  
  const userAgent = navigator.userAgent.toLowerCase();
  const isIOS = /iphone|ipad|ipod/.test(userAgent) || 
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isAndroid = /android/.test(userAgent);
  
  if (isIOS) return "ios";
  if (isAndroid) return "android";
  return "desktop";
}

function getIsStandalone(): boolean {
  if (typeof window === "undefined") return false;
  
  return window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
}

export function PWAInstallGuide() {
  const [showModal, setShowModal] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [device, setDevice] = useState<DeviceType>("unknown");
  const [isInstalled, setIsInstalled] = useState(false);
  const hasReadData = useRef(false);

  useEffect(() => {
    // Read browser APIs only once after mount to avoid hydration mismatch
    // Use setTimeout to make setState asynchronous and satisfy React Compiler
    if (!hasReadData.current) {
      hasReadData.current = true;
      setTimeout(() => {
        setDevice(getDeviceType());
        setIsInstalled(getIsStandalone());
        setIsMounted(true);
      }, 0);
    }
  }, []);

  // Don't render button if already installed
  if (isMounted && isInstalled) {
    return null;
  }

  // Don't render button on server (will render on client after mount)
  if (!isMounted) {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-surface-hover transition-colors"
      >
        <Smartphone className="w-5 h-5 text-text-muted" />
        <div className="flex-1">
          <span className="text-text-primary">Install App</span>
          <p className="text-xs text-text-muted">Add LifeQuest to your home screen</p>
        </div>
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-xl w-full max-w-md max-h-[85vh] overflow-y-auto">
            <div className="sticky top-0 bg-surface flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-semibold text-text-primary text-lg">
                Install LifeQuest
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-hover"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <p className="text-text-secondary text-sm">
                Install LifeQuest as an app for quick access and a better experience!
              </p>

              {device === "ios" && <IOSInstructions />}
              {device === "android" && <AndroidInstructions />}
              {device === "desktop" && <DesktopInstructions />}
              {device === "unknown" && (
                <div className="space-y-4">
                  <IOSInstructions />
                  <div className="border-t border-border pt-4">
                    <AndroidInstructions />
                  </div>
                </div>
              )}

              <button
                onClick={() => setShowModal(false)}
                className="w-full px-4 py-3 rounded-lg border border-border text-text-secondary hover:bg-surface-hover transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function IOSInstructions() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-text-primary font-medium">
        <span className="text-lg">🍎</span>
        <span>iPhone / iPad</span>
      </div>
      
      <div className="space-y-3 text-sm">
        <Step number={1}>
          <span>Tap the </span>
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-surface-secondary rounded">
            <Share className="w-4 h-4" />
            <span className="font-medium">Share</span>
          </span>
          <span> button at the bottom of Safari</span>
        </Step>
        
        <Step number={2}>
          <span>Scroll down and tap </span>
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-surface-secondary rounded">
            <Plus className="w-4 h-4" />
            <span className="font-medium">Add to Home Screen</span>
          </span>
        </Step>
        
        <Step number={3}>
          <span>Tap </span>
          <span className="font-medium text-primary">Add</span>
          <span> in the top right corner</span>
        </Step>
      </div>

      <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
        <p className="text-xs text-amber-600 dark:text-amber-400">
          <strong>Note:</strong> This only works in Safari. If you&apos;re using another browser, please open this page in Safari first.
        </p>
      </div>
    </div>
  );
}

function AndroidInstructions() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-text-primary font-medium">
        <span className="text-lg">🤖</span>
        <span>Android</span>
      </div>
      
      <div className="space-y-3 text-sm">
        <Step number={1}>
          <span>Tap the </span>
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-surface-secondary rounded">
            <MoreVertical className="w-4 h-4" />
            <span className="font-medium">Menu</span>
          </span>
          <span> button (three dots) in Chrome</span>
        </Step>
        
        <Step number={2}>
          <span>Tap </span>
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-surface-secondary rounded">
            <Download className="w-4 h-4" />
            <span className="font-medium">Install app</span>
          </span>
          <span> or </span>
          <span className="font-medium">Add to Home screen</span>
        </Step>
        
        <Step number={3}>
          <span>Tap </span>
          <span className="font-medium text-primary">Install</span>
          <span> to confirm</span>
        </Step>
      </div>

      <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <p className="text-xs text-blue-600 dark:text-blue-400">
          <strong>Tip:</strong> You might see an &quot;Install&quot; banner at the bottom of the screen. Tap it for a quick install!
        </p>
      </div>
    </div>
  );
}

function DesktopInstructions() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-text-primary font-medium">
        <span className="text-lg">💻</span>
        <span>Desktop (Chrome/Edge)</span>
      </div>
      
      <div className="space-y-3 text-sm">
        <Step number={1}>
          <span>Look for the </span>
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-surface-secondary rounded">
            <Download className="w-4 h-4" />
            <span className="font-medium">Install</span>
          </span>
          <span> icon in the address bar</span>
        </Step>
        
        <Step number={2}>
          <span>Click it and then click </span>
          <span className="font-medium text-primary">Install</span>
        </Step>
      </div>

      <div className="p-3 bg-surface-secondary rounded-lg">
        <p className="text-xs text-text-muted">
          For the best mobile experience, open this page on your phone!
        </p>
      </div>
    </div>
  );
}

function Step({ number, children }: { number: number; children: React.ReactNode }) {
  return (
    <div className="flex gap-3 text-text-secondary">
      <span className="shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary font-semibold text-xs flex items-center justify-center">
        {number}
      </span>
      <p className="pt-0.5">{children}</p>
    </div>
  );
}
