<template>
    <div class="modal" @mousedown.left="closeOutside" ref="outside">
        <div class="modal-wrapper">
            <AppIcon
                v-if="closers.includes('times')"
                name="times"
                class="ihover"
                @click="close"
            />
            <div class="modal-header" v-if="header">
                <slot name="header">
                    <transition name="fade" :duration="200" mode="out-in">
                        <h3 :key="_header" :title="_header">
                            {{ _header }}
                        </h3>
                    </transition>
                </slot>
            </div>
            <div class="modal-body">
                <slot />
            </div>
            <div class="modal-footer">
                <slot name="footer"> </slot>
            </div>
        </div>
    </div>
</template>

<style lang="less" scoped>
.modal {
    position: fixed;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(5px);
    width: 100vw;
    height: 100vh;
    left: 0;
    top: 0;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: center;

    .modal-body {
        margin: 2rem 0;
    }

    .modal-header {
        h3 {
            line-height: 22px;
            overflow: hidden;
            max-width: calc(100% - 1rem);
            text-overflow: ellipsis;
            font-size: 1.1rem;
        }
    }

    .modal-wrapper {
        z-index: 11;
        border-radius: 4px;
        box-shadow: 0 0 3px 0 black;
        position: relative;
        width: 450px;
        background: #1b2838;
        padding: 1rem;
        color: white;
        margin: 1rem;
    }

    .icon {
        padding: 1rem;
        position: absolute;
        right: 0;
        top: 0;
    }
}
</style>

<script lang="ts" scoped>
import { defineComponent, PropType } from 'vue';
import AppIcon from '@/components/Helpers/AppIcon.vue';
import { ModalCloser, TranslationSet } from '@/lib/types';
import { resolveTSet } from '@/lib/util';

export default defineComponent({
    components: {
        AppIcon,
    },
    props: {
        header: {
            type: [String, Array] as PropType<TranslationSet<'header'>>,
            required: false,
        },
        id: {
            type: String,
            required: true,
        },
        closers: {
            type: Array as PropType<ModalCloser[]>,
            default: () => ['outside', 'times'],
        },
    },
    computed: {
        _header(): string {
            if (!this.header) {
                return '';
            }

            return this.$_(...resolveTSet('header', this.header));
        },
    },
    methods: {
        close() {
            this.$store.commit('closeModal', this.id);
        },
        closeOutside(e: MouseEvent) {
            if (
                !this.closers.includes('outside') ||
                e.target !== this.$refs.outside
            ) {
                return;
            }

            this.close();
        },
    },
});
</script>
