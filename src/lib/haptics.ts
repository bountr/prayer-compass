/**
 * Dokunsal geri bildirim — yalnızca native platformda.
 * - Kıble hizalanması ilk kez sağlandığında tek kısa titreşim.
 * - Zikir sayacında her artışta hafif, hedefe ulaşınca belirgin titreşim.
 */
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import { isNative } from "@/lib/native";

async function impact(style: ImpactStyle) {
  if (!isNative()) return;
  try {
    await Haptics.impact({ style });
  } catch {
    /* cihaz desteklemiyorsa sessizce geç */
  }
}

export async function alignmentHaptic() {
  await impact(ImpactStyle.Light);
}

/** Zikir sayacında her dokunuş. */
export async function countHaptic() {
  await impact(ImpactStyle.Light);
}

/** Hedefe ulaşıldığında. */
export async function targetHaptic() {
  await impact(ImpactStyle.Heavy);
}
