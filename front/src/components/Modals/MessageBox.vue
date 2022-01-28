<template>
    <Modal :header="header" :id="id" class="message-box" :closers="[]">
        {{ plural ? $tc(_text[0], _text[1][0]) : $_(..._text) }}
        <template #footer>
            <AppButton :click="close" t="ok" />
        </template>
    </Modal>
</template>

<style lang="less" scoped>
.modal {
    &:deep(.modal-body) {
        color: rgba(255, 255, 255, 0.75);
        margin: 1rem 0;
        line-height: 145%;
        user-select: text;
        text-align: justify;
    }

    &:deep(.modal-footer button) {
        float: right;
    }
}
</style>

<script lang="ts">
import { TranslationSet, TranslationSetNormalized } from '@/lib/types';
import { resolveTSet } from '@/lib/util';
import { defineComponent, PropType } from 'vue';
import AppButton from '../Form/AppButton.vue';
import Modal from './Modal.vue';

export default defineComponent({
    components: {
        Modal,
        AppButton,
    },
    props: {
        text: {
            type: [String, Array] as PropType<TranslationSet<'messageBox'>>,
            required: true,
        },
        plural: {
            type: Boolean,
            default: false,
        },
        id: {
            type: String,
            required: true,
        },
    },
    computed: {
        _text(): TranslationSetNormalized {
            return resolveTSet('messageBox', this.text);
        },
        header(): TranslationSet<'header'> | undefined {
            const tkey = Array.isArray(this.text) ? this.text[0] : this.text;

            return this.$te(`header.${tkey}`) ? this.text : 'messageBoxDefault';
        },
    },
    methods: {
        close() {
            this.$store.commit('closeModal', this.id);
        },
    },
    inheritAttrs: false,
});
</script>
