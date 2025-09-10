import type { Editor } from "baklavajs";

export const allEditorsNeedingDerivedNodes = new Set<WeakRef<Editor>>();
