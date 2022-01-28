<template>
    <Modal :header="header" :id="id" class="confirm" :closers="[]">
        {{ plural ? $tc(_text[0], _text[1][0]) : $_(..._text) }}
        <template #footer>
            <AppButton
                :async="yes.async"
                :click="yesBtn"
                class="success"
                t="yes"
            />
            <AppButton :async="no && no.async" :click="noBtn" t="no" />
        </template>
    </Modal>
</template>

<style lang="less" scoped>
@import (reference) '../../assets/global.less';

.modal {
    &:deep(.modal-body) {
        color: rgba(255, 255, 255, 0.75);
        margin: 1rem 0;
        line-height: 145%;
        user-select: text;
        text-align: justify;
    }

    &:deep(.modal-footer) {
        display: flex;
        align-items: center;
        .gap(1rem);
        justify-content: flex-end;
    }
}
</style>

<script lang="ts">
import {
    ModalAsyncHandler,
    TranslationSet,
    TranslationSetNormalized,
} from '@/lib/types';
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
        yes: {
            type: Object as PropType<ModalAsyncHandler>,
            required: true,
        },
        no: {
            type: Object as PropType<ModalAsyncHandler>,
            required: false,
        },
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

            return this.$te(`header.${tkey}`) ? this.text : 'confirmDefault';
        },
    },
    methods: {
        async yesBtn(e: PointerEvent) {
            await this.yes.handler(e);

            this.$store.commit('closeModal', this.id);
        },
        async noBtn(e: PointerEvent) {
            if (this.no && this.no.handler) {
                await this.no.handler(e);
            }

            this.$store.commit('closeModal', this.id);
        },
    },
    inheritAttrs: false,
});
</script>
