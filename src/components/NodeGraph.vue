<script setup lang="ts">
import "@baklavajs/themes/dist/syrup-dark.css";
import { BaklavaEditor, Components, NodeInterfaceType } from "baklavajs";
import { useFullBaklava } from "../lib/nodes/fullWeb";
import {
  computed,
  nextTick,
  onMounted,
  onUnmounted,
  toRaw,
  useTemplateRef,
} from "vue";
import { debounce } from "../lib/debounce";
import BaklavaSidebar from "./BaklavaSidebar.vue";
import BaklavaNodeInterface from "./BaklavaNodeInterface.vue";
import { ellipsis } from "../lib/string";
import { escapeCssIdentifier } from "../lib/css";
import { coreTypeNames } from "../lib/nodes/baklava";
import BaklavaNodePalette from "./BaklavaNodePalette.vue";
import { allInterfaceTypeNames } from "../lib/nodes/interfaceTypes";

const { Node: BaklavaNode } = Components;

const { baklava, promise } = useFullBaklava();
baklava.settings.displayValueOnHover = true;
baklava.settings.sidebar.enabled = false;
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
  for (const nodeTypeName of allInterfaceTypeNames) {
    // Skip generics, which should be distinguished by shape.
    if (/[[\]]/.test(nodeTypeName) || coreTypeNames.has(nodeTypeName)) {
      continue;
    }
    const escaped = escapeCssIdentifier(nodeTypeName);
    const hue = Math.floor(Math.random() * 360);
    styles += `
      .baklava-node-interface[data-interface-type="${escaped}"],
      .baklava-node-interface[data-interface-type*="[${escaped}]"] {
        --baklava-node-interface-port-color: oklch(70% 0.2 ${hue}deg);
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
