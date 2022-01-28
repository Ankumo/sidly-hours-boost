<template>
    <transition
        name="mbg"
        @before-enter="beforeEnter"
        @leave="leave"
        @enter="enter"
        :css="false"
    >
        <div class="main-bg" v-if="$store.state.bg">
            <SteamBg :item="item" :fallback="fallbackBg" :autoplay="true" />
        </div>
    </transition>
</template>

<style scoped lang="less">
.main-bg {
    position: fixed;
    top: 0px;
    left: 0px;
    width: 100vw;
    height: 100vh;
    right: unset;
    bottom: unset;
    transform-origin: top left;
    background: black;
    will-change: transform, left, top, opacity;
    z-index: -1;

    &:deep(.steam-bg:not(.loader)) {
        position: relative;
        top: unset;
        bottom: unset;
        right: unset;
        left: unset;
        margin: unset;
        margin-top: calc(2.5rem + 36px - 2px);
    }

    &:deep(.loader) {
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        margin: auto;
        z-index: 5;
        width: 200px;
        height: 200px;
    }
}
</style>

<script lang="ts">
import { SteamImageData } from '@shared/types';
import { defineComponent } from 'vue';
import SteamBg from './Helpers/SteamBg.vue';

export default defineComponent({
    components: { SteamBg },
    computed: {
        item(): SteamImageData | undefined {
            if (!this.$store.state.bg) {
                return undefined;
            }

            return this.$store.state.bg.bg;
        },
        rect(): DOMRect | undefined {
            if (!this.$store.state.bg) {
                return undefined;
            }

            return this.$store.state.bg.rect;
        },
        fallbackBg(): string {
            return require(`@/assets/default-profile-bg.jpg`);
        },
    },
    data() {
        return {
            scaleX: 0,
            scaleY: 0,
            x: 0,
            y: 0,
        };
    },
    methods: {
        leave(el: Element, done: () => void) {
            setTimeout(done, 410);
            this.setEl(el as HTMLDivElement);
        },
        beforeEnter(el: Element) {
            if (this.rect) {
                this.scaleX = this.rect.width / window.innerWidth;
                this.scaleY = this.rect.height / window.innerHeight;
                this.x = this.rect.x;
                this.y = this.rect.y;

                this.setEl(el as HTMLDivElement);
            }
        },
        enter(element: Element, done: () => void) {
            setTimeout(done, 410);

            const el = element as HTMLDivElement;
            el.style.transition =
                'top 0.4s, left 0.4s, transform 0.4s, opacity 0.4s ease-in-out';

            window.requestAnimationFrame(() => {
                if (el) {
                    el.style.top = '0px';
                    el.style.left = '0px';
                    el.style.transform = 'scale(1.01)';
                    el.style.opacity = '1';
                }
            });
        },
        beforeLeave(element: Element) {
            const el = element as HTMLDivElement;

            el.style.transition =
                'top 0.4s, left 0.4s, transform 0.4s, opacity 0.4s ease-in-out';
        },
        setEl(el: HTMLDivElement) {
            el.style.left = `${this.x}px`;
            el.style.top = `${this.y}px`;
            el.style.transform = `scale(${this.scaleX}, ${this.scaleY})`;
            el.style.opacity = '0';
        },
    },
});
</script>
