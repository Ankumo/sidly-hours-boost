<template>
    <div class="delete">
        <span class="warning">
            {{ $_('other.accountDeleteHelp', [keyWord]) }}
        </span>

        <form class="input-group" ref="form" @submit.prevent="deleteAccount">
            <AppInput v-model="safe" ref="input" />
            <AppButton
                :click="deleteAccount"
                t="deleteAccount"
                class="danger"
            />
        </form>
    </div>
</template>

<style lang="less" scoped>
.delete {
    span {
        margin-bottom: 1rem;
        display: block;
        color: var(--accent);
        line-height: 145%;
        text-align: justify;
    }

    .input-group {
        max-width: 200px;

        .danger {
            margin-top: 1rem;
        }
    }
}
</style>

<script lang="ts">
import { Account } from '@/lib/types';
import { defineComponent, PropType } from 'vue';
import AppInput from '../../Form/AppInput.vue';
import AppButton from '../../Form/AppButton.vue';

export default defineComponent({
    components: { AppInput, AppButton },
    props: {
        account: {
            type: Object as PropType<Account>,
            required: true,
        },
    },
    data() {
        return {
            safe: '',
        };
    },
    computed: {
        keyWord(): string {
            return this.$_('other.deleteKeyword');
        },
    },
    methods: {
        deleteAccount() {
            if (this.safe !== this.keyWord) {
                this.setInputValidity(this.$_('other.keywordIncorrect'));

                const form = this.$refs.form as HTMLFormElement;
                form.reportValidity();
                return;
            }

            this.$modal.confirmAsync(
                ['removeAccount', [this.account.username]],
                async () => {
                    const result = await this.$api.account.delete(
                        this.account.id,
                    );

                    if (result?.success) {
                        //this.$router.push('/');
                    }
                },
            );
        },
        setInputValidity(text = '') {
            const input = this.$refs.input as typeof AppInput;
            input.$el.setCustomValidity(text);
        },
    },
    watch: {
        safe() {
            this.setInputValidity();
        },
    },
});
</script>
