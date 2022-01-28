<template>
    <transition name="fade" mode="out-in" appear :duration="250">
        <div v-if="ls === ELoadingState.LOADING" class="loader">
            <LoaderIcon />
        </div>
        <div v-else-if="ls === ELoadingState.OK" class="title-rich">
            <i18n-t
                class="selected-app"
                tag="span"
                scope="global"
                keypath="other.selectedApp"
            >
                <b> {{ mainAppName }} </b>
            </i18n-t>

            <div v-if="!rp" class="warning">
                {{ $_('other.noRPFound') }}
            </div>
            <template v-else>
                <AppDropdown
                    :options="mainKeys"
                    v-model="selectedMainKey"
                    placeholderFormat="mainKey"
                    placeholder="pleaseSelect"
                    @update:modelValue="updateResultRecord"
                    required
                />
                <div
                    class="ph-group"
                    v-if="resultRecord && resultRecord.tPhs.length"
                >
                    <h5>
                        {{ $_('other.rpTPhs') }}
                    </h5>
                    <ul>
                        <li
                            v-for="(ph, index) in resultRecord.tPhs"
                            :key="index"
                        >
                            <AppDropdown
                                v-if="rp.phValues[ph]"
                                :options="buildOptions(ph)"
                                placeholder="pleaseSelect"
                                v-model="localState.placeholders[ph]"
                                @update:modelValue="updateResultRecord"
                                :placeholderFormat="`%${ph}%: {0}`"
                                class="online"
                                required
                            />
                            <AppInput
                                v-else
                                :placeholder="`%${ph}%`"
                                v-model="localState.placeholders[ph]"
                                @update:modelValue="updateWithDebounce"
                                required
                            />
                        </li>
                    </ul>
                </div>
                <div
                    class="ph-group"
                    v-if="resultRecord && resultRecord.customPhs.length"
                >
                    <h5>
                        {{ $_('other.tpCustomPhs') }}
                    </h5>
                    <ul>
                        <li
                            v-for="(ph, index) in resultRecord.customPhs"
                            :key="index"
                        >
                            <span> %{{ ph }}%: </span>
                            <AppInput
                                :placeholder="`%${ph}%`"
                                v-model="localState.placeholders[ph]"
                                @update:modelValue="updateWithDebounce"
                                required
                            />
                        </li>
                    </ul>
                </div>
            </template>
        </div>
        <span v-else class="error">
            {{ $_('other.appRPLoadingError') }}
        </span>
    </transition>
</template>

<style lang="less" scoped>
@import (reference) '../../assets/global.less';

.title-rich {
    display: flex;
    .gapTop(1rem);
    flex-direction: column;
    width: 350px;

    & > span {
        color: rgba(255, 255, 255, 0.65);

        b {
            color: white;
        }
    }

    .warning {
        margin-top: 1rem;
    }

    .dropdown {
        transform: translateX(-1rem);

        &:deep(.ph) {
            overflow: hidden;

            h6 {
                overflow: hidden;
                text-overflow: ellipsis;
            }
        }
    }

    .ph-group {
        display: inline-flex;
        flex-direction: column;
        .gapTop(1rem);
        margin-top: 1rem;

        h5 {
            font-size: 1.065rem;
            color: white;
        }

        ul {
            display: flex;
            flex-direction: column;
            .gapTop(1rem);
            margin-left: 1rem;

            li {
                display: inline-flex;
                flex-direction: column;
                .gapTop(0.35rem);

                span {
                    color: rgba(255, 255, 255, 0.65);
                    font-size: 0.9rem;
                }

                &:deep(.ph b) {
                    color: var(--status);
                }
            }
        }
    }
}

.error,
.warning {
    color: var(--accent);
    font-size: 0.9rem;
}
</style>

<script lang="ts">
import { ELoadingState } from '@/lib/enums';
import { Account, DropdownOption } from '@/lib/types';
import {
    SteamBotCustomTitle,
    SteamAppLocale,
    SteamAppLocaleRecord,
} from '@shared/types';
import { defineComponent, PropType } from 'vue';
import LoaderIcon from '../Helpers/LoaderIcon.vue';
import AppDropdown from '../Form/AppDropdown.vue';
import AppInput from '../Form/AppInput.vue';

export default defineComponent({
    components: { LoaderIcon, AppDropdown, AppInput },
    props: {
        account: {
            type: Object as PropType<Account>,
            required: true,
        },
        modelValue: {
            type: Object as PropType<SteamBotCustomTitle>,
            required: true,
        },
        mainApp: {
            type: Number,
            required: true,
        },
        mainAppName: {
            type: String,
            required: true,
        },
    },
    data() {
        return {
            ls: ELoadingState.LOADING,
            ELoadingState,
            rp: null as SteamAppLocale | null,
            selectedMainKey: this.account.title.title,
            resultRecord: null as SteamAppLocaleRecord | null,
            debounceTimeout: undefined as number | undefined,
        };
    },
    emits: ['update:modelValue'],
    computed: {
        localState: {
            get(): SteamBotCustomTitle {
                return this.modelValue;
            },
            set(val: SteamBotCustomTitle) {
                this.$emit('update:modelValue', val);
            },
        },
        mainKeys(): DropdownOption[] {
            if (!this.rp) {
                return [];
            }

            return Object.keys(this.rp.records).map((key) => ({
                key,
                text: key,
                bind: {
                    title: this.rp!.records[key].text,
                },
            }));
        },
    },
    methods: {
        async fetchLocale() {
            try {
                const result = await this.$api.steamApp.locale(this.mainApp);

                if (result?.success) {
                    if (result.data instanceof Error) {
                        throw result.data;
                    } else if (result.data && Object.keys(result.data).length) {
                        this.rp = result.data;
                    } else {
                        this.rp = null;
                    }

                    this.ls = ELoadingState.OK;
                } else {
                    this.ls = ELoadingState.ERROR;
                }
            } catch (err) {
                this.ls = ELoadingState.ERROR;
                console.error(err);
            } finally {
                this.updateResultRecord();
            }
        },
        buildOptions(ph: string): DropdownOption[] {
            const options = this.rp!.phValues[ph] || [];

            return options.map((key) => ({
                key,
                text: key,
            }));
        },
        updateResultRecord() {
            if (!this.rp || !this.selectedMainKey) {
                this.resultRecord = null;
                return;
            }

            const mainRecord = this.rp.records[this.selectedMainKey];

            if (!mainRecord) {
                this.resultRecord = null;
                return;
            }

            const result: SteamAppLocaleRecord = {
                text: mainRecord.text,
                customPhs: [...mainRecord.customPhs],
                tPhs: [...mainRecord.tPhs],
            };

            if (this.localState.placeholders) {
                const selectedPlaceholders = Object.keys(
                    this.localState.placeholders,
                ).filter((k) => !!this.localState.placeholders[k]);

                let found: boolean;
                let loops = 0;
                let lastMatch = '';

                do {
                    found = false;

                    for (const k of selectedPlaceholders) {
                        result.text = result.text.replace(
                            new RegExp(`%${k}%`, 'gi'),
                            this.localState.placeholders[k],
                        );
                    }

                    const matches = result.text.match(
                        /{#(?:(?!}|%[^%]+%).)+}/gi,
                    );

                    if (matches && matches.length) {
                        found = true;

                        const thisMatch = matches.join(', ');

                        if (thisMatch === lastMatch) {
                            loops++;

                            if (loops > 3) {
                                this.$alert.warn('richPresenceLoop', {
                                    matches,
                                    result,
                                });
                                break;
                            }
                        } else {
                            lastMatch = thisMatch;
                            loops = 0;
                        }

                        matches.forEach((m) => {
                            const record =
                                this.rp!.records[m.substring(1, m.length - 1)];
                            const mrx = new RegExp(m, 'gi');

                            if (record) {
                                result.text = result.text.replace(
                                    mrx,
                                    record.text,
                                );

                                if (record.tPhs.length) {
                                    result.tPhs.push(
                                        ...record.tPhs.filter(
                                            (ph) => !result.tPhs.includes(ph),
                                        ),
                                    );
                                }

                                if (record.customPhs.length) {
                                    result.customPhs.push(
                                        ...record.customPhs.filter(
                                            (ph) =>
                                                !result.customPhs.includes(ph),
                                        ),
                                    );
                                }
                            } else {
                                result.text = result.text.replace(mrx, '???');
                            }
                        });
                    }
                } while (found);
            }

            this.resultRecord = result;
        },
        updateWithDebounce() {
            clearTimeout(this.debounceTimeout);

            this.debounceTimeout = setTimeout(this.updateResultRecord, 350);
        },
    },
    created() {
        this.fetchLocale();
    },
    watch: {
        mainApp() {
            this.selectedMainKey = '';
            this.fetchLocale();
        },
        selectedMainKey() {
            //this.updateResultRecord();
        },
        resultRecord: {
            deep: true,
            handler(n: SteamAppLocaleRecord) {
                const newState = { ...this.localState };

                if (n) {
                    const phs = [...n.tPhs, ...n.customPhs];

                    const keys = Object.keys(newState.placeholders);

                    keys.forEach((k) => {
                        if (!phs.includes(k)) {
                            delete newState.placeholders[k];
                        }
                    });

                    phs.forEach((ph) => {
                        if (!newState.placeholders[ph]) {
                            newState.placeholders[ph] = '';
                        }
                    });
                } else {
                    newState.placeholders = {};
                }

                newState.title = this.selectedMainKey;
                this.localState = newState;
            },
        },
        rp: {
            deep: true,
            handler(n: null | SteamAppLocale) {
                if (n && !n.records[this.selectedMainKey]) {
                    this.selectedMainKey = '';
                    this.updateResultRecord();
                }
            },
        },
    },
});
</script>
