<template>
    <div class="header">
        <div class="avatar-group">
            <Avatar :account="account" />
            <div v-if="account.steamID" class="status-select online">
                <AppDropdown
                    :options="pStates"
                    :modelValue="pState"
                    placeholderFormat="status"
                    :beforeSelect="selectStatus"
                />
            </div>
        </div>
        <div class="info">
            <div class="name-group">
                <h5>
                    {{ account.info.name || account.username }}
                </h5>
                <span v-if="account.info.name" class="username">
                    {{ account.username }}
                </span>
            </div>

            <div class="status-group">
                <AccountStatus :account="account" :status="status" />

                <div v-if="account.steamID" class="btn-group">
                    <transition name="fade" :duration="300" mode="out-in">
                        <BoostBtn
                            v-if="account.appIds.length"
                            :account="account"
                        />
                    </transition>

                    <transition name="fade" :duration="300" mode="out-in">
                        <AppButton
                            v-if="!account.loggedIn"
                            :async="true"
                            :click="logOn"
                            t="_logOn"
                        />

                        <AppButton
                            v-else-if="
                                account.appIds.length === 0 || !account.launched
                            "
                            :async="true"
                            :click="logOff"
                            class="secondary"
                            t="logOff"
                        />
                    </transition>
                </div>
                <div v-else class="btn-group">
                    <AppButton
                        :click="proceed"
                        t="logOnContinue"
                        class="success"
                    />

                    <AppButton
                        :click="deleteIncomplete"
                        t="deleteAccount"
                        class="danger"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="less" scoped>
@import (reference) '../../assets/global.less';

.avatar-group {
    position: relative;
    min-height: 100%;
}

.status-select {
    margin-top: 0.5rem;
    position: absolute;
    width: 100%;
    top: 100%;
    left: 0;

    .dropdown {
        transform: translateX(-1rem);
        min-width: 100%;

        &:deep(.ph b) {
            color: var(--status);
        }
    }
}

.header {
    display: flex;
    color: white;
    position: relative;
    .gap(2rem);

    .info {
        display: inline-flex;
        flex-direction: column;
        max-width: calc(100% - 168px - 2rem);

        .btn-group {
            margin-top: auto;
            display: inline-flex;
            .gap(2rem);
        }
    }

    .status-group {
        display: flex;
        flex-direction: column;
        height: 100%;
    }

    .avatar {
        width: 164px;
        height: 164px;
    }

    h5 {
        font-size: 1.5rem;
        font-weight: 200;
        line-height: 125%;
        margin-bottom: 0.25rem;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
        max-width: 100%;
    }

    .username {
        color: rgba(255, 255, 255, 0.65);
        font-weight: 100;
        letter-spacing: 1px;
        font-size: 0.85rem;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
        max-width: 100%;
        display: block;
    }

    .account-status {
        margin: 1rem 0;
        text-align: justify;
    }
}

@media (max-width: 768px) {
    @avatarSize: 125px;

    .header {
        .gap(1rem);

        .avatar-group .avatar {
            width: @avatarSize;
            height: @avatarSize;
        }

        .info {
            max-width: calc(100% - @avatarSize - 4px - 1rem);

            h5 {
                font-size: 1.25rem;
            }

            .btn-group {
                .gap(1rem);
                flex-wrap: wrap;
            }
        }
    }
}

@media (max-width: 576px) {
    @avatarSize: 92px;

    .header {
        .gap(0);

        .name-group {
            min-height: @avatarSize;
            padding: 2px 0;
            width: calc(100% - @avatarSize - 4px - 1rem);
            margin-left: auto;
        }

        .avatar-group {
            .avatar {
                width: @avatarSize;
                height: @avatarSize;
                position: absolute;
            }
        }

        .info {
            width: 100%;
            max-width: unset;

            h5 {
                font-size: 1.1rem;
            }

            .btn-group {
                flex-wrap: nowrap;
            }
        }
    }
}
</style>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import AppButton from '@/components/Form/AppButton.vue';
import { Account, DropdownOption } from '@/lib/types';
import Avatar from '@/components/Helpers/Avatar.vue';
import AccountStatus from '@/components/Helpers/AccountStatus.vue';
import BoostBtn from '@/components/Helpers/BoostBtn.vue';
import { EAccountStatus, EPersonaState } from '@/lib/enums';
import AppDropdown from '../Form/AppDropdown.vue';
import { ApiErr } from '@shared/types';

export default defineComponent({
    components: {
        Avatar,
        AccountStatus,
        AppButton,
        BoostBtn,
        AppDropdown,
    },
    props: {
        account: {
            type: Object as PropType<Account>,
            required: true,
        },
        status: {
            type: String as PropType<EAccountStatus>,
            required: true,
        },
    },
    computed: {
        pState(): string {
            return this.account.personaState + '';
        },
        pStates(): DropdownOption[] {
            const keys = Object.keys(EPersonaState);
            const result: DropdownOption[] = [];

            for (let i = 0; i < keys.length / 2; i++) {
                result.push({
                    key: keys[i],
                    text: `personaState.${keys[i]}`,
                });
            }

            return result;
        },
    },
    methods: {
        async logOn() {
            const result = await this.$api.account.logOn(this.account.id);

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
        async logOff() {
            await this.$api.account.logOff(this.account.id);
        },
        async proceed() {
            this.$modal.show('LogOn', {
                initialUsername: this.account.username,
                type: 'relogon',
            });
        },
        deleteIncomplete() {
            this.$modal.confirmAsync(
                ['removeAccount', [this.account.username]],
                async () => {
                    await this.$api.account.delete(this.account.id);

                    this.$router.push('/');
                },
            );
        },
        async selectStatus(key: string) {
            const status = parseInt(key);

            const result = await this.$api.account.personaState(
                this.account.id,
                status as EPersonaState,
            );

            if (!result?.success) {
                return false;
            }
        },
    },
});
</script>
