<template>
    <component
        :is="multiline ? 'textarea' : 'input'"
        class="input"
        v-bind="$attrs"
        :value="modelValue"
        @input="setValue($event.target.value)"
        :placeholder="ph"
    />
</template>

<style lang="less" scoped>
.input {
    padding: 0.625rem 1rem;
    resize: none;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    background: var(--form-bg);
    color: #b9bac1;
    transition: background 0.3s, box-shadow 0.4s;
    backdrop-filter: blur(20px);
    box-shadow: 0 0 0 0 var(--form-bg);
    box-sizing: border-box;

    &:focus {
        outline: none;
        box-shadow: 0 0 0 2px var(--form-bg);
    }
}
</style>

<script lang="ts">
import { TranslationSet } from '@/lib/types';
import { resolveTSet } from '@/lib/util';
import { defineComponent, PropType } from 'vue';

export default defineComponent({
    props: {
        multiline: {
            type: Boolean,
            default: false,
        },
        modelValue: [String, Number],
        transform: {
            type: Function as PropType<(value: string) => string>,
            required: false,
        },
        placeholder: {
            type: [String, Array] as PropType<TranslationSet<'ph'>>,
            required: false,
        },
    },
    emits: ['update:modelValue'],
    computed: {
        ph(): string | undefined {
            if (!this.placeholder) {
                return undefined;
            }

            if (
                typeof this.placeholder === 'string' &&
                !this.$te(`ph.${this.placeholder}`)
            ) {
                return this.placeholder;
            }

            return this.$_(...resolveTSet('ph', this.placeholder));
        },
    },
    methods: {
        setValue(value: string) {
            if (this.transform) {
                value = this.transform(value);
                this.$el.value = value;
            }

            this.$emit('update:modelValue', value);
        },
    },
});
</script>
