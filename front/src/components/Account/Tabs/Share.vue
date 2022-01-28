<template>
    <div class="share">
        <span class="text">
            {{ $_('other.shareHelp') }}
        </span>

        <form class="add-user" ref="form" @submit.prevent="triggerSubmit">
            <AppInput
                placeholder="username"
                v-model="username"
                required
                minlength="3"
                maxlength="30"
            />
            <AppButton
                t="share"
                :async="true"
                :click="share"
                class="success"
                ref="submitBtn"
            />
        </form>

        <div class="users" v-if="account.sharedWith.length">
            <span class="text">{{ $_('other.accountSharedWith') }}:</span>

            <div class="users-list">
                <ShareUser
                    v-for="user in account.sharedWith"
                    :key="user.id"
                    :user="user"
                    @delete="unshare(user)"
                />
            </div>
        </div>
        <NoItems v-else t="noSharedUsers" class="not-shared" />
    </div>
</template>

<style lang="less" scoped>
.share {
    .text {
        color: rgba(255, 255, 255, 0.65);
        display: block;
        margin-bottom: 2rem;
        text-align: justify;
    }

    .add-user {
        display: flex;
        gap: 2rem;
        align-items: center;
        margin-bottom: 2rem;
        flex-wrap: wrap;
    }

    .users {
        .text {
            margin-bottom: 1rem;
        }

        .users-list {
            display: flex;
            gap: 1rem;
            flex-wrap: wrap;
            align-items: center;
        }
    }

    .not-shared {
        align-items: flex-start;
        justify-content: flex-start;
    }
}
</style>

<script lang="ts">
import { Account, User } from '@/lib/types';
import { defineComponent, PropType } from 'vue';
import ShareUser from '../ShareUser.vue';
import NoItems from '@/components/Helpers/NoItems.vue';
import AppInput from '../../Form/AppInput.vue';
import AppButton from '../../Form/AppButton.vue';

export default defineComponent({
    components: { ShareUser, NoItems, AppInput, AppButton },
    props: {
        account: {
            type: Object as PropType<Account>,
            required: true,
        },
    },
    data() {
        return {
            username: '',
        };
    },
    methods: {
        unshare(user: User) {
            this.$modal.confirmAsync(
                ['unshare', [this.account.username, user.username]],
                async () => {
                    await this.$api.account.toggleShare(
                        this.account.id,
                        user.username,
                    );
                },
            );
        },
        async share() {
            const form = this.$refs.form as HTMLFormElement;

            if (!form.reportValidity()) {
                return;
            }

            const result = await this.$api.account.toggleShare(
                this.account.id,
                this.username,
            );

            if (result?.success) {
                this.username = '';
            }
        },
        triggerSubmit() {
            const btn = this.$refs.submitBtn as typeof AppButton;
            btn.onClick();
        },
    },
});
</script>
