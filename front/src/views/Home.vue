<template>
    <div class="route-body">
        <div class="header">
            <i18n-t keypath="other.welcome" tag="h3" scope="global">
                <b>{{ me.nickname }}</b>
            </i18n-t>

            <AppButton
                class="success"
                :click="openAddAccountModal"
                t="addAccount"
            />
        </div>

        <transition mode="out-in" name="fade" :duration="250" appear>
            <div v-if="Object.keys(accounts).length" class="home-wrapper">
                <div class="sidebar">
                    <ul>
                        <li
                            v-for="(count, user) in accountTabs"
                            :key="user"
                            :class="{ active: user === selectedUser }"
                            @click.left="selectedUser = user"
                        >
                            {{
                                user === me.username
                                    ? $_('other.myAccounts')
                                    : user
                            }}
                            <span>
                                {{ count }}
                            </span>
                        </li>
                    </ul>
                </div>
                <div class="body">
                    <AccountsList :items="selectedAccounts" />
                </div>
            </div>
            <NoItems
                v-else
                t="noAccounts"
                :calcH="noAccountsH"
                class="no-accounts"
            />
        </transition>
    </div>
</template>

<style lang="less" scoped>
@import (reference) '../assets/global.less';

.route-body {
    padding-top: 1rem;
}

.home-wrapper {
    display: flex;
    align-items: flex-start;
    .gap(1rem);
}

.header {
    margin: 1rem 0 2rem 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .gap(1rem);

    h3 {
        color: rgba(230, 230, 230, 0.95);
        font-size: 2rem;
        font-weight: 400;

        b {
            color: white;
            font-weight: 600;
        }
    }
}

.sidebar {
    width: 230px;
    flex: 0 0 auto;

    ul {
        display: flex;
        list-style: none;
        width: 100%;
        flex-direction: column;

        li {
            color: rgba(255, 255, 255, 0.65);
            cursor: pointer;
            border-radius: 4px;
            padding: 0.75rem 1.25rem;
            width: 100%;
            transition: background 0.3s, transform 0.3s, color 0.3s;
            font-weight: 400;
            display: inline-flex;
            align-items: baseline;
            justify-content: space-between;
            box-sizing: border-box;

            span {
                color: rgba(255, 255, 255, 0.75);
                font-size: 0.75rem;
                font-weight: 200;
                font-variant-numeric: tabular-nums;
                display: block;
                line-height: 1;
            }

            &:hover {
                background: rgba(255, 255, 255, 0.15);
                color: white;
            }

            &:not(.active):active {
                transform: scale(0.97);
            }

            &.active {
                background: rgba(255, 255, 255, 0.2);
                backdrop-filter: blur(20px);
                user-select: none;
                color: white;
            }
        }
    }
}

.body {
    flex: auto;
    overflow: hidden;
}

.no-accounts {
    font-size: 1.75rem;
    letter-spacing: 1.5px;
    font-weight: 500;
}

@media (max-width: 768px) {
    .header h3 {
        font-size: 1.5rem;
    }

    .home-wrapper {
        flex-wrap: wrap;
        .gapTop(2rem);

        @supports not (gap: 2rem) {
            & > * + * {
                margin-left: 0;
            }
        }

        .sidebar {
            flex: 0 0 100%;

            ul {
                flex-direction: row;
                flex-wrap: wrap;
                .gap(1rem);

                li {
                    width: auto;

                    span {
                        flex-shrink: 0;
                        flex-grow: 0;
                        margin-left: 1rem;
                    }
                }
            }
        }

        .body {
            flex: 0 0 100%;
        }
    }
}

@media (max-width: 450px) {
    .header {
        flex-wrap: wrap;

        h3 {
            font-size: 1.35rem;
            flex: 0 0 100%;
            text-align: center;
        }

        button {
            flex: 0 0 100%;
        }
    }
}
</style>

<script lang="ts">
import { Account, User } from '@/lib/types';
import { StringMap } from '@shared/types';
import { defineComponent } from 'vue';
import AccountsList from '@/components/Home/AccountsList.vue';
import AppButton from '@/components/Form/AppButton.vue';
import NoItems from '../components/Helpers/NoItems.vue';

export default defineComponent({
    name: 'Home',
    components: {
        AccountsList,
        AppButton,
        NoItems,
    },
    data() {
        return {
            selectedUser: '',
            lastPos: 0,
        };
    },
    computed: {
        accounts(): StringMap<Account[]> {
            return this.$store.state.accounts;
        },
        me(): User {
            return this.$store.state.user;
        },
        accountTabs(): StringMap<number> {
            const map: StringMap<number> = {};

            Object.keys(this.accounts)
                .sort((a) => (a !== this.me.username ? 1 : -1))
                .forEach((k) => (map[k] = this.accounts[k].length));

            return map;
        },
        selectedAccounts(): Account[] {
            return this.accounts[this.selectedUser] || [];
        },
    },
    methods: {
        openAddAccountModal() {
            this.$modal.show('LogOn');
        },
        noAccountsH(el: DOMRect) {
            return window.innerHeight - el.y;
        },
    },
    created() {
        const u = this.me.username;

        if (
            u &&
            Array.isArray(this.accounts[u]) &&
            this.accounts[u].length > 0
        ) {
            this.selectedUser = u;
        } else {
            const keys = Object.keys(this.accounts);

            if (keys.length > 0) {
                this.selectedUser = keys[0];
            }
        }
    },
    beforeRouteEnter(to, from, next) {
        next((vm: any) => {
            if (vm.lastPos) {
                document.body.scrollTo(0, vm.lastPos);
            }
        });
    },
    beforeRouteLeave() {
        this.lastPos = document.body.scrollTop;
    },
    watch: {
        accounts: {
            deep: true,
            handler(n: StringMap<Account[]>) {
                if (!n[this.selectedUser]) {
                    if (n[this.me.username]) {
                        this.selectedUser = this.me.username;
                    } else {
                        const keys = Object.keys(n);

                        if (keys.length) {
                            this.selectedUser = keys[0];
                        }
                    }
                }
            },
        },
    },
});
</script>
