<template>
    <div class="icon" @click.left="$emit('click', $event)">
        <component :is="cmp" />
    </div>
</template>

<style lang="less" scoped>
.icon {
    display: inline-block;

    svg {
        width: 100%;
        height: 100%;
    }
}
</style>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    props: {
        name: {
            type: String,
            required: true,
        },
        fallback: {
            type: String,
            required: false,
        },
    },
    emits: ['click'],
    computed: {
        cmp() {
            return require(`@/assets/icons/${this.name}.svg?inline`).default;
        },
    },
});
</script>
