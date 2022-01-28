<template>
    <LoaderIcon class="steam-bg" v-if="loading" />
    <video
        :class="['steam-bg', { loading }]"
        v-if="item && isVideo"
        :poster="fallback"
        loop
        :autoplay="autoplay"
        preload="auto"
        @canplaythrough="ready"
        ref="video"
        muted
    >
        <source :src="item.movie_webm" type="video/webm" />
        <source :src="item.movie_mp4" type="video/mp4" />
        <img :src="fallback" @load="loading = false" />
    </video>

    <img
        v-else
        :class="['steam-bg', { loading }]"
        :src="image"
        @load="loading = false"
    />
</template>

<style lang="less" scoped>
.steam-bg {
    position: absolute;
    width: 100%;
    z-index: -1;
    top: 0;
    left: 0;
    bottom: 0;
    margin: auto 0;
    opacity: 1;
    transition: opacity 0.5s;

    img,
    source {
        display: block;
        width: 100%;
        height: 100%;
    }

    &.loading {
        opacity: 0;
    }
}
</style>

<script lang="ts">
import { SteamImageData } from '@shared/types';
import { defineComponent, PropType } from 'vue';
import LoaderIcon from './LoaderIcon.vue';

export default defineComponent({
    components: { LoaderIcon },
    props: {
        item: {
            type: Object as PropType<SteamImageData>,
            required: false,
        },
        fallback: {
            type: String,
            required: false,
        },
        autoplay: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            loading: true,
        };
    },
    computed: {
        isVideo(): boolean {
            if (!this.item) {
                return false;
            }
            return this.item.movie_mp4 || this.item.movie_webm ? true : false;
        },
        image(): string {
            if (!this.item) {
                return this.fallback || '';
            }
            return this.item.image_large || this.item.image_small;
        },
    },
    emits: ['ready'],
    methods: {
        ready() {
            this.loading = false;
            this.$emit('ready', this.$refs.video);
        },
    },
});
</script>
