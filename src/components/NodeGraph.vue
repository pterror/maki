<script setup lang="ts">
import "@baklavajs/themes/dist/syrup-dark.css";
import { BaklavaEditor } from "baklavajs";
import { useFullBaklava } from "../lib/nodes/full";

const { baklava } = useFullBaklava();
</script>

<template>
  <BaklavaEditor :view-model="baklava" />
</template>
