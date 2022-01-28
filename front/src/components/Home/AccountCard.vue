<template>
    <div
        class="account-card"
        @click.left="openAccount"
        @mouseleave="mouseLeave"
        @mouseenter="mouseEnter"
    >
        <SteamBg
            v-if="Object.keys(account.info.miniBg || {}).length"
            :item="account.info.miniBg"
            @ready="videoReady"
        />

        <SteamBg
            v-else
            :item="account.info.bg"
            :fallback="fallbackBg"
            @ready="videoReady"
        />

        <BoostBtn
            v-if="account.appIds.length"
            :account="account"
            :compact="true"
        />

        <div class="user-info">
            <Avatar :account="account" />
            <div class="info">
                <h5>
                    {{ account.info.name || account.username }}
                </h5>
                <span v-if="account.info.name">
                    {{ account.username }}
                </span>

                <AccountStatus
                    :status="status"
                    :account="account"
                    :compact="true"
                />
            </div>
        </div>
    </div>
</template>

<style lang="less" scoped>
.account-card {
    text-decoration: none;
    position: relative;
    overflow: hidden;
    border-radius: 4px;
    z-index: 5;
    padding: 1rem;
    box-shadow: 0 0 4px 0 black;
    cursor: pointer;

    .card-bg {
        transition: background 0.4s;
    }

    .fallback {
        display: block;
        position: absolute;
    }

    &::after {
        content: '';
        position: absolute;
        z-index: -1;
        backdrop-filter: blur(1px);
        background: rgba(0, 0, 0, 0.55);
        width: 100%;
        height: 100%;
        left: 0;
        top: 0;
        display: block;
        transition: background 0.4s;
    }

    &:hover {
        .btn {
            opacity: 1;
        }

        &::after {
            background: rgba(0, 0, 0, 0.35);
        }
    }

    .btn {
        position: absolute;
        right: 1rem;
        bottom: 1rem;
        opacity: 0;
        transition: opacity 0.4s;
    }
}

.user-info {
    display: inline-flex;
    align-items: flex-start;
    justify-content: flex-start;
    gap: 1rem;
    width: 100%;

    .info {
        display: inline-flex;
        flex-direction: column;
        gap: 0.125rem;
        overflow: hidden;
        flex: 0 0 calc(100% - 1rem - 100px);

        h5 {
            color: white;
            font-size: 1.125rem;
            font-weight: 300;
            letter-spacing: 1px;
            white-space: nowrap;
            text-overflow: ellipsis;
            overflow: hidden;
            line-height: 125%;
            margin-bottom: 0.25rem;
        }

        span {
            white-space: nowrap;
            text-overflow: ellipsis;
            overflow: hidden;
            color: rgba(255, 255, 255, 0.65);
            font-size: 0.875rem;
            font-weight: 300;
        }

        .account-status {
            margin-top: 0.75rem;
        }
    }
}

@media (max-width: 768px) {
    .account-card .user-info {
        h5 {
            line-height: 110%;
            margin-bottom: 0;
        }

        .account-status {
            margin-top: 0.25rem;
        }
    }
}

@media (max-width: 450px) {
    @avatarNewSize: 84px;

    .account-card .user-info {
        span {
            display: none;
        }

        .avatar {
            width: @avatarNewSize;
            height: @avatarNewSize;
        }

        .info {
            gap: 0;
            flex: 0 0 calc(100% - 1rem - @avatarNewSize);
        }
    }
}

@media (hover: none) {
    .account-card {
        .btn {
            opacity: 1;
        }

        &::after {
            background: rgba(0, 0, 0, 0.55) !important;
        }
    }
}
</style>

<script lang="ts">
import { Account } from '@/lib/types';
import { defineComponent, PropType } from 'vue';
import SteamBg from '../Helpers/SteamBg.vue';
import Avatar from '../Helpers/Avatar.vue';
import BoostBtn from '../Helpers/BoostBtn.vue';
import AccountStatus from '../Helpers/AccountStatus.vue';
import { EAccountStatus } from '@/lib/enums';

export default defineComponent({
    components: {
        SteamBg,
        Avatar,
        BoostBtn,
        AccountStatus,
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
    data() {
        return {
            video: null as null | HTMLVideoElement,
        };
    },
    computed: {
        link(): string {
            return `/account/${this.account.username}`;
        },
        fallbackBg(): string {
            return require(`@/assets/default-profile-bg.jpg`);
        },
    },
    methods: {
        openAccount() {
            this.$store.commit('setBg', {
                rect: this.$el.getBoundingClientRect(),
                bg: this.account.info.bg,
            });

            this.$router.push(this.link);
        },
        mouseEnter() {
            if (this.video) {
                this.video.play();
            }
        },
        mouseLeave() {
            if (this.video) {
                this.video.pause();
            }
        },
        videoReady(el: HTMLVideoElement) {
            this.video = el;
        },
    },
});
</script>
