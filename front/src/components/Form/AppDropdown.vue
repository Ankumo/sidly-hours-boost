<template>
    <div :class="['dropdown', { opened, loading, disabled, ud }]">
        <select v-if="isSelect" v-bind="$attrs" v-model="localValue">
            <option
                v-for="(opt, index) in pureOptions"
                :key="index"
                :value="opt.key"
                :selected="opt.key === localValue"
            >
                {{ opt.text }}
            </option>
        </select>
        <span class="ph" @click.left="open">
            <template v-if="placeholderFormat">
                <i18n-t
                    v-if="$te(phfKey)"
                    :keypath="phfKey"
                    tag="h6"
                    scope="global"
                    :title="$_(phfKey, [ph])"
                    :plural="plural ? ph : undefined"
                >
                    <b>{{ ph }}</b>
                </i18n-t>
                <h6
                    v-else
                    v-html="placeholderFormat.replace(/\{0\}/g, `<b>${ph}</b>`)"
                />
            </template>

            <h6 v-else :title="ph">
                {{ ph }}
            </h6>
            <transition name="chevron" mode="out-in">
                <AppIcon v-if="opened" name="chevron" class="chevron down" />
                <AppIcon v-else name="chevron" class="chevron" />
            </transition>
        </span>
        <div class="list-wrapper" ref="list">
            <ul>
                <li
                    v-for="(opt, index) in options"
                    :key="index"
                    :class="{
                        active: isSelect && opt && localValue === opt.key,
                        divider: opt === null,
                    }"
                    @click.left="select(opt)"
                    v-bind="opt && opt.bind ? opt.bind : {}"
                >
                    <template v-if="opt">
                        {{ $te(opt.text) ? $_(opt.text) : opt.text }}
                    </template>
                </li>
            </ul>
        </div>
    </div>
</template>

<style lang="less" scoped>
.dropdown {
    @zIndex: 3;

    position: relative;
    display: inline-flex;
    align-items: center;
    z-index: 1;

    select {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        opacity: 0;
        pointer-events: none;
        z-index: -1;
    }

    .ph {
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        color: rgba(255, 255, 255, 0.65);
        transition: color 0.3s;
        padding: 0.625rem 1rem;
        user-select: none;

        h6 {
            font-weight: 400;
            font-size: 1rem;
            white-space: nowrap;

            b {
                position: relative;
                color: white;
                transition: color 0.3s;

                &::after {
                    @g_start: rgba(223, 222, 226, 0.55);

                    content: '';
                    opacity: 0;
                    transform: scale(0);
                    transform-origin: center center;
                    transition: transform 0.2s ease, opacity 0.2s ease;
                    width: 100%;
                    height: 100%;
                    left: 0;
                    top: 0;
                    display: block;
                    position: absolute;
                    border-radius: 4px;
                    background: linear-gradient(
                        50deg,
                        @g_start 30%,
                        rgb(60, 60, 61) 50%,
                        @g_start 70%
                    );
                    background-size: 1000%;
                }
            }
        }

        .icon {
            width: 16px;
            height: 16px;
            margin: 0 0 0 0.35rem;

            &:deep(svg) {
                transition: opacity 0.3s ease;
                transform: rotate(270deg);
                opacity: 0.65;
            }

            &.down:deep(svg) {
                transform: rotate(90deg);
            }

            &:deep(*) {
                fill: white;
            }
        }
    }

    &:not(.loading):not(.disabled) {
        .ph:hover {
            color: white;

            .icon:deep(svg) {
                opacity: 1;
            }
        }
    }

    .list-wrapper {
        position: absolute;
        top: 100%;
        transition: opacity 0.3s, background-size 0.2s;
        opacity: 0;
        min-width: calc(100% + 16px);
        z-index: -1;
        pointer-events: none;
        overflow-y: scroll;
        border-radius: 4px;
        background: linear-gradient(to left, #0e0e0e, #0e0e0e) no-repeat;
        background-size: 100% 0;

        ul {
            display: inline-flex;
            list-style: none;
            flex-direction: column;
            color: rgba(255, 255, 255, 0.65);
            transition: transform 0.25s ease;
            transform: scaleY(0);
            transform-origin: center top;
            min-width: 100%;
            padding: 0.375rem 0;

            li {
                padding: 0.625rem 1rem;
                cursor: pointer;
                transition: color 0.3s;
                font-weight: 200;
                user-select: none;

                &:hover,
                &.active {
                    color: white;
                    font-weight: 400;
                }

                &.divider {
                    margin: 2px 0;
                    padding: 0;
                    height: 1px;
                    cursor: default;
                    background: rgba(255, 255, 255, 0.15);
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

    &.opened {
        z-index: @zIndex;

        .list-wrapper {
            opacity: 1;
            z-index: @zIndex;
            pointer-events: all;
            background-size: 100% 100%;

            ul {
                transform: scaleY(1);
            }
        }
    }

    &.ud {
        .list-wrapper {
            transform: translateY(-100%);
            top: 0;
            background-position-y: bottom;
        }

        ul {
            flex-direction: column-reverse;
            transform-origin: center bottom;
        }

        .icon:deep(svg) {
            transform: rotate(90deg);
        }

        .icon.down:deep(svg) {
            transform: rotate(270deg);
        }
    }

    &.loading .ph {
        cursor: not-allowed;

        h6 > b {
            color: transparent !important;

            &::after {
                opacity: 1;
                transform: scale(1);
                animation: asyncLoader 2.3s linear infinite;
            }
        }
    }

    &.disabled .ph {
        cursor: not-allowed;
    }
}

.chevron-leave-active {
    transition: opacity 0.15s, transform 0.15s;
}

.chevron-enter-active {
    transition: opacity 0.07s, transform 0.07s;
}

.chevron-enter-from,
.chevron-leave-to {
    opacity: 0;
    transform: translateY(-6px);
}

.chevron-leave-to {
    transform: translateY(6px) !important;
}
</style>

<script lang="ts">
import { DropdownOption, TranslationSet, TranslationSubKey } from '@/lib/types';
import { resolveTSet } from '@/lib/util';
import { defineComponent, PropType } from 'vue';
import AppIcon from '../Helpers/AppIcon.vue';

export default defineComponent({
    components: { AppIcon },
    props: {
        placeholderFormat: {
            type: String as PropType<TranslationSubKey<'ph'>>,
            default: '',
        },
        placeholder: {
            type: [String, Array] as PropType<TranslationSet<'ph'>>,
            required: false,
        },
        options: {
            type: Array as PropType<Array<DropdownOption | null>>,
            required: true,
        },
        modelValue: {
            type: String,
            required: false,
        },
        beforeSelect: {
            type: Function as PropType<(key: string) => Promise<false | void>>,
            required: false,
        },
        plural: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            opened: false,
            loading: false,
            ud: false,
        };
    },
    computed: {
        localValue: {
            get(): string {
                return this.modelValue || '';
            },
            set(value: string) {
                this.$emit('update:modelValue', value);
            },
        },
        isSelect(): boolean {
            return this.modelValue !== undefined;
        },
        ph(): string {
            if (this.isSelect && this.localValue) {
                const text = this.pureOptions.find(
                    (opt) => opt.key === this.localValue,
                )?.text;

                return text && this.$te(text) ? this.$_(text) : text || '';
            }

            if (!this.placeholder) {
                return '???';
            }

            const tkey = Array.isArray(this.placeholder)
                ? this.placeholder[0]
                : this.placeholder;

            if (!this.$te(`ph.${tkey}`)) {
                return tkey;
            }

            return this.$_(...resolveTSet('ph', this.placeholder));
        },
        disabled(): boolean {
            return !!this.$attrs.disabled;
        },
        pureOptions(): DropdownOption[] {
            return this.options.filter((opt) => !!opt) as DropdownOption[];
        },
        phfKey(): string {
            return `ph.${this.placeholderFormat}`;
        },
    },
    methods: {
        async select(opt: DropdownOption | null) {
            if (!opt || (this.isSelect && this.localValue === opt.key)) {
                return;
            }

            this.close();

            if (this.beforeSelect) {
                this.loading = true;

                try {
                    const result = await this.beforeSelect(opt.key);

                    if (result === false) {
                        return;
                    }
                } catch (err) {
                    console.error(err);
                    return;
                } finally {
                    this.loading = false;
                }
            }

            if (this.isSelect) {
                this.localValue = opt.key;
            } else {
                this.$emit('select', opt.key);
            }
        },
        open() {
            if (this.loading || this.$attrs.disabled) {
                return;
            }

            if (this.opened) {
                this.close();
            } else {
                this.checkHeight();
                this.opened = true;
            }
        },
        checkClick(e: MouseEvent) {
            if (e.button !== 0 || (e.target && this.$el.contains(e.target))) {
                return;
            }

            this.opened = false;
        },
        checkHeight() {
            const list = this.$refs.list as HTMLDivElement;
            const listRect = list.getBoundingClientRect();
            const elRect: DOMRect = this.$el.getBoundingClientRect();

            const nav = document.querySelector('.nav');
            let navH = 76;

            if (nav) {
                const navRect = nav.getBoundingClientRect();
                navH = navRect.height;
            }

            const hTop = elRect.y - navH - 4;
            const hBot = window.innerHeight - elRect.y - elRect.height - 4;

            let maxHeight = 0;

            if (hTop > hBot && listRect.height > hBot) {
                this.ud = true;

                maxHeight = hTop;
            } else {
                this.ud = false;

                maxHeight = hBot;
            }

            list.style.maxHeight = `${maxHeight}px`;
        },
        close() {
            if (this.opened) {
                this.opened = false;

                const list = this.$refs.list as HTMLDivElement;
                list.style.maxHeight = '';
            }
        },
    },
    emits: ['update:modelValue', 'select'],
    mounted() {
        document.addEventListener('mousedown', this.checkClick);
        window.addEventListener('resize', this.close);
    },
    unmounted() {
        document.removeEventListener('mousedown', this.checkClick);
        window.removeEventListener('resize', this.close);
    },
});
</script>
