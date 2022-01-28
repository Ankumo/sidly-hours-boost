<template>
    <div
        :class="['checkbox', { checked: localValue }]"
        @click.left="localValue = !localValue"
    >
        <input v-bind="$attrs" type="checkbox" v-model="localValue" />

        <AppIcon name="check" />
        <label v-if="label">
            {{ _label }}
        </label>
    </div>
</template>

<style lang="less" scoped>
@import (reference) '../../assets/global.less';

.checkbox {
    position: relative;
    display: inline-flex;
    align-items: center;
    .gap(0.4rem);
    cursor: pointer;
    color: rgba(255, 255, 255, 0.65);
    transition: color 0.3s;
    user-select: none;

    input {
        opacity: 0;
        position: absolute;
        pointer-events: none;
        width: 100%;
        height: 100%;
        left: 0;
        top: 0;
    }

    .icon {
        width: 16px;
        height: 16px;
        transition: opacity 0.3s;
        box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.65);
        border-radius: 4px;
        opacity: 0.65;
        background: rgba(0, 0, 0, 0.5);
        flex-shrink: 0;

        &:deep(svg) {
            box-sizing: border-box;
            padding: 0.2rem;
        }

        &:deep(*) {
            fill: white;
        }

        &:deep(g) {
            transform: scale(0);
            opacity: 0;
            transform-origin: center center;
            transition: transform 0.1s, opacity 0.3s;
        }
    }

    label {
        cursor: inherit;
        white-space: nowrap;
    }

    &:hover {
        color: white;

        .icon {
            opacity: 1;
        }
    }

    &.checked {
        .icon {
            opacity: 1;

            &:deep(g) {
                opacity: 1;
                transform: scale(1);
            }
        }
    }
}
</style>

<script lang="ts">
import { TranslationSet } from '@/lib/types';
import { resolveTSet } from '@/lib/util';
import { defineComponent, PropType } from 'vue';
import AppIcon from '../Helpers/AppIcon.vue';

export default defineComponent({
    components: { AppIcon },
    props: {
        modelValue: {
            type: Boolean,
            required: true,
        },
        label: {
            type: [String, Array] as PropType<TranslationSet<'label'>>,
            required: false,
        },
    },
    emits: ['update:modelValue'],
    computed: {
        localValue: {
            get(): boolean {
                return this.modelValue;
            },
            set(value: boolean) {
                this.$emit('update:modelValue', value);
            },
        },
        _label(): string | undefined {
            if (!this.label) {
                return undefined;
            }

            return this.$_(...resolveTSet('label', this.label));
        },
    },
});
</script>
