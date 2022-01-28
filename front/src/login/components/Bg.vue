<template>
    <div :class="['main-logo', { left }]">
        <Logo :style="`transform: translate(${x}px, ${y}px);`" />
        <span>{{ $_('other.signInWelcome') }}</span>
    </div>
</template>

<style lang="less" scoped>
.main-logo {
    width: 100vw;
    height: 100vh;
    position: fixed;
    z-index: -1;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    pointer-events: none;

    .logo:deep(img) {
        animation-play-state: paused;
    }

    &.left .logo {
        transition: transform 1s;
        transform: translate(0, 0) !important;

        &:deep(img) {
            animation-play-state: running;
        }
    }

    span {
        padding: 1rem;
        font-size: 2rem;
        font-weight: 400;
        color: white;
    }
}

@media (max-width: 768px) {
    .main-logo {
        justify-content: flex-start;

        .logo {
            margin-top: 2rem;
            width: 100px;
            height: 100px;
            transform: translate(0, 0) !important;

            &:deep(img) {
                animation-play-state: running !important;
            }
        }

        span {
            font-size: 1.25rem;
            font-weight: 600;
            letter-spacing: 1px;
        }
    }
}
</style>

<script lang="ts">
import { defineComponent } from 'vue';
import Logo from '@/components/Helpers/Logo.vue';

export default defineComponent({
    components: {
        Logo,
    },
    data() {
        return {
            left: false,
            x: 0,
            y: 0,
        };
    },
    methods: {
        mousemove(e: MouseEvent) {
            this.left = false;

            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;

            const scale = 0.0075;

            this.x = scale * (e.clientX - centerX);
            this.y = scale * (e.clientY - centerY);
        },
        mouseleave() {
            this.left = true;
        },
    },
    mounted() {
        window.addEventListener('mousemove', this.mousemove);
        document.addEventListener('mouseleave', this.mouseleave);
    },
    unmounted() {
        window.removeEventListener('mousemove', this.mousemove);
        document.removeEventListener('mouseleave', this.mouseleave);
    },
});
</script>
