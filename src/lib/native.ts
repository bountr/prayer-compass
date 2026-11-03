/**
 * Native platform algılamanın TEK noktası.
 * Uygulamanın başka hiçbir yeri `window.Capacitor` gibi kırılgan çalışma-anı
 * tahminleri yapmaz; resmi `@capacitor/core` API'si kullanılır.
 */
import { Capacitor } from "@capacitor/core";

export type NativePlatform = "ios" | "android" | "web";

export function isNative(): boolean {
  try {
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
}

export function nativePlatform(): NativePlatform {
  try {
    const name = Capacitor.getPlatform();
    if (name === "ios" || name === "android") return name;
  } catch {
    /* SSR / tarayıcı */
  }
  return "web";
}

export function isAndroid() {
  return nativePlatform() === "android";
}

export function isIOS() {
  return nativePlatform() === "ios";
}
