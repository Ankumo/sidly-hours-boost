<template>
    <div class="title">
        <div class="settings">
            <AppDropdown
                :options="titleTypes"
                v-model="selectedTitle.type"
                placeholderFormat="customTitleType"
            />

            <transition
                name="fade"
                :duration="{ enter: 250, leave: 1 }"
                appear
                mode="out-in"
            >
                <form v-if="selectedTitle.type !== 'none'" ref="form">
                    <AppInput
                        v-if="selectedTitle.type === 'default'"
                        v-model="selectedTitle.title"
                        placeholder="title"
                        :multiline="true"
                        rows="4"
                    />

                    <TitleRich
                        v-else-if="selectedTitle.type === 'rich'"
                        :account="account"
                        v-model="selectedTitle"
                        :mainApp="mainApp"
                        :mainAppName="mainAppName"
                        ref="rich"
                    />
                </form>

                <div v-else class="divider" />
            </transition>

            <AppButton t="save" class="success" :click="save" :async="true" />
        </div>

        <TitlePreview
            :account="account"
            :mainAppName="mainAppName"
            :compiledTitle="compiledTitle"
            :selectedTitle="selectedTitle"
        />
    </div>
</template>

<style lang="less" scoped>
@import (reference) '../../../assets/global.less';

.title {
    display: flex;
    align-items: flex-start;
    .gap(2rem);

    .dropdown {
        transform: translateX(-1rem);
        margin-bottom: 1.375rem;
    }

    .settings {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        flex: 0 0 350px;

        & > .success {
            margin-top: 2rem;
        }

        .divider {
            margin: -1rem 0;
        }

        textarea,
        & > form {
            width: 100%;
        }
    }

    .preview {
        flex: 0 0 auto;
        color: white;
    }
}

@media (max-width: 1100px) {
    .title .settings {
        flex: 0 0 300px;
    }
}

@media (max-width: 768px) {
    .title {
        flex-wrap: wrap;
        .gapTop(2rem);

        @supports not (gap: 2rem) {
            & > * + * {
                margin-left: 0;
            }
        }

        .settings {
            flex: 0 0 100%;
        }
    }
}
</style>

<script lang="ts">
import { Account, DropdownOption } from '@/lib/types';
import {
    SteamAppLocaleRecord,
    SteamBotCustomTitle,
    titleTypes,
} from '@shared/types';
import { defineComponent, PropType } from 'vue';
import AppDropdown from '../../Form/AppDropdown.vue';
import AppButton from '../../Form/AppButton.vue';
import TitleRich from '../TitleRich.vue';
import AppInput from '../../Form/AppInput.vue';
import TitlePreview from '../TitlePreview.vue';

export default defineComponent({
    components: { AppDropdown, AppButton, TitleRich, AppInput, TitlePreview },
    props: {
        account: {
            type: Object as PropType<Account>,
            required: true,
        },
    },
    data() {
        return {
            selectedTitle: {
                ...this.account.title,
                placeholders: {
                    ...this.account.title.placeholders,
                },
            },
            savedDefaultTitle:
                this.account.title.type === 'default'
                    ? this.account.title.title
                    : '',
        };
    },
    computed: {
        titleTypes(): DropdownOption[] {
            return titleTypes.map((key) => ({
                key,
                text: `titleType.${key}`,
            }));
        },
        mainApp(): number {
            if (!this.account.appIds.includes(this.account.title.mainApp)) {
                return this.account.appIds[0];
            }

            return this.account.title.mainApp;
        },
        mainAppName(): string {
            if (!this.mainApp) {
                return '???';
            }

            return this.$store.getters.getAppName(this.mainApp);
        },
        compiledTitle(): string {
            switch (this.selectedTitle.type) {
                case 'rich':
                    const rich = this.$refs.rich as typeof TitleRich;

                    if (!rich || !rich.rp) {
                        return '';
                    }

                    const rr = rich.resultRecord as SteamAppLocaleRecord;

                    return rr ? rr.text : '';
                case 'none':
                    return '';
            }

            return this.selectedTitle.title;
        },
    },
    methods: {
        async save() {
            const form = this.$refs.form as HTMLFormElement;

            if (form && !form.reportValidity()) {
                return;
            }

            const result = await this.$api.account.title(
                this.account.id,
                this.selectedTitle,
            );

            if (result?.success) {
                this.$alert.success(['titleUpdated', [this.account.username]]);
            }
        },
    },
    watch: {
        'account.title': {
            deep: true,
            handler(n) {
                this.selectedTitle = n;
            },
        },
        'selectedTitle.type'(
            n: SteamBotCustomTitle['type'],
            o: SteamBotCustomTitle['type'],
        ) {
            if (n !== 'default' && o === 'default') {
                this.savedDefaultTitle = this.selectedTitle.title;
            } else if (n === 'default' && o !== 'default') {
                this.selectedTitle.title = this.savedDefaultTitle;
            }
        },
    },
});
</script>
