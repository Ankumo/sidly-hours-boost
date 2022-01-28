<template>
    <div class="account-tabs">
        <ul>
            <li
                v-for="tab in tabs"
                :key="tab"
                :class="{ active: activeTab === tab }"
                @click.left="activeTab = tab"
            >
                {{ $_(`accountTab.${tab}`) }}
            </li>
        </ul>
    </div>
    <transition name="fade" :duration="{ enter: 400, leave: 1 }" appear>
        <keep-alive>
            <component :is="activeTab" :account="account" class="account-tab" />
        </keep-alive>
    </transition>
</template>

<style lang="less" scoped>
@import (reference) '../../assets/global.less';

.account-tabs {
    margin-top: 4rem;

    ul {
        display: flex;
        list-style: none;
        width: 100%;
        align-items: center;
        .gap(1rem);
        color: rgba(255, 255, 255, 0.65);
        transform: translateX(-1rem);

        li {
            cursor: pointer;
            font-size: 1.3rem;
            font-weight: 100;
            transition: color 0.3s;
            position: relative;
            padding: 0 1rem;
            box-sizing: border-box;

            &.active {
                color: white;

                &::after {
                    width: calc(100% - 0.25rem);
                    opacity: 1;
                }
            }

            &:hover {
                color: white;
            }

            &::after {
                content: '';
                display: block;
                transition: width 0.3s, opacity 0.3s;
                opacity: 0;
                width: 0;
                height: 2px;
                margin: 0 auto;
                bottom: -4px;
                left: 0;
                background: white;
            }
        }
    }
}

.account-tab {
    padding-top: 2rem;
}

@media (max-width: 768px) {
    .account-tabs {
        ul {
            flex-wrap: wrap;
            justify-content: center;
            transform: unset;

            li {
                font-size: 1.15rem;
                text-align: center;
            }
        }
    }
}

@media (max-width: 576px) {
    .account-tabs ul li {
        font-size: 1.05rem;
    }
}
</style>

<script lang="ts">
import { EAccountTab } from '@/lib/enums';
import { Account } from '@/lib/types';
import { defineComponent, PropType } from 'vue';
import GamesList from './Tabs/GamesList.vue';
import Title from './Tabs/Title.vue';
import Share from './Tabs/Share.vue';
import Delete from './Tabs/Delete.vue';

export default defineComponent({
    components: {
        GamesList,
        Title,
        Share,
        Delete,
    },
    props: {
        account: {
            type: Object as PropType<Account>,
            required: true,
        },
    },
    data() {
        return {
            activeTab: EAccountTab.GamesList,
            EAccountTab,
        };
    },
    computed: {
        tabs(): EAccountTab[] {
            if (this.account.ownerId === this.$store.state.user.id) {
                return [
                    EAccountTab.GamesList,
                    EAccountTab.Title,
                    EAccountTab.Share,
                    EAccountTab.Delete,
                ];
            }

            return [
                EAccountTab.GamesList,
                EAccountTab.Title,
                EAccountTab.Delete,
            ];
        },
    },
});
</script>
