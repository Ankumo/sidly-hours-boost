<template>
    <form class="form" ref="form">
        <AppInput
            placeholder="username"
            v-model="username"
            required
            min="3"
            maxlength="30"
            @keypress.enter="focusPassword"
        />
        <AppInput
            placeholder="password"
            v-model="password"
            required
            min="5"
            maxlength="30"
            type="password"
            ref="password"
            @keypress.enter="submit"
        />
        <AppButton t="signIn" :click="signIn" :async="true" ref="submitBtn" />
    </form>
</template>

<style lang="less" scoped>
@import (reference) '../../assets/global.less';

.form {
    display: inline-flex;
    margin: 2rem;

    .gap(2rem);
}

@media (max-width: 768px) {
    .form {
        position: absolute;
        width: 200px;
        margin: auto;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        flex-direction: column;
        .gapTop(1.25rem);
        align-items: center;
        justify-content: center;

        input,
        button {
            width: 100%;
        }
    }
}
</style>

<script lang="ts">
import { defineComponent } from 'vue';
import AppInput from '@/components/Form/AppInput.vue';
import AppButton from '@/components/Form/AppButton.vue';
import { setCookie } from '@/lib/util';

export default defineComponent({
    components: {
        AppInput,
        AppButton,
    },
    data() {
        return {
            username: '',
            password: '',
        };
    },
    methods: {
        async signIn() {
            const form = this.$refs.form as HTMLFormElement;

            if (!form.reportValidity()) {
                return;
            }

            const result = await this.$api.login(this.username, this.password);

            if (result?.success) {
                setCookie('session_hash', result.data.hash, {
                    expires: new Date(result.data.expires),
                });

                this.$alert.success('successfullyLoggedIn');

                location.href = '/';
            }
        },
        focusPassword() {
            const input = this.$refs.password as typeof AppInput;
            input.$el.focus();
        },
        submit() {
            const btn = this.$refs.submitBtn as typeof AppButton;
            btn.onClick();
        },
    },
});
</script>
