<template>
    <div class="users">
        <AppButton t="createUser" :click="addUser" class="success" />
        <transition name="fade" :duration="200" mode="out-in" appear>
            <LoaderIcon v-if="loading" />
            <template v-else>
                <transition name="fade" :duration="200" mode="out-in" appear>
                    <table
                        v-if="users.length"
                        cellpadding="0"
                        cellspacing="0"
                        border="0"
                    >
                        <thead>
                            <tr>
                                <th>
                                    {{ $_('settings.userTableH.num') }}
                                </th>
                                <th colspan="2">
                                    {{ $_('settings.userTableH.username') }}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(user, index) in users" :key="user.id">
                                <td>
                                    {{ index + 1 }}
                                </td>
                                <td width="100%">
                                    {{ user.username }}
                                </td>
                                <td>
                                    <AppIcon
                                        name="key"
                                        class="ihover"
                                        :title="$_('title.resetPassword')"
                                        @click="resetPassword(user)"
                                    />
                                    <AppIcon
                                        name="trash"
                                        class="ihover"
                                        :title="$_('title.deleteUser')"
                                        @click="deleteUser(user)"
                                    />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <NoItems
                        v-else
                        :t="error ? 'usersError' : 'noUsers'"
                        class="no-users"
                    />
                </transition>
            </template>
        </transition>
    </div>
</template>

<style lang="less" scoped>
.users {
    position: relative;
    max-height: 300px;
    overflow-y: auto;

    .loader {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        margin: auto;
    }

    & > button {
        width: 100%;
        margin-bottom: 1rem;
    }

    table {
        width: 100%;

        thead tr {
            position: relative;

            &::after {
                content: '';
                display: block;
                position: absolute;
                width: 100%;
                bottom: -1px;
                left: 0;
                background: linear-gradient(
                    to right,
                    rgba(255, 255, 255, 0.65) 0%,
                    transparent 85%
                );
                height: 1px;
            }
        }

        tr {
            td,
            th {
                padding: 0.5rem;
                text-align: left;

                &:first-child {
                    font-variant-numeric: tabular-nums;
                }
            }
        }

        tbody tr {
            position: relative;

            td:last-child {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                opacity: 0;
                transition: opacity 0.3s;

                .icon {
                    width: 16px;
                    height: 16px;
                }
            }

            &:hover {
                td:last-child,
                &::after {
                    opacity: 1;
                }
            }

            &::after {
                content: '';
                display: block;
                height: 1px;
                width: 100%;
                background: linear-gradient(
                    to bottom,
                    white 0%,
                    transparent 58%
                );
                position: absolute;
                left: 0;
                bottom: -2px;
                transition: opacity 0.3s;
                opacity: 0;
            }
        }
    }

    .no-users {
        min-height: 80px;
    }
}

@media (hover: none) {
    .users table tbody tr {
        td:last-child,
        &::after {
            opacity: 1;
        }
    }
}
</style>

<script lang="ts">
import { defineComponent } from 'vue';
import AppButton from '../../Form/AppButton.vue';
import NoItems from '@/components/Helpers/NoItems.vue';
import { User } from '@/lib/types';
import AppIcon from '../../Helpers/AppIcon.vue';
import LoaderIcon from '@/components/Helpers/LoaderIcon.vue';

export default defineComponent({
    components: { AppButton, NoItems, AppIcon, LoaderIcon },
    data() {
        return {
            loading: true,
            error: false,
            users: [] as User[],
        };
    },
    methods: {
        addUser() {
            this.$modal.show('CreateUser', {
                onCreate: (user) => {
                    this.users.push(user);
                },
            });
        },
        deleteUser(user: User) {
            this.$modal.confirmAsync(
                ['deleteUser', [user.username]],
                async () => {
                    const result = await this.$api.user.delete(user.id);

                    if (result?.success) {
                        this.$alert.success(['userDeleted', [user.username]]);

                        const index = this.users.findIndex(
                            (u) => u.id === user.id,
                        );

                        if (~index) {
                            this.users.splice(index);
                        }
                    }
                },
            );
        },
        resetPassword(user: User) {
            this.$modal.confirmAsync(
                ['resetPassword', [user.username]],
                async () => {
                    const result = await this.$api.user.resetPassword(user.id);

                    if (result?.success) {
                        this.$alert.success([
                            'userPasswordResetted',
                            [user.username],
                        ]);

                        this.$modal.message([
                            'userNewPassword',
                            [user.username, result.data],
                        ]);
                    }
                },
            );
        },
    },
    async created() {
        try {
            const result = await this.$api.user.getAll();

            if (result?.success) {
                this.users = result.data;
            }
        } catch (err) {
            console.error(err);
            this.error = true;
        } finally {
            this.loading = false;
        }
    },
});
</script>
