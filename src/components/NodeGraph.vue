<script setup lang="ts">
import "@baklavajs/themes/dist/syrup-dark.css";
import { BaklavaEditor } from "baklavajs";
import { useFullBaklava } from "../lib/nodes/full";
import { onMounted, onUnmounted } from "vue";

const { baklava, promise } = useFullBaklava();
const token = Symbol();

onMounted(() => {
  promise.then(() => {
    const value = localStorage.getItem("maki-graph");
    if (!value) return;
    const warnings = baklava.editor.load(JSON.parse(value));
    if (warnings.length) {
      console.warn("Warnings while loading graph:", warnings);
    }
  });

  function save() {
    localStorage.setItem("maki-graph", JSON.stringify(baklava.editor.save()));
  }

  baklava.editor.graphEvents.addNode.subscribe(token, save);
  baklava.editor.graphEvents.removeNode.subscribe(token, save);
  baklava.editor.graphEvents.addConnection.subscribe(token, save);
  baklava.editor.graphEvents.removeConnection.subscribe(token, save);
});

onUnmounted(() => {
  baklava.editor.graphEvents.addNode.unsubscribe(token);
  baklava.editor.graphEvents.removeNode.unsubscribe(token);
  baklava.editor.graphEvents.addConnection.unsubscribe(token);
  baklava.editor.graphEvents.removeConnection.unsubscribe(token);
});
</script>

<template>
  <BaklavaEditor :view-model="baklava" />
</template>
