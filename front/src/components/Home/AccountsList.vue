<template>
    <div class="accounts-list">
        <transition-group name="acc-tabs">
            <div
                v-for="(accounts, tab) in sortedAccounts"
                :key="tab"
                :class="['tab', tab]"
                v-show="accounts.length > 0"
            >
                <h5>
                    {{ $_(`accountStatus.${tab}`) }}
                </h5>
                <ul>
                    <transition-group name="acc-list">
                        <li v-for="acc in accounts" :key="acc.id">
                            <AccountCard :account="acc" :status="tab" />
                        </li>
                    </transition-group>
                </ul>
            </div>
        </transition-group>
    </div>
</template>

<style lang="less" scoped>
@import (reference) '../../assets/global.less';

.accounts-list {
    width: 100%;
    position: relative;
}

.acc-tabs-enter-from,
.acc-tabs-leave-to {
    opacity: 0;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
}

.acc-tabs-enter-active,
.acc-tabs-leave-active {
    transition: opacity 0.3s;
}

.acc-list-enter-from {
    opacity: 0;
    transform: scale(0);
    transform-origin: center center;
}

.acc-list-enter-active {
    transition: opacity 0.3s, transform 0.3s ease;
}

.tab {
    margin-bottom: 2rem;

    h5 {
        text-transform: uppercase;
        font-size: 1rem;
        font-weight: 500;
        margin-bottom: 0.5rem;
        color: var(--status);
    }

    ul {
        list-style: none;
        display: flex;
        flex-wrap: wrap;
        .gap(1rem);
        align-items: flex-start;

        li {
            flex: 0 0 calc(50% - 0.5rem);
            overflow: hidden;
        }
    }
}

@media (max-width: 992px) {
    .tab ul {
        .gapTop(1rem);

        @supports not (gap: 1rem) {
            & > * + * {
                margin-left: 0;
            }
        }

        li {
            flex: 0 0 100%;
        }
    }
}
</style>

<script lang="ts">
import { EAccountStatus } from '@/lib/enums';
import { Account } from '@/lib/types';
import { getAccountStatus } from '@/lib/util';
import { defineComponent, PropType } from 'vue';
import AccountCard from './AccountCard.vue';

export default defineComponent({
    components: {
        AccountCard,
    },
    props: {
        items: {
            type: Array as PropType<Account[]>,
            required: true,
        },
    },
    computed: {
        sortedAccounts(): Record<EAccountStatus, Account[]> {
            const map: Record<EAccountStatus, Account[]> = {
                [EAccountStatus.Boosting]: [],
                [EAccountStatus.InGame]: [],
                [EAccountStatus.Online]: [],
                [EAccountStatus.Offline]: [],
            };

            this.items.forEach((acc) => {
                const tab = getAccountStatus(acc);
                map[tab].push(acc);
            });

            return map;
        },
    },
});
</script>
