<script setup lang="ts">
import "@baklavajs/themes/dist/syrup-dark.css";
import { BaklavaEditor, useBaklava } from "baklavajs";
import { setupBaklava } from "../lib/nodes/full";

const baklava = useBaklava();
const { interfaceTypes } = setupBaklava(baklava);
</script>

<template>
  <BaklavaEditor :view-model="baklava" />
</template>
