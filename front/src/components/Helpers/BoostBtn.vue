<template>
    <transition name="fade" :duration="300" mode="out-in">
        <AppButton
            v-if="account.launched"
            :async="true"
            :click="logOff"
            class="secondary"
            t="logOff"
        />

        <AppButton v-else :async="true" :click="start" t="startBoost" />
    </transition>
</template>

<script lang="ts" scoped>
import { EAccountStatus } from '@/lib/enums';
import { Account } from '@/lib/types';
import { getAccountStatus } from '@/lib/util';
import { ApiErr } from '@shared/types';
import { defineComponent, PropType } from 'vue';
import AppButton from '../Form/AppButton.vue';

export default defineComponent({
    components: { AppButton },
    props: {
        account: {
            type: Object as PropType<Account>,
            required: true,
        },
        compact: {
            type: Boolean,
            default: false,
        },
    },
    computed: {
        status(): EAccountStatus {
            return getAccountStatus(this.account);
        },
    },
    methods: {
        async start(e: MouseEvent) {
            e.stopImmediatePropagation();

            const result = await this.$api.account.runBoost(this.account.id);

            if (!result) {
                return;
            }

            if (!result.success && result.errCode === ApiErr.BotNeedRelogon) {
                this.$modal.show('LogOn', {
                    initialResult: result.data?.logOnResult,
                    type: 'relogon',
                    initialUsername: this.account.username,
                });
            }
        },
        async logOff(e: MouseEvent) {
            e.stopImmediatePropagation();

            await this.$api.account.logOff(this.account.id);
        },
    },
});
</script>
