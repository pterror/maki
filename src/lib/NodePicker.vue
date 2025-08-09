<script setup lang="ts">
import { computed } from "vue";
import {
  globalNodeDefinitionRegistry,
  type NodeDefinitionRegistry,
} from "./nodes/node";

const props = defineProps<{
  nodeDefinitionRegistry?: NodeDefinitionRegistry;
}>();

const nodeDefinitionRegistry = computed(
  () => props.nodeDefinitionRegistry ?? globalNodeDefinitionRegistry
);

function onDragStart(event: DragEvent, name: string) {
  if (!event.dataTransfer) return
  event.dataTransfer.setData("text/plain", name);
  event.dataTransfer.setDragImage(
    document.createElement("span"),
    0,
    0
  );
  event.dataTransfer.effectAllowed = "copy";
  event.dataTransfer.dropEffect = "copy";
}
</script>

<template>
  <span v-for="(_definition, name) in nodeDefinitionRegistry.definitions" draggable="true" @dragstart="onDragStart($event, name)">
    {{ name }}
  </span>
</template>

<style scoped></style>
