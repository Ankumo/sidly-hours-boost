<template>
    <div class="preferences">
        <form ref="form">
            <div class="input-group">
                <h5>{{ $_('settings.changeNickname') }}</h5>
                <AppInput
                    placeholder="nickname"
                    v-model="nickname"
                    required
                    minlength="3"
                    maxlength="30"
                />
            </div>
            <div class="input-group">
                <h5>{{ $_('settings.language') }}</h5>
                <AppDropdown v-model="lang" :options="localeOptions" />
            </div>
            <AppButton t="save" :async="true" :click="save" class="success" />
        </form>
    </div>
</template>

<style lang="less" scoped>
@import (reference) '../../../assets/global.less';

.preferences {
    form {
        display: flex;
        flex-direction: column;
        .gapTop(1rem);
    }

    .input-group {
        h5 {
            color: rgba(255, 255, 255, 0.65);
            font-size: 1rem;
            margin-bottom: 0.5rem;
            font-weight: 500;
        }

        input {
            width: 100%;
        }
    }

    .dropdown {
        transform: translateX(-1rem);
    }
}
</style>

<script lang="ts">
import { defineComponent } from 'vue';
import AppInput from '../../Form/AppInput.vue';
import AppDropdown from '@/components/Form/AppDropdown.vue';
import { Locales } from '@shared/types';
import { DropdownOption, User } from '@/lib/types';
import AppButton from '../../Form/AppButton.vue';
import { i18nG } from '@/plugins/i18n';

export default defineComponent({
    components: { AppInput, AppDropdown, AppButton },
    data() {
        return {
            lang: '' as Locales,
            nickname: '',
        };
    },
    computed: {
        localeOptions(): DropdownOption[] {
            return this.$i18n.availableLocales.map((key) => ({
                key,
                text: `lang.${key}`,
            }));
        },
        me(): User {
            return this.$store.state.user;
        },
    },
    methods: {
        async save() {
            const form = this.$refs.form as HTMLFormElement;

            if (!form.reportValidity()) {
                return;
            }

            const result = await this.$api.user.update(
                this.nickname,
                this.lang,
            );

            if (result?.success) {
                this.$alert.success('profileUpdated');

                this.$store.commit('setUser', {
                    ...this.me,
                    nickname: this.nickname,
                    lang: this.lang,
                });

                window.localStorage.setItem('lastLocale', this.lang);
                i18nG.locale = this.lang;
            }
        },
    },
    created() {
        this.lang = this.$i18n.locale as Locales;
        this.nickname = this.$store.state.user.nickname;
    },
});
</script>
