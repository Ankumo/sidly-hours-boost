<template>
    <div :class="['game-image', { fallback, loading }]">
        <img
            :src="`https://cdn.cloudflare.steamstatic.com/steam/apps/${appId}/header.jpg`"
            @load="loaded"
            @error="errored"
            width="460"
            height="215"
            draggable="false"
            ref="img"
        />
        <LoaderIcon v-if="loading" />
    </div>
</template>

<style lang="less" scoped>
.game-image {
    opacity: 1;
    transition: opacity 0.5s;
    background-repeat: no-repeat;
    background-color: var(--form-bg);
    background-size: cover;

    &.loading {
        opacity: 0;
    }

    .loader {
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        margin: auto;
    }

    img {
        opacity: 0;
        max-width: 100%;
        pointer-events: none;
        height: auto;
        max-width: 100%;
    }
}
</style>

<script lang="ts">
import { defineComponent } from 'vue';
import LoaderIcon from './LoaderIcon.vue';

export default defineComponent({
    components: { LoaderIcon },
    props: {
        appId: {
            type: Number,
            required: true,
        },
    },
    data() {
        return {
            fallback: false,
            loading: true,
        };
    },
    computed: {
        src(): string {
            return `https://cdn.cloudflare.steamstatic.com/steam/apps/${this.appId}/header.jpg`;
        },
    },
    methods: {
        errored() {
            this.loading = false;
            this.fallback = true;
        },
        loaded(e: Event) {
            const img = e.target as HTMLImageElement;
            const el = this.$el as HTMLDivElement;

            el.style.backgroundImage = `url(${img.src})`;

            this.loading = false;
        },
    },
});
</script>
