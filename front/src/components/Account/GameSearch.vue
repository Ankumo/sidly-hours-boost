<template>
    <div :class="['search', { loading }]">
        <AppInput
            v-model="searchString"
            placeholder="addGame"
            @blur="blur"
            @focus="focused"
        />

        <transition name="fade" :duration="300" mode="out-in">
            <AppIcon
                v-show="searchString"
                name="times"
                class="ihover clear"
                @click.left="searchString = ''"
            />
        </transition>

        <AppCheckbox label="owned" v-model="ownedOnly" />
        <ul ref="ul">
            <li
                v-for="app in apps"
                :key="app.appid"
                @click.left="select(app.appid)"
                :class="{ selected: account.appIds.includes(app.appid) }"
            >
                <div class="image-wrapper">
                    <SteamAppImage :appId="app.appid" />
                    <AppIcon name="check" class="check-mark" />
                </div>
                {{ app.name }}
            </li>

            <NoItems v-if="apps === undefined" t="emptyGameSearch" />
            <NoItems v-else-if="apps.length === 0" t="noGamesFound" />
        </ul>
    </div>
</template>

<style lang="less" scoped>
@import (reference) '../../assets/global.less';

.search {
    position: relative;
    width: 400px;
    display: flex;
    background: var(--form-bg);
    border-radius: 4px;
    transition: box-shadow 0.3s;
    padding-right: 1rem;
    align-items: center;
    .gap(0.5rem);

    .input {
        width: 100%;

        &:focus {
            box-shadow: none;
        }
    }

    .clear {
        width: 18px;
        height: 18px;
        padding: 0 0.5rem;
    }

    ul {
        list-style: none;
        position: absolute;
        opacity: 0;
        top: 100%;
        left: 0;
        right: 0;
        margin: 0 auto;
        width: 100%;
        background: var(--form-bg);
        z-index: 5;
        display: flex;
        flex-direction: column;
        border-bottom-right-radius: 4px;
        border-bottom-left-radius: 4px;
        transform: scale(1, 0);
        transform-origin: center top;
        transition: opacity 0.3s, transform 0.2s ease, box-shadow 0.3s;
        padding: 0.375rem 0;
        box-sizing: border-box;
        overflow: auto;

        li {
            display: inline-flex;
            align-items: center;
            color: rgba(255, 255, 255, 0.65);
            transition: color 0.3s;
            padding: 0 1rem;
            margin: 0.625rem 0;
            cursor: pointer;

            .game-image {
                max-width: 100px;
                opacity: 0.65;
                transition: opacity 0.3s;
            }

            .image-wrapper {
                position: relative;
                margin-right: 1rem;
                flex-shrink: 0;
                flex-grow: 0;

                &::after {
                    content: '';
                    display: block;
                    background-color: rgba(0, 0, 0, 0.5);
                    transition: background 0.3s;
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    opacity: 0;
                    transition: opacity 0.3s;
                    z-index: 1;
                }

                .check-mark {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    margin: auto;
                    width: 28px;
                    height: 28px;
                    opacity: 0;
                    transform: scale(0);
                    transition: transform 0.3s ease, opacity 0.3s ease;
                    z-index: 2;

                    &:deep(*) {
                        fill: white;
                    }
                }
            }

            &:hover,
            &.selected {
                color: white;

                .game-image {
                    opacity: 1;
                }
            }

            &.selected .image-wrapper {
                &::after {
                    opacity: 1;
                }

                .check-mark {
                    opacity: 1;
                    transform: scale(1);
                }
            }
        }

        &::-webkit-scrollbar-thumb {
            box-shadow: inset 0 0 14px 14px rgba(255, 255, 255, 0.65);
        }

        &::-webkit-scrollbar-thumb:hover {
            box-shadow: inset 0 0 14px 14px white;
        }
    }

    &:focus-within {
        box-shadow: 0 0 0 2px var(--form-bg);
        border-bottom-left-radius: 0;
        border-bottom-right-radius: 0;

        ul {
            opacity: 1;
            transform: scale(1);
            box-shadow: 0 0 0 2px var(--form-bg);
        }
    }

    .no-items {
        padding: 0.625rem 1rem;
        width: 100%;
        text-align: center;
        box-sizing: border-box;
    }
}

@media (max-width: 1200px) {
    .search {
        width: 350px;
    }
}

@media (max-width: 768px) {
    .search {
        width: 300px;
    }
}

@media (max-width: 576px) {
    .search .checkbox:deep(label) {
        font-size: 0.85rem;
    }
}
</style>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import AppInput from '../Form/AppInput.vue';
import AppCheckbox from '../Form/AppCheckbox.vue';
import SteamAppImage from '../Helpers/SteamAppImage.vue';
import { Account, SteamApp } from '@/lib/types';
import { ApiErr } from '@shared/types';
import NoItems from '../Helpers/NoItems.vue';
import AppIcon from '../Helpers/AppIcon.vue';

export default defineComponent({
    components: { AppInput, AppCheckbox, SteamAppImage, NoItems, AppIcon },
    props: {
        account: {
            type: Object as PropType<Account>,
            required: true,
        },
    },
    data() {
        return {
            debounce: undefined as undefined | number,
            ownedOnly: false,
            apps: undefined as SteamApp[] | undefined,
            searchString: '',
            allowBlur: false,
            loading: false,
        };
    },
    methods: {
        async select(appid: number) {
            if (this.loading || this.account.appIds.includes(appid)) {
                return;
            }

            this.loading = true;

            try {
                await this.$api.account.gamesPlayed(this.account.id, [appid]);
            } catch (err) {
                console.error(err);
            } finally {
                this.loading = false;
            }
        },
        blur(e: FocusEvent) {
            if (!this.allowBlur) {
                const target = e.target as HTMLInputElement;

                e.preventDefault();
                target.focus();
            } else {
                this.allowBlur = false;
            }
        },
        checkUnfocus(e: MouseEvent) {
            if (e.target && this.$el.contains(e.target)) {
                return;
            }

            this.allowBlur = true;
        },
        async searchStringChanged(text: string) {
            clearTimeout(this.debounce);

            if (!text) {
                this.apps = undefined;
                return;
            }

            this.debounce = setTimeout(async () => {
                const result = await this.$api.steamApp[
                    this.ownedOnly ? 'searchOwned' : 'search'
                ](text.toLowerCase(), this.account.id);

                if (!result?.success) {
                    return;
                }

                if (result.success) {
                    this.apps = result.data as SteamApp[];
                    this.$store.commit('mergeAppsCache', this.apps);
                    return;
                }

                const ownedOnlyFailedCodes: Array<ApiErr | undefined> = [
                    ApiErr.AccountIsPrivate,
                    ApiErr.SteamApiError,
                    ApiErr.BotNoSteamId,
                    ApiErr.AccountNotFound,
                ];

                if (
                    !result.success &&
                    ownedOnlyFailedCodes.includes(result.errCode)
                ) {
                    this.ownedOnly = false;
                }
            }, 350);
        },
        checkSize() {
            const ul = this.$refs.ul as HTMLUListElement;
            const rect = ul.getBoundingClientRect();

            ul.style.maxHeight = `${
                document.body.scrollHeight -
                rect.y -
                document.body.scrollTop -
                8
            }px`;
        },
        focused() {
            this.allowBlur = false;
            this.checkSize();
        },
    },
    mounted() {
        this.checkSize();

        document.addEventListener('mousedown', this.checkUnfocus);
        window.addEventListener('resize', this.checkSize);
    },
    unmounted() {
        document.removeEventListener('mousedown', this.checkUnfocus);
        window.removeEventListener('resize', this.checkSize);
    },
    watch: {
        searchString(n: string) {
            this.searchStringChanged(n);
        },
        ownedOnly() {
            this.searchStringChanged(this.searchString);
        },
    },
});
</script>
