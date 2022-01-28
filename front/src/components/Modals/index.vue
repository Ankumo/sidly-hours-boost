<template>
    <transition-group name="modals" tag="div" class="modals">
        <component
            v-for="modal in modals"
            :key="modal.id"
            :is="modal.component"
            v-bind="getProps(modal)"
        />
    </transition-group>
</template>

<style lang="less" scoped>
.modals-enter-active,
.modals-leave-active {
    transition: opacity 0.3s;

    &:deep(.modal-wrapper) {
        transition: transform 0.3s ease;
    }
}

.modals-enter-from,
.modals-leave-to {
    opacity: 0;

    &:deep(.modal-wrapper) {
        transform: scale(0.95);
    }
}
</style>

<script lang="ts">
import { defineComponent } from 'vue';
import Confirm from '@/components/Modals/Confirm.vue';
import LogOn from './LogOn.vue';
import MessageBox from './MessageBox.vue';
import Settings from './Settings.vue';
import CreateUser from './CreateUser.vue';
import { ModalModel } from '@/lib/types';
import { StringMap } from '@shared/types';

export default defineComponent({
    components: {
        Confirm,
        LogOn,
        MessageBox,
        Settings,
        CreateUser,
    },
    computed: {
        modals(): ModalModel<any>[] {
            return this.$store.state.modals;
        },
    },
    methods: {
        getProps(modal: ModalModel<any>) {
            const result: StringMap<any> = {
                id: modal.id,
            };

            if (modal.header) {
                result.header = modal.header;
            }

            return {
                ...result,
                ...modal.props,
            };
        },
    },
});
</script>
