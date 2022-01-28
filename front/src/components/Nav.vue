<template>
    <div class="nav">
        <div class="nav-wrapper a-width">
            <div class="logo">
                <img src="../assets/logo.png" />
                Sidly
            </div>
            <transition name="back-btn">
                <router-link class="back" to="/" v-if="showBack">
                    <AppIcon name="chevron" />
                    {{ $_('other.backToHome') }}
                </router-link>
            </transition>
            <div class="right">
                <AppIcon
                    name="cog"
                    class="ihover"
                    :title="$_('title.settings')"
                    @click="openSettings"
                />

                <div
                    class="sign-out"
                    @click.left="signOut"
                    :title="$_('title.signOut')"
                >
                    <AppIcon class="ihover enter" name="portal-enter" />
                    <AppIcon class="ihover exit" name="portal-exit" />
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped lang="less">
@import (reference) '../assets/global.less';

.nav {
    background: #171a2177;
    padding: 1.25rem 1rem 1.25rem 0;
    backdrop-filter: blur(15px);
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    z-index: 10;
    box-sizing: border-box;

    .nav-wrapper {
        display: flex;
        align-items: center;
    }

    .logo {
        display: inline-flex;
        align-items: center;
        color: white;
        font-size: 1.4rem;
        font-weight: 400;
        letter-spacing: 1.5px;

        img {
            width: 36px;
            height: 36px;
            margin-right: 0.75rem;
        }
    }

    .back {
        cursor: pointer;
        color: rgb(118, 167, 212);
        text-decoration: none;
        font-size: 1.2rem;
        display: inline-flex;
        align-items: center;
        margin-left: 0.5rem;
        transition: opacity 0.3s;
        opacity: 0.6;

        &:hover {
            opacity: 1;
        }

        .icon {
            width: 18px;
            height: 18px;
            margin-right: 0.25rem;

            &:deep(*) {
                fill: rgb(118, 167, 212);
            }
        }
    }

    .right {
        display: inline-flex;
        align-items: center;
        margin-left: auto;
        .gap(1rem);

        .sign-out {
            width: 22px;
            height: 22px;
            cursor: pointer;
            position: relative;

            .icon {
                left: 0;
                top: 0;
                transition: transform 0.3s, opacity 0.3s;
                position: absolute;
            }

            .enter:deep(.fa-secondary) {
                fill: #db4f07;
            }

            .exit {
                transform: translateX(50%);
                opacity: 0;
                pointer-events: none;
                cursor: default;

                &:deep(.fa-secondary) {
                    fill: #0789db;
                }
            }

            &:hover {
                .enter {
                    opacity: 0;
                    pointer-events: none;
                    transform: translateX(-50%);
                    cursor: default;
                }

                .exit {
                    opacity: 1;
                    transform: translateX(0);
                    pointer-events: all;
                    position: relative;
                    cursor: pointer;
                }
            }
        }
    }
}

.back-btn-enter-active,
.back-btn-leave-active {
    transition: opacity 0.3s, transform 0.3s !important;
}

.back-btn-enter-from,
.back-btn-leave-to {
    opacity: 0 !important;
    transform: translateX(-15%);
}

@media (max-width: 768px) {
    .nav {
        padding: 1.25rem 0.8rem 1.25rem 0;
    }
}

@media (max-width: 576px) {
    .nav {
        .back {
            font-size: 1.05rem;
            margin-left: 0.35rem;

            .icon {
                width: 15px;
                height: 15px;
                margin-right: 0.2rem;
            }
        }

        .logo {
            font-size: 1.25rem;
            letter-spacing: 1px;

            img {
                margin-right: 0.5rem;
            }
        }
    }
}
</style>

<script lang="ts">
import { defineComponent } from 'vue';
import AppIcon from '@/components/Helpers/AppIcon.vue';
import { deleteCookie } from '@/lib/util';

export default defineComponent({
    name: 'Nav',
    components: {
        AppIcon,
    },
    computed: {
        showBack(): boolean {
            return this.$route.fullPath !== '/';
        },
    },
    methods: {
        signOut() {
            deleteCookie('session_hash');

            location.href = '/';
        },
        openSettings() {
            this.$modal.show('Settings');
        },
    },
});
</script>
