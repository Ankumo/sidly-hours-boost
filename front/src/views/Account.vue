<template>
    <RouteLoader
        v-if="account"
        :fetch="fetch"
        :class="[status, { shared: !!sharedBy }]"
    >
        <AccountHeader :account="account" :status="status" />
        <AccountTabs :account="account" v-if="account.steamID" />
        <i18n-t
            v-if="sharedBy"
            class="shared-info"
            tag="div"
            scope="global"
            keypath="other.accountSharedBy"
        >
            <b>{{ sharedBy }}</b>
        </i18n-t>
    </RouteLoader>
</template>

<style lang="less" scoped>
.route-body:not(.loader) {
    background: rgba(24, 24, 24, 0.93);
    padding: 2rem;
    display: flex;
    flex-direction: column;

    &.shared:deep(.account-tab) {
        padding-bottom: 2rem;
    }
}

.shared-info {
    color: white;
    position: absolute;
    bottom: 0.5rem;
    left: 0;
    width: 100%;
    text-align: center;
}

@media (max-width: 768px) {
    .route-body {
        padding: 1rem !important;
    }
}
</style>

<script lang="ts">
import { defineComponent } from 'vue';
import { Account, RouteFetcher } from '@/lib/types';
import RouteLoader from '@/components/Loaders/RouteLoader.vue';
import { getAccountStatus } from '@/lib/util';
import AccountHeader from '@/components/Account/AccountHeader.vue';
import AccountTabs from '@/components/Account/AccountTabs.vue';
import { EAccountStatus } from '@/lib/enums';
import { store } from '@/main';

export default defineComponent({
    components: {
        RouteLoader,
        AccountHeader,
        AccountTabs,
    },
    beforeRouteLeave() {
        store.commit('setBg', null);
    },
    methods: {
        async fetch(): ReturnType<RouteFetcher> {
            if (!this.account) {
                return '404';
            }

            if (!this.$store.state.bg) {
                this.$store.commit('setBg', {
                    rect: {
                        x: 0,
                        y: 0,
                        width: window.innerWidth,
                        height: window.innerHeight,
                    },
                    bg: this.account.info?.bg || null,
                });
            }

            if (this.account.appIds.length) {
                await store.dispatch('fetchApps', this.account);
            }

            return false;
        },
    },
    computed: {
        account(): Account {
            return this.$store.getters.getAccount(this.$route.params.username);
        },
        status(): EAccountStatus {
            return getAccountStatus(this.account);
        },
        sharedBy(): string | undefined {
            if (
                this.account.ownerId === this.$store.state.user.id ||
                !this.account.owner?.username
            ) {
                return undefined;
            }

            return this.account.owner.username;
        },
    },
    watch: {
        account: {
            deep: true,
            handler(n) {
                if (!n) {
                    this.$router.push('/');
                }
            },
        },
    },
});
</script>
