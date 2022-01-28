<template>
    <transition name="fade" :duration="300" mode="out-in">
        <div class="account-status" :key="statusText">
            {{ statusText }}
        </div>
    </transition>
</template>

<style lang="less" scoped>
.account-status {
    color: var(--status);
}
</style>

<script lang="ts">
import { EAccountStatus, EPersonaState } from '@/lib/enums';
import { Account } from '@/lib/types';
import { StringMap } from '@shared/types';
import { defineComponent, PropType } from 'vue';

export default defineComponent({
    props: {
        account: {
            type: Object as PropType<Account>,
            required: true,
        },
        status: {
            type: String as PropType<EAccountStatus>,
            required: true,
        },
        compact: {
            type: Boolean,
            default: false,
        },
    },
    computed: {
        statusText(): string {
            if (!this.account.steamID) {
                return this.compact ? '' : this.$_('accountTitle.notComplete');
            }

            switch (this.status) {
                case EAccountStatus.Boosting:
                    if (this.compact) {
                        return this.$tc(
                            'accountTitle.boostingSmall',
                            this.account.appIds.length,
                        );
                    } else {
                        if (this.account.appIds.length === 0) {
                            return this.$tc('accountTitle.boostingSmall', 0);
                        }

                        const apps: number[] = [...this.account.appIds];

                        const index = apps.indexOf(this.account.title.mainApp);

                        if (~index) {
                            const tmp = apps[0];
                            apps[0] = apps[index];
                            apps[index] = tmp;
                        }

                        const pick = (count: number): StringMap<string> => {
                            const map: StringMap<string> = {};

                            for (let i = 0; i < count; i++) {
                                map[`game${i + 1}`] =
                                    this.$store.getters.getAppName(apps[i]);
                            }

                            return map;
                        };

                        if (apps.length < 4) {
                            return this.$_(
                                `accountTitle.boosting_${apps.length}`,
                                pick(apps.length),
                            );
                        } else {
                            return this.$tc(
                                'accountTitle.boosting_n',
                                apps.length - 2,
                                pick(2),
                            );
                        }
                    }
                case EAccountStatus.InGame:
                    return this.$_(`accountTitle.playing`, [
                        this.$store.getters.getAppName(
                            this.account.activeAppId,
                        ),
                    ]);
                case EAccountStatus.Offline:
                    if (this.compact) {
                        return '';
                    }

                    return this.$_(`accountStatus.${this.status}`);
                case EAccountStatus.Online:
                    return this.$_(
                        `personaState.${
                            this.compact
                                ? this.account.personaState
                                : EPersonaState.Online
                        }`,
                    );
                default:
                    return '???';
            }
        },
    },
});
</script>
