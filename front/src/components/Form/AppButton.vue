<template>
    <button
        @click.left="onClick"
        class="btn"
        type="button"
        :class="{ loading }"
    >
        <div class="bg" />
        {{ $_(...text) }}
    </button>
</template>

<style lang="less" scoped>
@bg: rgb(33, 57, 75);
@bg_hover: linear-gradient(-60deg, #417a9b 5%, #67c1f5 95%);
@text: #66c0f4;
@text_hover: white;

.btn {
    color: @text;
    cursor: pointer;
    padding: 0.625rem 1.325rem;
    border-radius: 4px;
    border: none;
    transition: transform 0.3s, color 0.3s;
    position: relative;
    box-sizing: border-box;
    outline: 1.5px solid transparent;
    z-index: 2;
    font-size: 1rem;
    font-weight: 300;
    background: @bg;
    display: inline-block;

    &::after {
        @g_start: rgba(223, 222, 226, 0.55);

        content: '';
        top: -4px;
        left: -4px;
        width: 100%;
        height: 100%;
        padding: 4px;
        display: block;
        position: absolute;
        background: linear-gradient(
            50deg,
            @g_start 30%,
            rgb(60, 60, 61) 50%,
            @g_start 70%
        );
        border-radius: 4px;
        z-index: -2;
        transform: scale(0);
        transition: opacity 0.3s, transform 0.4s;
        background-size: 1000%;
    }

    .bg {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border-radius: 4px;

        &::before,
        &::after {
            content: '';
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: block;
            position: absolute;
            border-radius: 4px;
            z-index: -1;
            transition: opacity 0.3s;
        }

        &::before {
            background: @bg;
        }

        &::after {
            background: @bg_hover;
            opacity: 0;
        }
    }

    &:active {
        transform: scale(0.97);
    }

    &.loading {
        cursor: not-allowed;

        .bg {
            &::before {
                opacity: 0.9;
            }
        }

        &::after {
            animation: asyncLoader 2.3s linear infinite;
            transform: scale(1);
        }
    }

    &:not(.loading):hover {
        color: @text_hover;

        .bg {
            &::before {
                opacity: 0;
            }

            &::after {
                opacity: 1;
            }
        }
    }

    &.success {
        @text: #d2efa9;
        @bg_hover: linear-gradient(to right, #8ed629 5%, #6aa621 95%);
        @bg: linear-gradient(to right, #75b022 5%, #588a1b 95%);

        color: @text;
        background: @bg;

        .bg {
            &::before {
                background: @bg;
            }

            &::after {
                background: @bg_hover;
            }
        }
    }

    &.secondary {
        @text: white;
        @bg_hover: #464d58;
        @bg: #3d4450;

        color: @text;
        background: @bg;

        .bg {
            &::before {
                background: @bg;
            }

            &::after {
                background: @bg_hover;
            }
        }
    }

    &.danger {
        @text: #efa9a9;
        @bg_hover: linear-gradient(to right, #d62929 5%, #a62121 95%);
        @bg: linear-gradient(to right, #b02222 5%, #8a1b1b 95%);

        color: @text;
        background: @bg;

        .bg {
            &::before {
                background: @bg;
            }

            &::after {
                background: @bg_hover;
            }
        }
    }
}
</style>

<script lang="ts">
import { TranslationSet, TranslationSetNormalized } from '@/lib/types';
import { resolveTSet } from '@/lib/util';
import { defineComponent, PropType } from 'vue';

export default defineComponent({
    props: {
        click: {
            type: Function,
            required: true,
        },
        async: {
            type: Boolean,
            default: false,
        },
        t: {
            type: [String, Array] as PropType<TranslationSet<'btn'>>,
            required: true,
        },
    },
    data() {
        return {
            loading: false,
        };
    },
    computed: {
        text(): TranslationSetNormalized {
            return resolveTSet('btn', this.t);
        },
    },
    methods: {
        async onClick(e: MouseEvent) {
            if (this.async) {
                if (this.loading) {
                    return;
                }

                this.loading = true;

                try {
                    await this.click(e);
                } catch (err) {
                    console.warn(err);
                } finally {
                    this.loading = false;
                }
            } else {
                this.click(e);
            }
        },
    },
});
</script>
