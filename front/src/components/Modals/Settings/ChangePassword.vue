<template>
    <div class="change-password">
        <form ref="form">
            <AppInput
                placeholder="oldPassword"
                type="password"
                v-model="oldPassword"
                required
                minlength="5"
                maxlength="30"
                class="oldPassword"
            />
            <AppInput
                placeholder="newPassword"
                type="password"
                v-model="newPassword"
                required
                minlength="5"
                maxlength="30"
            />
            <AppInput
                placeholder="newPasswordConfirm"
                type="password"
                v-model="newPasswordConfirm"
                required
                minlength="5"
                maxlength="30"
                ref="input"
            />
            <AppButton
                t="changePassword"
                :async="true"
                :click="save"
                class="success"
            />
        </form>
    </div>
</template>

<style lang="less" scoped>
@import (reference) '../../../assets/global.less';

.change-password {
    form {
        display: flex;
        flex-direction: column;
        .gapTop(1rem);

        input {
            width: 100%;
        }

        .oldPassword {
            margin-bottom: 1rem;
        }
    }
}
</style>

<script lang="ts">
import { defineComponent } from 'vue';
import AppInput from '../../Form/AppInput.vue';
import AppButton from '../../Form/AppButton.vue';
import { User } from '@/lib/types';

export default defineComponent({
    components: { AppInput, AppButton },
    data() {
        return {
            oldPassword: '',
            newPassword: '',
            newPasswordConfirm: '',
        };
    },
    computed: {
        me(): User {
            return this.$store.state.user;
        },
    },
    methods: {
        async save() {
            const form = this.$refs.form as HTMLFormElement;

            if (!form.reportValidity()) {
                return;
            }

            if (this.newPassword !== this.newPasswordConfirm) {
                this.setInputValidity(
                    this.$_('settings.passwordConfirmIncorrect'),
                );

                form.reportValidity();
                return;
            }

            const result = await this.$api.user.changePassword(
                this.newPassword,
                this.oldPassword,
            );

            if (result?.success) {
                this.newPasswordConfirm = '';
                this.newPassword = '';
                this.oldPassword = '';

                this.$alert.success('passwordChanged');
            }
        },
        setInputValidity(text = '') {
            const input = this.$refs.input as typeof AppInput;
            input.$el.setCustomValidity(text);
        },
    },
    watch: {
        newPassword() {
            this.setInputValidity();
        },
        newPasswordConfirm() {
            this.setInputValidity();
        },
    },
});
</script>
