<script setup lang="ts">
import { useId } from "vue";

defineProps<{
  values: string[];
  value?: string;
}>();
const emit = defineEmits<{
  change: [value: string];
}>();
</script>

<template>
  <div class="Dropdown">
    <span class="value">{{ value ?? "" }}</span>
    <div v-for="value in values" :key="value">
      <span class="option" @click="emit('change', value)">{{ value }}</span>
    </div>
  </div>
</template>

<style scoped></style>
