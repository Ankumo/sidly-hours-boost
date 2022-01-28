<template>
    <div :class="['games ms', { ctrl }]" @mousedown.left="startMultiselect">
        <div class="search-group">
            <GameSearch :account="account" />
            <div class="dropdown-group">
                <transition name="fade" :duration="200" mode="out-in">
                    <AppDropdown
                        v-if="realSelected.length"
                        :options="selectedOptions"
                        placeholderFormat="selectedGames"
                        :placeholder="realSelected.length + ''"
                        :plural="true"
                        class="games-selected"
                        @select="gamesAction"
                    />
                </transition>
                <transition name="fade" :duration="200" appear>
                    <AppIcon
                        v-if="account.appIds.length"
                        name="help"
                        class="ihover help"
                        :title="$_('title.gameManagementHelp')"
                        @click.left="help"
                    />
                </transition>
            </div>
        </div>

        <transition name="fade" :duration="200" mode="out-in">
            <ul v-if="account.appIds.length" class="ms" draggable="false">
                <transition-group name="list" :duration="100">
                    <li v-for="appId in account.appIds" :key="appId">
                        <GameCard
                            :ref="setCardRef"
                            :appId="appId"
                            :account="account"
                            :selected="realSelected.includes(appId)"
                            @select="selectOne(null, appId)"
                            @click.left="selectOne($event, appId)"
                        />
                    </li>
                </transition-group>
            </ul>

            <NoItems v-else t="games" class="no-games" />
        </transition>

        <div
            v-if="start"
            :class="['selector', { inverse: start?.type }]"
            :style="{
                left: `${x}px`,
                top: `${y}px`,
                width: `${w}px`,
                height: `${h}px`,
            }"
        />
    </div>
</template>

<style lang="less" scoped>
.games {
    transform: translateX(-2rem);
    width: 100%;
    padding: 2rem;
    padding-bottom: 0;
    position: relative;
    flex: 1 1 auto;

    ul {
        list-style: none;
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        grid-auto-rows: 1fr;
        grid-gap: 2rem;
        user-select: none;
    }

    &.ctrl:deep(.game-card) {
        cursor: pointer;
    }
}

.search-group {
    display: inline-flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 2rem;

    .dropdown:deep(b) {
        font-variant-numeric: tabular-nums;
    }
}

.dropdown-group {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.selector {
    border: 1px solid rgb(0, 85, 124);
    background: rgba(0, 153, 255, 0.25);
    position: absolute;

    &.inverse {
        border-color: rgba(204, 13, 39, 0.8);
        background: rgba(199, 6, 32, 0.4);
    }
}

.no-games {
    min-height: 150px;
}

@media (max-width: 1100px) {
    .games ul {
        grid-template-columns: repeat(3, minmax(0, 1fr));
    }
}

@media (max-width: 768px) {
    .search-group {
        flex-direction: column;
        align-items: center;
        width: 100%;
        margin-bottom: 1rem;

        .search {
            width: 100%;
            box-sizing: border-box;
        }
    }

    .games {
        padding: 1rem;
        transform: translateX(-1rem);

        ul {
            grid-gap: 1rem;
            grid-template-columns: repeat(2, minmax(0, 1fr));
        }
    }
}

@media (max-width: 576px) {
    .games ul {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
}

@media (max-width: 450px) {
    .games ul {
        grid-template-columns: minmax(0, 1fr);
    }
}

@media (hover: none) {
    .help {
        display: none;
    }
}
</style>

<script lang="ts">
import { Account, DropdownOption, MultiselectStart } from '@/lib/types';
import { defineComponent, PropType } from 'vue';
import GameCard from '@/components/Helpers/GameCard.vue';
import NoItems from '../../Helpers/NoItems.vue';
import GameSearch from '../GameSearch.vue';
import AppDropdown from '../../Form/AppDropdown.vue';
import { EGamesAction } from '@/lib/enums';
import AppIcon from '../../Helpers/AppIcon.vue';

export default defineComponent({
    components: { GameCard, NoItems, GameSearch, AppDropdown, AppIcon },
    props: {
        account: {
            type: Object as PropType<Account>,
            required: true,
        },
    },
    data() {
        return {
            start: null as MultiselectStart | null,
            w: 0,
            h: 0,
            x: 0,
            y: 0,
            selected: [] as number[],
            cards: [] as Array<typeof GameCard>,
            selectTimeout: undefined as number | undefined,
            ctrl: false,
        };
    },
    computed: {
        selectedOptions(): Array<DropdownOption | null> {
            const options: Array<EGamesAction | null> = [
                EGamesAction.SELECT_ALL,
                EGamesAction.CANCEL,
                null,
                EGamesAction.REMOVE,
            ];

            return options.map((opt) =>
                !opt
                    ? opt
                    : {
                          key: opt,
                          text: `gamesAction.${opt}`,
                      },
            );
        },
        realSelected(): number[] {
            if (!this.start) {
                return this.selected;
            }

            if (this.start.type) {
                return this.selected.filter(
                    (app) => !this.start?.selected.includes(app),
                );
            } else {
                return [
                    ...this.start.selected.filter(
                        (app) => !this.selected.includes(app),
                    ),
                    ...this.selected,
                ];
            }
        },
        calcCards(): Array<typeof GameCard> {
            return this.cards.filter(
                (card) => !this.selected.includes(card.appId),
            );
        },
    },
    methods: {
        startMultiselect(e: MouseEvent) {
            if (
                !e.target ||
                !(e.target as HTMLDivElement).classList.contains('ms')
            ) {
                return;
            }

            const rect: DOMRect = this.$el.getBoundingClientRect();

            this.start = {
                x: e.clientX - rect.x,
                y: e.clientY - rect.y,
                selected: [],
                type: e.ctrlKey,
            };

            this.w = 0;
            this.h = 0;
            this.x = this.start.x;
            this.y = this.start.y;
        },
        mousemove(e: MouseEvent) {
            if (!this.start) {
                return;
            }

            const rect: DOMRect = this.$el.getBoundingClientRect();

            let { clientY } = e;

            if (clientY > window.innerHeight - 10) {
                clientY = window.innerHeight - 10;
            }

            const x = e.clientX - rect.x;
            const y = clientY - rect.y;

            this.x = x - this.start.x < 0 ? x : this.start.x;
            this.y = y - this.start.y < 0 ? y : this.start.y;

            this.w = Math.abs(x - this.start.x);
            this.h = Math.abs(y - this.start.y);

            clearTimeout(this.selectTimeout);

            this.selectTimeout = setTimeout(this.calcRange, 20);
        },
        selectOne(e: MouseEvent | null, appId: number) {
            if (e && !e.ctrlKey) {
                return;
            }

            const index = this.selected.indexOf(appId);

            if (~index) {
                this.selected.splice(index, 1);
            } else {
                this.selected.push(appId);
            }
        },
        mouseup(e: MouseEvent) {
            if (e.button === 0 && this.start) {
                clearTimeout(this.selectTimeout);
                this.calcRange();

                if (this.start.selected.length) {
                    if (this.start.type) {
                        this.selected = this.selected.filter(
                            (app) => !this.start?.selected.includes(app),
                        );
                    } else {
                        this.selected.push(
                            ...this.start.selected.filter(
                                (app) => !this.selected.includes(app),
                            ),
                        );
                    }
                }

                this.start = null;
            }
        },
        setCardRef(el: any) {
            if (!this.cards.includes(el)) {
                this.cards.push(el);
            }
        },
        calcRange() {
            if (!this.start) {
                return;
            }

            const selected: number[] = [];

            const rectX = Math.abs(this.x);
            const rectY = Math.abs(this.y);

            this.cards.forEach((card) => {
                const x = card.$el.offsetLeft;
                const y = card.$el.offsetTop;

                if (
                    rectX < x + card.$el.offsetWidth &&
                    rectX + this.w > x &&
                    rectY < y + card.$el.offsetHeight &&
                    rectY + this.h > y
                ) {
                    selected.push(card.appId);
                }
            });

            this.start.selected = selected;
        },
        gamesAction(key: EGamesAction) {
            switch (key) {
                case EGamesAction.REMOVE:
                    this.$modal.confirmAsync(
                        ['removeGames', [this.selected.length]],
                        async () => {
                            await this.$api.account.gamesPlayed(
                                this.account.id,
                                this.selected,
                                false,
                            );

                            this.selected = [];
                        },
                        undefined,
                        true,
                    );
                    break;
                case EGamesAction.CANCEL:
                    this.selected = [];
                    break;
                case EGamesAction.SELECT_ALL:
                    this.selected = [...this.account.appIds];
                    break;
            }
        },
        help() {
            this.$modal.message('gamesHelp');
        },
        checkCtrl(e: KeyboardEvent) {
            if (e.key !== 'Control') {
                return;
            }

            this.ctrl = e.type === 'keydown';
        },
    },
    mounted() {
        document.addEventListener('mouseup', this.mouseup);
        window.addEventListener('mousemove', this.mousemove);
        window.addEventListener('keydown', this.checkCtrl);
        window.addEventListener('keyup', this.checkCtrl);
    },
    unmounted() {
        document.removeEventListener('mouseup', this.mouseup);
        window.removeEventListener('mousemove', this.mousemove);
        window.removeEventListener('keydown', this.checkCtrl);
        window.removeEventListener('keyup', this.checkCtrl);
    },
    beforeUpdate() {
        this.cards = [];
    },
});
</script>
