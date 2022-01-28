<template>
    <transition name="loader">
        <div class="loader" v-show="state !== ESSEState.CONNECTED">
            <transition name="fade" appear :key="state">
                <div class="loader-wrapper">
                    <h3>
                        {{ $t(`sse.${state}.header`) }}
                    </h3>
                    <span v-if="stateTitle">
                        {{ stateTitle }}
                    </span>
                    <AppButton
                        v-if="state === ESSEState.ERROR"
                        :click="reconnect"
                        t="reconnectNow"
                    />
                </div>
            </transition>
        </div>
    </transition>
</template>

<style scoped lang="less">
@import (reference) '../../assets/global.less';

.loader {
    display: flex;
    align-items: center;
    color: white;
    font-size: 1.5rem;
    justify-content: center;
    font-weight: 600;
    width: 100vw;
    height: 100vh;
    position: fixed;
    z-index: 10;
    background: rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(20px);
    top: 0;
    left: 0;

    &-wrapper {
        display: inline-flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        .gapTop(1rem);
    }

    h3 {
        text-align: center;
        letter-spacing: 2px;
        margin: 0;
    }

    span {
        font-size: 0.9rem;
        font-weight: 300;
        text-align: center;
        margin-bottom: 1rem;
    }
}

.loader-enter-active,
.loader-leave-active {
    transition: opacity 0.85s ease, transform 0.5s;
}

.loader-enter-from,
.loader-leave-to {
    opacity: 0;
    transform-origin: center;
    transform: scale(1.03);
}
</style>

<script lang="ts">
import { defineComponent } from 'vue';
import AppButton from '@/components/Form/AppButton.vue';
import { ESSEState } from '@/lib/enums';

export default defineComponent({
    name: 'SseLoader',
    components: {
        AppButton,
    },
    data() {
        return {
            ESSEState,
            timerCounter: 10,
            timer: undefined as number | undefined,
        };
    },
    methods: {
        async reconnect() {
            clearInterval(this.timer);
            await this.$sse.connect();
        },
        startCounter() {
            this.timer = setInterval(() => {
                this.timerCounter--;

                if (this.timerCounter <= 0) {
                    this.reconnect();
                }
            }, 1000);
        },
    },
    computed: {
        state(): ESSEState {
            return this.$store.state.sse;
        },
        stateTitle(): string | undefined {
            const title = `sse.${this.state}.title`;

            if (this.$te(title)) {
                return this.$tc(title, this.timerCounter);
            }

            return undefined;
        },
    },
    watch: {
        state(n: ESSEState) {
            if (n === ESSEState.ERROR) {
                this.timerCounter = 10;
                this.startCounter();
            }
        },
    },
});
</script>
