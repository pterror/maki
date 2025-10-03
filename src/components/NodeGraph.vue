<script setup lang="ts">
import "@baklavajs/themes/dist/syrup-dark.css";
import { BaklavaEditor, Components } from "baklavajs";
import { useFullBaklava } from "../lib/nodes/fullWeb";
import {
  computed,
  nextTick,
  onMounted,
  onUnmounted,
  useTemplateRef,
} from "vue";
import { debounce } from "../lib/debounce";
import BaklavaNodeInterface from "./BaklavaNodeInterface.vue";
import { ellipsis } from "../lib/string";
import { escapeCssIdentifier } from "../lib/css";
import BaklavaNodePalette from "./BaklavaNodePalette.vue";
import { allInterfaceTypeNames } from "../lib/nodes/interfaceTypes";
import { hashString } from "../lib/hash";

const { Node: BaklavaNode } = Components;

const { baklava, promise } = useFullBaklava();
baklava.settings.displayValueOnHover = true;
baklava.settings.sidebar.enabled = false;
baklava.settings.nodes.defaultWidth = 440;
const token = Symbol();
const editorRef = useTemplateRef("editorRef");

function saveRaw() {
  localStorage.setItem("maki-graph", JSON.stringify(baklava.editor.save()));
}

const save = debounce(saveRaw, 1000);

onMounted(() => {
  promise.then(() => {
    const value = localStorage.getItem("maki-graph");
    if (!value) return;
    const warnings = baklava.editor.load(JSON.parse(value));
    if (warnings.length) {
      console.warn("Warnings while loading graph:", warnings);
    }
  });

  window.addEventListener("beforeunload", saveRaw);

  baklava.editor.graphEvents.addNode.subscribe(token, save);
  baklava.editor.graphEvents.removeNode.subscribe(token, save);
  baklava.editor.graphEvents.addConnection.subscribe(token, save);
  baklava.editor.graphEvents.removeConnection.subscribe(token, save);
  baklava.editor.nodeEvents.addInput.subscribe(token, save);
  baklava.editor.nodeEvents.removeInput.subscribe(token, save);
  baklava.editor.nodeEvents.addOutput.subscribe(token, save);
  baklava.editor.nodeEvents.removeOutput.subscribe(token, save);

  const observer = new MutationObserver((changes) => {
    const didChange = changes.some(
      (i) =>
        i.attributeName === "class" &&
        i.target instanceof Element &&
        i.target?.classList.contains("baklava-node"),
    );
    if (didChange) {
      // --dragging class will change on move, so we update graph on class change
      nextTick(save);
    }
  });
  const containerElement =
    editorRef.value?.$el.querySelector(".node-container");
  if (containerElement) {
    observer.observe(containerElement, { attributes: true, subtree: true });
  }
});

onUnmounted(() => {
  window.removeEventListener("beforeunload", saveRaw);

  baklava.editor.graphEvents.addNode.unsubscribe(token);
  baklava.editor.graphEvents.removeNode.unsubscribe(token);
  baklava.editor.graphEvents.addConnection.unsubscribe(token);
  baklava.editor.graphEvents.removeConnection.unsubscribe(token);
  baklava.editor.nodeEvents.addInput.unsubscribe(token);
  baklava.editor.nodeEvents.removeInput.unsubscribe(token);
  baklava.editor.nodeEvents.addOutput.unsubscribe(token);
  baklava.editor.nodeEvents.removeOutput.unsubscribe(token);
});

// TODO: add sidebar toggle to toolbar?
const nodeColors = computed(() => {
  let styles = "";
  let seenTypes = new Set<string>([
    "unknown",
    "string",
    "number",
    "integer",
    "boolean",
    "list",
    "stringDict",
  ]);
  for (const nodeTypeName of allInterfaceTypeNames) {
    if (/[#|]/.test(nodeTypeName)) continue;
    if (seenTypes.has(nodeTypeName)) continue;
    seenTypes.add(nodeTypeName);
    const escaped = escapeCssIdentifier(nodeTypeName);
    const hue = hashString(nodeTypeName) % 360;
    styles += `
.baklava-node-interface[data-interface-type="${escaped}"],
.baklava-node-interface[data-interface-type*="[${escaped}]"],
.baklava-node-interface[data-interface-type^="${escaped} |"] {
  --baklava-node-interface-port-color: oklch(80% 50% ${hue}deg);
}
`;
  }
  return styles;
});
</script>

<template>
  <BaklavaEditor ref="editorRef" :view-model="baklava">
    <template #palette="paletteProps">
      <BaklavaNodePalette v-bind="paletteProps" />
    </template>
    <template #node="nodeProps">
      <!-- @vue-expect-error The definition for the `node` slot is incorrect - it should not require `$event` in `onselect`. -->
      <BaklavaNode :key="nodeProps.node.id" v-bind="nodeProps">
        <template #nodeInterface="interfaceProps">
          <BaklavaNodeInterface v-bind="interfaceProps">
            <template #portTooltipContent="tooltipProps">
              <span v-if="(tooltipProps.intf as any).type" class="__type">
                {{ (tooltipProps.intf as any).type }}
              </span>
              <span>{{ ellipsis(tooltipProps.intf.value) }}</span>
            </template>
          </BaklavaNodeInterface>
        </template>
      </BaklavaNode>
    </template>
  </BaklavaEditor>
  <component is="style" v-html="nodeColors"></component>
</template>
