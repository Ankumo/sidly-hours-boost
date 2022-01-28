<template>
    <Modal
        :header="[`logOn.${modalType}`, [initialUsername]]"
        :id="id"
        class="log-on"
    >
        <form ref="form">
            <transition name="fade" :duration="200" mode="out-in">
                <div v-if="modalType !== 'proceed'" class="inputs">
                    <AppInput
                        v-if="modalType !== 'relogon'"
                        placeholder="username"
                        v-model="username"
                        required
                        @keypress.enter="focusPassword"
                    />
                    <AppInput
                        placeholder="password"
                        v-model="password"
                        type="password"
                        class="password"
                        required
                        ref="password"
                        @keypress.enter="submit"
                    />
                </div>
                <div v-else class="inputs">
                    {{
                        $_(
                            result === 'twofa'
                                ? 'other.provideGuardCode'
                                : 'other.provideEmailCode',
                        )
                    }}
                    <AppInput
                        placeholder="code"
                        v-model="code"
                        maxlength="5"
                        :transform="transformCode"
                        class="code"
                        required
                        @keypress.enter="submit"
                    />
                </div>
            </transition>
        </form>

        <template #footer>
            <transition name="fade" :duration="200" mode="out-in">
                <AppButton
                    :async="true"
                    :click="action"
                    class="success"
                    :key="modalType"
                    :t="`logOn.${modalType}`"
                    ref="submitBtn"
                />
            </transition>
        </template>
    </Modal>
</template>

<style lang="less" scoped>
.modal {
    &:deep(.modal-wrapper) {
        width: 400px;

        .modal-footer {
            display: flex;
            justify-content: flex-end;
        }

        .modal-body {
            .inputs {
                display: inline-flex;
                flex-direction: column;
                width: 100%;
                justify-content: center;
                align-items: center;
                margin: 0 auto;
            }

            .input {
                width: 250px;
                box-sizing: border-box;
            }

            .code,
            .password {
                margin-top: 1rem;
            }
        }
    }
}
</style>

<script lang="ts">
import { EResult } from '@/lib/enums';
import {
    ApiResult,
    LogOnError,
    LogOnModalType,
    LogOnResult,
} from '@/lib/types';
import { transformCode } from '@/lib/util';
import { ApiErr } from '@shared/types';
import { defineComponent, PropType } from 'vue';
import AppButton from '../Form/AppButton.vue';
import AppInput from '../Form/AppInput.vue';
import Modal from './Modal.vue';

export default defineComponent({
    inheritAttrs: false,
    components: { Modal, AppButton, AppInput },
    props: {
        id: {
            type: String,
            required: true,
        },
        type: {
            type: String as PropType<LogOnModalType>,
            default: (): LogOnModalType => 'add',
        },
        initialUsername: {
            type: String,
            required: false,
        },
        initialResult: {
            type: String,
            required: false,
        },
    },
    data() {
        return {
            username: this.initialUsername || '',
            password: '',
            result: this.initialResult || '',
            code: '',
            accountId: 0,
            modalType: this.type,
        };
    },
    methods: {
        async action() {
            const form = this.$refs.form as HTMLFormElement;

            if (!form.reportValidity()) {
                return;
            }

            if (this.modalType === 'proceed') {
                await this.proceed();
            } else {
                await this.add();
            }
        },
        async add() {
            const result = await this.$api.account.add(
                this.username,
                this.password,
                this.modalType === 'relogon',
            );

            if (result) {
                if (result.success) {
                    if (!result.data.accountId) {
                        this.$alert.err('error.noAccountWithSuccess', result);
                        return;
                    }

                    switch (result.data.logOnResult) {
                        case 'guard':
                        case 'twofa':
                            this.accountId = result.data.accountId;
                            this.result = result.data.logOnResult;
                            this.modalType = 'proceed';
                            break;
                        case 'success':
                            this.$alert.success([
                                'accountAdded',
                                [this.username],
                            ]);
                            this.$store.commit('closeModal', this.id);
                            break;
                    }
                } else {
                    this.processLogOnErr(result);
                }
            }
        },
        async proceed() {
            const result = await this.$api.account.proceed(
                this.accountId,
                this.code,
            );

            if (result) {
                if (result.success) {
                    switch (result.data.logOnResult) {
                        case 'guard':
                        case 'twofa':
                            this.$alert.warn('error.guardCodeIncorrect');
                            break;
                        case 'success':
                            this.$alert.success('successfullyLoggedIn');
                            this.$store.commit('closeModal', this.id);
                            break;
                    }
                } else {
                    this.processLogOnErr(result);
                }
            }
        },
        processLogOnErr(result: ApiResult<LogOnResult>) {
            try {
                if (!result.data) {
                    if (!result.errCode) {
                        throw 'strange result';
                    }

                    this.$alert.err(`apiErr.${result.errCode}`, result);
                    return;
                }

                const err = result.data.error as LogOnError;

                if (!err) {
                    this.$alert.err(`apiErr.${ApiErr.Unexpected}`, result);
                    return;
                }

                if (err.eresult) {
                    if (this.$te(`alert.error.eResult.${err.eresult}`)) {
                        this.$alert.err(`error.eResult.${err.eresult}`, result);
                    } else {
                        this.$alert.err(
                            [
                                `error.apiErr.${ApiErr.BotLogonError}`,
                                [EResult[err.eresult]],
                            ],
                            result,
                        );
                    }
                } else {
                    this.$alert.err('error.logOnUnexpected');
                }
            } catch (err) {
                this.$alert.err(`apiErr.${ApiErr.Unexpected}`, { result, err });
            }
        },
        transformCode,
        submit() {
            const btn = this.$refs.submitBtn as typeof AppButton;
            btn.onClick();
        },
        focusPassword() {
            const input = this.$refs.password as typeof AppInput;
            input.$el.focus();
        },
    },
});
</script>
