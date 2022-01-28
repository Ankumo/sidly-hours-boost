<template>
    <div
        v-if="app"
        :class="['game-card', { selected, marked }]"
        :title="app.name"
        @contextmenu="contextMenu"
    >
        <div class="image">
            <SteamAppImage :appId="appId" />
            <div
                class="mark"
                :title="$_('title.markGame')"
                @click.left="setMain"
            >
                <div class="radio" />
                {{ $_('other.mainApp') }}
            </div>

            <transition name="fade" :duration="300" appear>
                <ul
                    v-if="showContextMenu"
                    :class="['context', { wait: contextWait }]"
                >
                    <li
                        v-for="opt in contextOptions"
                        :key="opt"
                        @click.left="selectContextOption(opt)"
                    >
                        {{ $_(`cardAction.${opt}`) }}
                    </li>
                </ul>
            </transition>
        </div>

        <div class="name">
            <span>{{ app.name }}</span>
            <AppIcon name="trash" class="ihover" @click="remove" />
        </div>

        <AppCheckbox
            :modelValue="selected"
            @update:modelValue="$emit('select', $event)"
        />
    </div>
</template>

<style lang="less" scoped>
.game-card {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: relative;

    .image {
        position: relative;

        .mark {
            position: absolute;
            bottom: 0;
            right: 0;
            background: var(--form-bg);
            color: white;
            font-size: 0.8rem;
            display: inline-flex;
            align-items: center;
            cursor: pointer;
            font-weight: 100;
            height: 30px;
            padding: 0 0.4rem 0 0.75rem;
            transform: translateX(100%);
            transition: transform 0.3s ease, opacity 0.3s ease, height 0.2s;
            opacity: 0;

            &::before {
                content: '';
                display: block;
                right: calc(100% - 1px);
                background: linear-gradient(
                    135deg,
                    transparent 50%,
                    var(--form-bg) 50%
                );
                position: absolute;
                height: 100%;
                top: 0;
                box-sizing: border-box;
                width: 30px;
            }

            .radio {
                display: inline-block;
                border: 1px solid rgba(255, 255, 255, 0.65);
                background: var(--form-bg);
                border-radius: 100%;
                width: 11px;
                height: 11px;
                box-sizing: border-box;
                padding: 2px;
                position: absolute;
                right: 100%;
                top: 0;
                bottom: 0;
                margin: auto 0;
                transform: translate(-2px, 5px);
                transition: border-color 0.3s ease, transform 0.3s ease;

                &::after {
                    content: '';
                    display: block;
                    border-radius: 100%;
                    background: white;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    transform: scale(0);
                    opacity: 0;
                    transform-origin: center center;
                    transition: transform 0.3s ease, opacity 0.3s ease;
                }
            }

            &:hover {
                transform: translateX(0);

                &::before {
                    background: linear-gradient(
                        120deg,
                        transparent 50%,
                        var(--form-bg) 50%
                    );
                }

                .radio {
                    border-color: white;
                    transform: translate(5px, 0);
                }
            }
        }

        .context {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 3;
            background: rgba(0, 0, 0, 0.75);
            backdrop-filter: blur(4px);
            flex-wrap: wrap;
            padding: 1rem;
            box-sizing: border-box;
            list-style: none;

            li {
                color: rgba(255, 255, 255, 0.65);
                transition: color 0.3s, opacity 0.3s ease;
                cursor: pointer;
                font-weight: 500;
                flex: 0 0 50%;
                text-align: center;
                font-size: 1.1rem;

                &:hover {
                    color: white;
                }
            }

            &.wait {
                pointer-events: none;

                li {
                    cursor: not-allowed;
                    opacity: 0.5;
                }
            }
        }
    }

    .name {
        color: white;
        width: 100%;
        background: #2f2f34;
        box-sizing: border-box;
        padding: 0.5rem;
        position: relative;
        display: inline-flex;

        span {
            font-size: 0.8rem;
            white-space: nowrap;
            overflow: hidden;
            max-width: 100%;
            text-overflow: ellipsis;
            line-height: 1rem;
        }

        .icon {
            width: 16px;
            height: 16px;
            padding: 0.5rem;
            padding-left: 1rem;
            opacity: 0;
            position: absolute;
            right: 0;
            top: 0;
            background: linear-gradient(to right, transparent 0%, #2f2f34 35%);
            transition: opacity 0.3s ease;
        }
    }

    .checkbox {
        position: absolute;
        top: 0;
        left: 0;
        padding: 0.5rem;
        opacity: 0;
        transition: opacity 0.3s ease;

        &:deep(.icon) {
            opacity: 1;
            background: var(--form-bg);
            width: 20px;
            height: 20px;

            svg {
                padding: 0.3rem;
            }
        }
    }

    &:hover {
        .name .icon,
        .checkbox,
        .mark {
            opacity: 1;
        }
    }

    &.selected {
        .checkbox {
            opacity: 1;
        }
    }

    &.marked {
        .mark {
            transform: translateX(0);
            opacity: 1;

            &::before {
                background: linear-gradient(
                    120deg,
                    transparent 50%,
                    var(--form-bg) 50%
                );
            }

            .radio {
                transform: translate(5px, 0);
                border-color: white;

                &::after {
                    opacity: 1;
                    transform: scale(1);
                }
            }
        }
    }
}

@media (hover: none) {
    .game-card {
        &:not(.marked) .mark,
        .name .icon {
            display: none;
        }

        .checkbox {
            opacity: 1;
        }
    }
}
</style>

<script lang="ts">
import { Account, SteamApp } from '@/lib/types';
import { defineComponent, PropType } from 'vue';
import SteamAppImage from './SteamAppImage.vue';
import AppCheckbox from '../Form/AppCheckbox.vue';
import AppIcon from './AppIcon.vue';
import { EGameCardAction } from '@/lib/enums';

export default defineComponent({
    components: { SteamAppImage, AppCheckbox, AppIcon },
    props: {
        account: {
            type: Object as PropType<Account>,
            required: true,
        },
        appId: {
            type: Number,
            required: true,
        },
        selected: {
            type: Boolean,
            required: true,
        },
    },
    emits: ['select'],
    computed: {
        app(): SteamApp {
            return this.$store.state.appsCache[this.appId];
        },
        marked(): boolean {
            let mainApp = this.account.title.mainApp;

            if (!this.account.appIds.includes(this.account.title.mainApp)) {
                mainApp = this.account.appIds[0];
            }

            return mainApp === this.appId;
        },
        contextOptions(): EGameCardAction[] {
            const first = this.selected
                ? EGameCardAction.DESELECT
                : EGameCardAction.SELECT;

            const result = [
                first,
                EGameCardAction.DELETE,
                EGameCardAction.SET_MAIN,
                EGameCardAction.CANCEL,
            ];

            if (this.marked) {
                result.splice(2, 1);
            }

            return result;
        },
    },
    data() {
        return {
            loading: false,
            showContextMenu: false,
            contextWait: false,
        };
    },
    methods: {
        async remove() {
            if (this.loading) {
                return;
            }

            try {
                await this.$api.account.gamesPlayed(
                    this.account.id,
                    [this.appId],
                    false,
                );
            } catch (err) {
                console.error(err);
            } finally {
                this.loading = false;

                if (this.selected) {
                    this.$emit('select', false);
                }
            }
        },
        async setMain() {
            if (this.loading) {
                return;
            }

            this.loading = true;

            try {
                await this.$api.account.title(this.account.id, {
                    ...this.account.title,
                    mainApp: this.appId,
                });
            } catch (err) {
                console.error(err);
            } finally {
                this.loading = false;
            }
        },
        contextMenu(e: MouseEvent) {
            if (!(e instanceof PointerEvent) || e.pointerType !== 'touch') {
                return;
            }

            e.preventDefault();
            e.stopImmediatePropagation();

            this.showContextMenu = true;
        },
        async selectContextOption(opt: EGameCardAction) {
            if (this.contextWait) {
                return;
            }

            this.contextWait = true;

            try {
                switch (opt) {
                    case EGameCardAction.DELETE:
                        await this.remove();
                        break;
                    case EGameCardAction.DESELECT:
                    case EGameCardAction.SELECT:
                        this.$emit('select', !this.selected);
                        break;
                    case EGameCardAction.SET_MAIN:
                        await this.setMain();
                        break;
                }
            } catch (err) {
                console.error(err);
            } finally {
                this.contextWait = false;
                this.showContextMenu = false;
            }
        },
    },
});
</script>
