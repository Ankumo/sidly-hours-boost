<template>
    <div class="stats">
        <transition name="fade" :duration="200" mode="out-in" appear>
            <LoaderIcon v-if="ls === ELoadingState.LOADING" />
            <div v-else-if="ls === ELoadingState.ERROR" class="error">
                {{ $_('settings.statsLoadingError') }}
            </div>
            <div v-else class="stats-wrapper">
                <div class="stats-group">
                    <h4>
                        {{ $_('settings.serverInfo') }}
                    </h4>
                    <table cellpadding="0" cellspacing="0">
                        <tbody>
                            <tr v-for="(v, k) in serverInfoRecords" :key="k">
                                <td>
                                    {{ $_(`settings.${k}`) }}
                                </td>
                                <td>
                                    {{ v }}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div class="stats-group">
                    <h4>
                        {{ $_('settings.config') }}
                    </h4>
                    <table cellpadding="0" cellspacing="0">
                        <tbody>
                            <tr v-for="(v, k) in info.cfg" :key="k">
                                <td>
                                    {{ k }}
                                </td>
                                <td>
                                    {{ v }}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </transition>
    </div>
</template>

<style lang="less" scoped>
.stats {
    min-height: 150px;
    position: relative;
    max-height: 300px;
    overflow-y: auto;

    .loader {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        margin: auto;
    }

    .error {
        color: var(--accent);
        font-size: 0.9rem;
        padding: 1rem;
        text-align: center;
        box-sizing: border-box;
    }

    .stats-wrapper {
        display: flex;
        gap: 1rem;
        flex-direction: column;

        .stats-group {
            h4 {
                margin-bottom: 0.5rem;
            }

            max-width: 100%;
            overflow: hidden;

            table {
                tr {
                    font-size: 0.8rem;

                    td:first-child {
                        white-space: nowrap;
                        color: rgba(255, 255, 255, 0.65);
                    }

                    td:last-child {
                        padding: 0.25rem 0 0.25rem 0.5rem;
                        font-weight: 500;
                        word-break: break-all;
                    }
                }
            }
        }
    }
}
</style>

<script lang="ts">
import { ELoadingState } from '@/lib/enums';
import {
    CPUInfo,
    StatsMeta,
    TranslationSubKey,
    UpdateStatsMeta,
} from '@/lib/types';
import { DeepPartial } from '@shared/types';
import { defineComponent } from 'vue';
import LoaderIcon from '../../Helpers/LoaderIcon.vue';

export default defineComponent({
    components: { LoaderIcon },
    data() {
        return {
            ls: ELoadingState.LOADING,
            ELoadingState,
            info: {
                cfg: {},
                type: '???',
                totalmem: 1,
                uptime: 0,
            } as StatsMeta,
            updates: {
                accounts: 0,
                launched: 0,
                cpus0: [],
                cpus1: [],
                freemem: 0,
            } as UpdateStatsMeta,
            infoRecords: ['cpu', 'type', 'uptime'] as Array<keyof StatsMeta>,
            uptimeInterval: undefined as number | undefined,
            updateInterval: undefined as number | undefined,
        };
    },
    computed: {
        uptime(): string {
            const m = Math.trunc(this.info.uptime / 60);
            const h = Math.trunc(m / 60);
            const d = Math.trunc(h / 24);
            const s = this.info.uptime - m * 60;

            const lz = (cnt: number) => (cnt < 10 ? `0${cnt}` : cnt);

            return `${lz(d)}:${lz(h - d * 24)}:${lz(m - h * 60)}:${lz(s)}`;
        },
        ramUsage(): string {
            const inUse = this.info.totalmem - this.updates.freemem;

            const prec = (inUse / this.info.totalmem) * 100;

            const mb = this.$_('settings.mb');

            return `${this.floor(prec)}% ( ${this.floor(
                inUse / 1024 / 1024,
            )} ${mb} / ${this.floor(this.info.totalmem / 1024 / 1024)} ${mb} )`;
        },
        cpuUsage(): string {
            const usedKeys: Array<keyof CPUInfo['times']> = [
                'irq',
                'nice',
                'sys',
                'user',
            ];

            const calc = (cpus: CPUInfo[], idle = false) =>
                idle
                    ? cpus.reduce((sum, cpu) => sum + cpu.times.idle, 0)
                    : cpus.reduce(
                          (sum, cpu) =>
                              sum +
                              usedKeys.reduce(
                                  (used, k) => used + cpu.times[k],
                                  0,
                              ),
                          0,
                      );

            const used = calc(this.updates.cpus1) - calc(this.updates.cpus0);
            const total =
                calc(this.updates.cpus1, true) -
                calc(this.updates.cpus0, true) +
                used;

            return `${this.floor((used / total) * 100)}%`;
        },
        cpu(): string {
            if (this.updates.cpus0.length) {
                return this.updates.cpus0[0].model || '';
            }

            return '';
        },
        serverInfoRecords(): DeepPartial<
            Record<TranslationSubKey<'settings'>, number | string>
        > {
            return {
                os: this.info.type,
                cpu: this.cpu || this.$_('other.undef'),
                cpuUsage: this.cpuUsage,
                ramUsage: this.ramUsage,
                uptime: this.uptime,
                accountsCount: this.updates.accounts,
                launchedAccounts: this.updates.launched,
            };
        },
    },
    methods: {
        async update() {
            const result = await this.$api.meta.updateStats();

            if (result?.success) {
                this.updates = result.data;
            }
        },
        floor(num: number) {
            return Math.floor(num * 10) / 10;
        },
    },
    async created() {
        const result = await this.$api.meta.stats();

        if (result?.success) {
            this.info = result.data;
            this.ls = ELoadingState.OK;

            this.uptimeInterval = setInterval(() => {
                this.info.uptime++;
            }, 1000);

            await this.update();

            this.updateInterval = setInterval(() => {
                this.update();
            }, 5000);
        } else {
            this.ls = ELoadingState.ERROR;
        }
    },
    unmounted() {
        clearInterval(this.uptimeInterval);
        clearInterval(this.updateInterval);
    },
});
</script>
