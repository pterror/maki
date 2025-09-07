<script setup lang="ts">
import {
  computed,
  onMounted,
  onUpdated,
  ref,
  watchEffect,
  type Ref,
} from "vue";
import {
  AbstractNode,
  NodeInterface,
  useTemporaryConnection,
  useViewModel,
} from "baklavajs";
import { ellipsis } from "../lib/string";

const props = defineProps<{
  node: AbstractNode;
  intf: NodeInterface;
}>();

const { viewModel } = useViewModel();
const { hoveredOver, temporaryConnection } = useTemporaryConnection();

const el = ref<HTMLElement | null>(null) as Ref<HTMLElement>;

const isConnected = computed(() => props.intf.connectionCount > 0);
const isHovered = ref<boolean>(false);
const showTooltip = computed(
  () => viewModel.value.settings.displayValueOnHover && isHovered.value,
);
const classes = computed(() => ({
  "--input": props.intf.isInput,
  "--output": !props.intf.isInput,
  "--connected": isConnected.value,
}));
const showComponent = computed<boolean>(
  () =>
    props.intf.component &&
    (!props.intf.isInput ||
      !props.intf.port ||
      props.intf.connectionCount === 0),
);

function startHover(): void {
  isHovered.value = true;
  hoveredOver(props.intf);
}

function endHover(): void {
  isHovered.value = false;
  hoveredOver(undefined);
}

function onRender(): void {
  if (el.value) {
    viewModel.value.hooks.renderInterface.execute({
      intf: props.intf,
      el: el.value,
    });
  }
}

function openSidebar(): void {
  const sidebar = viewModel.value.displayedGraph.sidebar;
  sidebar.nodeId = props.node.id;
  sidebar.optionName = props.intf.name;
  sidebar.visible = true;
}

onMounted(onRender);
onUpdated(onRender);
</script>

<template>
  <div :id="intf.id" ref="el" class="baklava-node-interface" :class="classes">
    <div
      v-if="intf.port"
      class="__port"
      :class="{ '--selected': temporaryConnection?.from === intf }"
      @pointerover="startHover"
      @pointerout="endHover"
    >
      <slot name="portTooltip" :show-tooltip="showTooltip">
        <span v-if="showTooltip === true" class="__tooltip">
          <slot name="portTooltipContent" v-bind="props">
            <span>{{ ellipsis(intf.value) }}</span>
          </slot>
        </span>
      </slot>
    </div>
    <component
      :is="intf.component"
      v-if="showComponent"
      v-model="intf.value"
      :node="node"
      :intf="intf"
      @open-sidebar="openSidebar"
    />
    <span v-else class="align-middle">
      {{ intf.name }}
    </span>
  </div>
</template>
