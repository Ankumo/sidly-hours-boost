<template>
    <div class="preview" :title="hTitle">
        <div :class="['profile', { offline }]">
            <Avatar :account="account" />
            <div class="info">
                <span class="username">
                    <div>{{ account.info.name || account.username }}</div>
                </span>
                <span class="app"> {{ app }} </span>
                <span v-if="selectedTitle.type === 'rich'" class="rp">
                    {{ compiledTitle }}
                </span>
            </div>
        </div>
        <div class="friends">
            {{ $_('other.friends') }}
        </div>
    </div>
</template>

<style lang="less" scoped>
@import (reference) '../../assets/global.less';

.preview {
    @windowBg: #23262d;

    position: relative;
    width: 400px;
    z-index: 0;

    &::after {
        display: block;
        position: absolute;
        left: 0;
        top: 0;
        width: calc(100% + 200px);
        height: calc(100% + 200px);
        pointer-events: none;
        content: '';
        background: radial-gradient(
            ellipse at 15% 10%,
            @windowBg 35%,
            transparent 55%
        );
        z-index: 1;
    }

    .profile {
        display: flex;
        .gap(0.5rem);
        padding: 0.5rem;
        position: relative;
        box-sizing: border-box;

        @avatarSize: 50px;

        .avatar {
            box-shadow: 0 0 10px 0 black;
            width: @avatarSize;
            height: @avatarSize;
            z-index: 3;
            flex: 0 0 @avatarSize;
        }

        .info {
            @maxWidth: calc(100% - 0.5rem - @avatarSize);

            display: flex;
            flex-direction: column;
            .gapTop(0.15rem);
            align-self: flex-end;
            margin-bottom: 4px;
            max-width: @maxWidth;
            position: relative;
            z-index: 3;
            flex: @maxWidth;

            & > span {
                display: inline-block;
                line-height: 1;
                text-shadow: 1px 1px 4px black;
                white-space: nowrap;
                font-weight: 300;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            @usernameColor: #7eb949;

            .username {
                font-size: 0.95rem;
                color: #d4f1b8;
                font-weight: 300;
                display: inline-flex;
                align-items: center;
                .gap(0.5rem);

                &::after {
                    content: '';
                    display: block;
                    width: 0;
                    height: 0;
                    padding: 4px;
                    border-right: 1px solid @usernameColor;
                    border-bottom: 1px solid @usernameColor;
                    transform: rotate(45deg) scale(0.65) translate(-3px);
                    flex-shrink: 0;
                    flex-grow: 0;
                }

                div {
                    flex: 0 0 auto;
                    text-overflow: ellipsis;
                    overflow: hidden;
                    max-width: calc(100% - 1.25rem);
                }
            }

            .app {
                font-size: 0.8rem;
                color: @usernameColor;
                font-weight: 400;
            }

            .rp {
                font-size: 0.765rem;
                color: #669330;
            }
        }

        &.offline {
            background: none;

            .username,
            .app {
                color: var(--status);

                &::after {
                    border-color: var(--status);
                }
            }
        }

        &::before {
            display: block;
            position: absolute;
            content: '';
            top: 0;
            left: 0;
            background: radial-gradient(
                ellipse at -200% 25%,
                rgba(151, 203, 104, 0.65) 0%,
                transparent 70%
            );
            background-repeat: no-repeat;
            background-size: 100% 200%;
            z-index: 2;
            width: 100%;
            height: 100%;
        }
    }

    .friends {
        width: 100%;
        padding: 0.5rem 1rem;
        box-sizing: border-box;
        text-transform: uppercase;
        letter-spacing: 1px;
        font-size: 0.9rem;
        color: #adbac3;
        position: relative;
        z-index: 2;

        &::after {
            content: '';
            display: block;
            position: absolute;
            top: 0;
            left: 0;
            background: radial-gradient(
                circle at 0%,
                #424953 40%,
                transparent 75%
            );
            width: calc(100% + 200px);
            height: 100%;
            z-index: -1;
        }
    }
}

@media (max-width: 1100px) {
    .preview {
        width: 300px;
    }
}

@media (max-width: 768px) {
    .preview {
        width: 95%;
    }
}
</style>

<script lang="ts">
import { EPersonaState } from '@/lib/enums';
import { Account } from '@/lib/types';
import { SteamBotCustomTitle } from '@shared/types';
import { defineComponent, PropType } from 'vue';
import Avatar from '../Helpers/Avatar.vue';

export default defineComponent({
    components: { Avatar },
    props: {
        account: {
            type: Object as PropType<Account>,
            required: true,
        },
        mainAppName: {
            type: String,
            required: true,
        },
        compiledTitle: {
            type: String,
            required: true,
        },
        selectedTitle: {
            type: Object as PropType<SteamBotCustomTitle>,
            required: true,
        },
    },
    computed: {
        offline(): boolean {
            return (
                this.account.personaState === EPersonaState.Offline ||
                this.account.personaState === EPersonaState.Invisible
            );
        },
        app(): string {
            if (this.offline) {
                return this.$_(`personaState.${EPersonaState.Offline}`);
            }

            if (this.selectedTitle.type === 'default') {
                if (this.selectedTitle.title === '') {
                    let pState = this.account.personaState;

                    if (pState === EPersonaState.Snooze) {
                        pState = EPersonaState.Away;
                    }

                    return this.$_(`personaState.${pState}`);
                } else {
                    return this.compiledTitle;
                }
            }

            return this.mainAppName;
        },
        hTitle(): string | undefined {
            switch (this.selectedTitle.type) {
                default:
                    return undefined;
                case 'default':
                    return this.app;
                case 'rich':
                    return this.compiledTitle;
            }
        },
    },
});
</script>
