<template>
    <ul class="locale-select">
        <li
            v-for="locale in LocalesList"
            :key="locale"
            :title="$_(`lang.${locale}`)"
            :class="{ active: locale === current }"
            @click.left="setLocale(locale)"
        >
            <img :src="resolvePath(locale)" />
        </li>
    </ul>
</template>

<style lang="less" scoped>
@import (reference) '../../assets/global.less';

.locale-select {
    list-style: none;
    display: inline-flex;
    .gap(2rem);
    position: absolute;
    left: 2rem;
    bottom: 2rem;

    li {
        cursor: pointer;
        transition: transform 0.2s ease, box-shadow 0.3s;
        border-radius: 100%;
        width: 24px;
        height: 24px;
        position: relative;

        img {
            width: 100%;
            height: 100%;
        }

        &.active {
            box-shadow: 0 0 10px 0 black;
            transform: scale(1.1);

            &::after {
                box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.8);
            }
        }

        &:hover {
            transform: scale(1.1);
        }

        &::after {
            position: absolute;
            content: '';
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: block;
            border-radius: 100%;
            z-index: -1;
            transition: box-shadow 0.3s;
        }
    }
}

@media (max-width: 768px) {
    .locale-select {
        margin: 0 auto;
        left: 0;
        right: 0;
        justify-content: center;
    }
}
</style>

<script lang="ts">
import { defineComponent } from 'vue';
import { Locales, LocalesList } from '@shared/types';
import { i18nG } from '@/plugins/i18n';

export default defineComponent({
    data() {
        return {
            LocalesList,
        };
    },
    computed: {
        current(): Locales {
            return i18nG.locale;
        },
    },
    methods: {
        resolvePath(locale: Locales) {
            return require(`@/assets/lang/${locale}.png`);
        },
        setLocale(locale: Locales) {
            i18nG.locale = locale;
            window.localStorage.setItem('lastLocale', locale);
        },
    },
});
</script>
