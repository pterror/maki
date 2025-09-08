<script setup lang="ts">
import {
  computed,
  inject,
  ref,
  reactive,
  type CSSProperties,
  type Ref,
} from "vue";
import { useDebounce, usePointer } from "@vueuse/core";
import {
  AbstractNode,
  useNodeCategories,
  useTransform,
  useViewModel,
  type INodeTypeInformation,
} from "baklavajs";
import BaklavaPaletteEntry from "./BaklavaPaletteEntry.vue";
import { regexEscape } from "../lib/regex";

interface IDraggedNode {
  type: string;
  nodeInformation: INodeTypeInformation;
}

const { viewModel } = useViewModel();
const { x: mouseX, y: mouseY } = usePointer();
const { transform } = useTransform();
const categories = useNodeCategories(viewModel);
const query = ref("");
const debouncedQuery = useDebounce(query, 200);
const isMatch = computed(() => {
  if (!debouncedQuery.value) return () => true;
  const regexes =
    query.value.match(/\S+/g)?.map((q) => new RegExp(regexEscape(q), "i")) ??
    [];
  return (s: string) => regexes.every((r) => r.test(s));
});
const filteredCategories = computed(() => {
  if (!debouncedQuery.value) return categories.value;
  return categories.value
    .flatMap((c) => {
      const nodeTypes = Object.fromEntries(
        Object.entries(c.nodeTypes).filter(
          ([nt, ni]) => isMatch.value(ni.title) || isMatch.value(nt),
        ),
      );
      return Object.keys(nodeTypes).length ? [{ name: c.name, nodeTypes }] : [];
    })
    .filter((c) => Object.keys(c.nodeTypes).length > 0);
});

const editorEl = inject<Ref<HTMLElement | null>>("editorEl");

const draggedNode = ref<IDraggedNode | null>(null);

const draggedNodeStyles = computed<CSSProperties>(() => {
  if (!draggedNode.value || !editorEl?.value) {
    return {};
  }
  const { left, top } = editorEl.value.getBoundingClientRect();
  return {
    top: `${mouseY.value - top}px`,
    left: `${mouseX.value - left}px`,
  };
});

const onDragStart = (type: string, nodeInformation: INodeTypeInformation) => {
  draggedNode.value = {
    type,
    nodeInformation,
  };

  const onDragEnd = () => {
    const instance = reactive(new nodeInformation.type()) as AbstractNode;
    viewModel.value.displayedGraph.addNode(instance);

    const rect = editorEl!.value!.getBoundingClientRect();
    const [x, y] = transform(mouseX.value - rect.left, mouseY.value - rect.top);
    instance.position.x = x;
    instance.position.y = y;

    draggedNode.value = null;
    document.removeEventListener("pointerup", onDragEnd);
  };
  document.addEventListener("pointerup", onDragEnd);
};
</script>

<template>
  <div class="baklava-node-palette" @contextmenu.stop.prevent="">
    <label>
      <span>Search Nodes</span>
      <input type="text" v-model="query" />
    </label>
    <section v-for="c in filteredCategories" :key="c.name">
      <h1 v-if="c.name !== 'default'">
        {{ c.name }}
      </h1>
      <BaklavaPaletteEntry
        v-for="(ni, nt) in c.nodeTypes"
        :key="nt"
        :type="nt"
        :title="ni.title"
        @pointerdown="onDragStart(nt, ni)"
      />
    </section>
  </div>
  <transition name="fade">
    <div
      v-if="draggedNode"
      class="baklava-dragged-node"
      :style="draggedNodeStyles"
    >
      <BaklavaPaletteEntry
        :type="draggedNode.type"
        :title="draggedNode.nodeInformation.title"
      />
    </div>
  </transition>
</template>
