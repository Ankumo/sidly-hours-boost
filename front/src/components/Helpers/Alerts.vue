<template>
    <transition-group name="alerts" class="alerts" tag="div">
        <Alert v-for="alert in alerts" :key="alert.id" :item="alert" />
    </transition-group>
</template>

<style lang="less" scoped>
.alerts {
    position: fixed;
    bottom: 2rem;
    margin: 0 auto;
    left: 0;
    right: 0;
    z-index: 15;
    width: 45vw;
}

.alerts-leave-active {
    position: absolute;
}

.alerts-enter-from {
    opacity: 0;
    transform: translateY(50%) scale(0.97);
}

.alerts-leave-to {
    opacity: 0;
    transform: translateY(-50%) scale(0.97);
}

@media (max-width: 1600px) {
    .alerts {
        width: 50vw;
    }
}

@media (max-width: 1200px) {
    .alerts {
        width: 60vw;
    }
}

@media (max-width: 768px) {
    .alerts {
        width: 100vw;
        margin: 0;
        bottom: 0;
    }

    .alerts-enter-from,
    .alerts-leave-to {
        opacity: 0;
        transform: translateY(50%);
    }
}
</style>

<script lang="ts">
import { AlertModel } from '@/lib/types';
import { defineComponent } from 'vue';
import Alert from './Alert.vue';

export default defineComponent({
    components: {
        Alert,
    },
    computed: {
        alerts(): AlertModel[] {
            return this.$store.state.alerts;
        },
    },
});
</script>
