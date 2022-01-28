<template>
    <AppIcon name="loading" class="loader" />
</template>

<style lang="less" scoped>
.icon {
    width: 72px;
    height: 72px;
    animation: spin 1s linear infinite;

    &:deep(svg *) {
        fill: #57cbde;
    }
}
</style>

<script lang="ts">
import { defineComponent } from 'vue';
import AppIcon from './AppIcon.vue';

export default defineComponent({
    components: { AppIcon },
});
</script>
