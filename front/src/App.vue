<template>
    <div class="app-wrapper" v-if="loaded">
        <Nav />
        <div class="router a-width">
            <router-view v-slot="{ Component }">
                <transition
                    :name="$route.fullPath === '/' ? 'route-main' : 'route'"
                >
                    <keep-alive include="Home">
                        <component :is="Component" />
                    </keep-alive>
                </transition>
            </router-view>
        </div>
    </div>
    <Alerts />
    <Modals />
    <SseLoader />
    <MainBg />
</template>

<style lang="less">
@import './assets/global';

#app,
.app-wrapper {
    height: 100%;
    width: 100%;
}

.app-wrapper {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
}

@navHeight: calc(36px + 2.5rem);
@transformOrigin: center calc((100vh - @navHeight - 1rem) / 2);

.route-enter-active,
.route-leave-active,
.route-main-enter-active,
.route-main-leave-active {
    transition: opacity 0.4s ease, transform 0.4s;
    transform-origin: @transformOrigin;
}

.route-enter-from,
.route-leave-to,
.route-main-enter-from,
.route-main-leave-to {
    opacity: 0;
    position: absolute;
    width: 100%;
    max-width: 1188px;
    transform-origin: @transformOrigin;
}

.route-enter-from,
.route-main-leave-to {
    transform: scale(0.85) !important;
}

.route-main-enter-from,
.route-leave-to {
    transform: scale(1.15) !important;
}

.route-body {
    overflow: hidden;
    min-height: calc(100vh - @navHeight);
    box-sizing: border-box;
}

.router {
    position: relative;
    padding-top: @navHeight;
}
</style>

<script lang="ts">
import { defineComponent } from 'vue';
import Nav from './components/Nav.vue';
import SseLoader from './components/Loaders/SseLoader.vue';
import { ESSEState } from './lib/enums';
import Alerts from '@/components/Helpers/Alerts.vue';
import Modals from '@/components/Modals/index.vue';
import MainBg from './components/MainBg.vue';

export default defineComponent({
    name: 'App',
    components: {
        Nav,
        SseLoader,
        Alerts,
        Modals,
        MainBg,
    },
    computed: {
        loaded(): boolean {
            return this.$store.state.sse === ESSEState.CONNECTED;
        },
    },
});
</script>
