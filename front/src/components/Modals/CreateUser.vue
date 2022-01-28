<template>
    <Modal header="createUser" :id="id" class="create-user">
        <form ref="form">
            <AppInput
                placeholder="username"
                v-model="username"
                required
                minlength="3"
                maxlength="30"
                @keypress.enter="focusPassword"
            />
            <AppInput
                placeholder="password"
                type="password"
                v-model="password"
                required
                minlength="5"
                maxlength="30"
                ref="password"
                @keypress.enter="submit"
            />
        </form>
        <template #footer>
            <AppButton
                t="create"
                :async="true"
                :click="create"
                class="success"
                ref="submitBtn"
            />
        </template>
    </Modal>
</template>

<style lang="less" scoped>
@import (reference) '../../assets/global.less';

.modal {
    &:deep(.modal-wrapper) {
        width: 400px;
    }

    &:deep(.modal-body) {
        margin: 2rem 0;

        form {
            display: flex;
            flex-direction: column;
            .gapTop(1rem);
            align-items: center;

            input {
                width: 250px;
            }
        }
    }

    &:deep(.modal-footer button) {
        float: right;
    }
}
</style>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import Modal from './Modal.vue';
import AppButton from '../Form/AppButton.vue';
import AppInput from '../Form/AppInput.vue';
import { User } from '@/lib/types';

export default defineComponent({
    components: {
        Modal,
        AppButton,
        AppInput,
    },
    props: {
        id: {
            type: String,
            required: true,
        },
        onCreate: {
            type: Function as PropType<(user: User) => void>,
            required: false,
        },
    },
    data() {
        return {
            username: '',
            password: '',
        };
    },
    methods: {
        async create() {
            const form = this.$refs.form as HTMLFormElement;

            if (!form.reportValidity()) {
                return;
            }

            const result = await this.$api.user.create(
                this.username,
                this.password,
            );

            if (result?.success) {
                this.$alert.success(['userCreated', [this.username]]);

                if (this.onCreate) {
                    this.onCreate(result.data);
                }

                this.$store.commit('closeModal', this.id);
            }
        },
        submit() {
            const btn = this.$refs.submitBtn as typeof AppButton;
            btn.onClick();
        },
        focusPassword() {
            const input = this.$refs.password as typeof AppInput;
            input.$el.focus();
        },
    },
});
</script>
