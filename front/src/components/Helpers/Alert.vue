<template>
    <div :class="['alert', item.type]" @click.left="log">
        <span>
            {{ $_(...text) }}
        </span>
        <AppIcon name="times" class="ihover" @click="close" />
    </div>
</template>

<style lang="less" scoped>
.alert {
    width: 100%;
    display: flex;
    align-items: center;
    border-radius: 4px;
    color: #f3f2f9;
    background: #262d33;
    padding: 0.5rem 0.5rem 0.5rem 1rem;
    justify-content: space-between;
    margin-top: 1rem;
    box-shadow: 0 0 1px black;
    transition: all 0.3s;
    text-shadow: 0 0 4px black;

    span {
        text-align: justify;
    }

    .icon {
        width: 1rem;
        height: 1rem;
        padding: 0.5rem;
        flex-shrink: 0;
        flex-grow: 0;
    }

    &.success,
    &.error,
    &.info,
    &.warning {
        background: var(--accent);
    }
}

@media (max-width: 768px) {
    .alert {
        border-radius: 0;
        box-sizing: border-box;
        margin-top: 0.1rem;
    }
}
</style>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import AppIcon from './AppIcon.vue';
import { AlertModel, TranslationSetNormalized } from '@/lib/types';
import { resolveTSet } from '@/lib/util';

export default defineComponent({
    components: {
        AppIcon,
    },
    props: {
        item: {
            type: Object as PropType<AlertModel>,
            required: true,
        },
    },
    data() {
        return {
            closeTimeout: -1,
        };
    },
    computed: {
        text(): TranslationSetNormalized {
            return resolveTSet('alert', this.item.text);
        },
    },
    methods: {
        close(e?: MouseEvent) {
            if (e) {
                e.preventDefault();
                e.stopImmediatePropagation();
            }

            clearTimeout(this.closeTimeout);
            this.$store.commit('closeAlert', this.item.id);
        },
        log() {
            console.log(this.item.error || this.$_('alert.noAlertErr'));
        },
    },
    mounted() {
        this.closeTimeout = setTimeout(this.close, 10000);
    },
    unmounted() {
        clearTimeout(this.closeTimeout);
    },
});
</script>
