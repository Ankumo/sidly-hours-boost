<template>
    <Modal
        header="settings"
        :id="id"
        :class="['settings', { sidebar: activeTab === null }]"
    >
        <div class="tabs">
            <ul>
                <li
                    v-for="tab in tabs"
                    :key="tab"
                    :class="{ active: tab === activeTab }"
                    @click.left="activeTab = tab"
                >
                    {{ $_(`settingsTab.${tab}`) }}
                </li>
            </ul>

            <div v-if="$store.state.user.isRoot" class="root-tabs">
                <h3>
                    {{ $_('settings.administration') }}
                </h3>

                <ul>
                    <li
                        v-for="tab in rootTabs"
                        :key="tab"
                        :class="{ active: tab === activeTab }"
                        @click.left="activeTab = tab"
                    >
                        {{ $_(`settingsRootTab.${tab}`) }}
                    </li>
                </ul>
            </div>
        </div>
        <transition name="fade" :duration="250" appear>
            <AppIcon
                v-if="activeTab !== null"
                name="back"
                class="ihover back"
                @click="activeTab = null"
            />
        </transition>
        <transition name="fade" :duration="{ enter: 350, leave: 1 }" appear>
            <keep-alive>
                <component
                    v-show="activeTab !== null"
                    :is="activeTab"
                    class="tab"
                />
            </keep-alive>
        </transition>
    </Modal>
</template>

<style lang="less" scoped>
.modal {
    &:deep(.modal-body) {
        margin: 1rem 0;
        display: flex;
        gap: 0.5rem;

        .tabs {
            flex: 0 0 150px;

            h3 {
                font-size: 0.85rem;
                position: relative;
                font-weight: 500;
                margin-bottom: 0.5rem;

                &::after {
                    content: '';
                    display: block;
                    position: absolute;
                    bottom: -1px;
                    left: 0;
                    width: 100%;
                    height: 1px;
                    background: linear-gradient(
                        to right,
                        rgba(255, 255, 255, 0.65) 0%,
                        transparent 80%
                    );
                }
            }

            ul {
                list-style: none;

                li {
                    color: rgba(255, 255, 255, 0.65);
                    transition: color 0.3s, background 0.3s;
                    cursor: pointer;
                    padding: 0.5rem;
                    font-size: 0.85rem;
                    border-radius: 4px;
                    transform: translateX(-0.5rem);

                    &:hover {
                        color: white;
                    }

                    &.active {
                        color: white;
                        background: rgba(255, 255, 255, 0.35);
                    }
                }
            }

            .root-tabs {
                margin-top: 1rem;
            }
        }

        .tab {
            flex: 0 0 calc(100% - 150px - 0.5rem);
        }

        .back {
            display: none;
            flex: 0 0 22px;
        }
    }

    &:deep(.modal-footer) {
        display: none;
    }
}

@media (max-width: 576px) {
    .modal {
        &:deep(.modal-wrapper) {
            width: 350px;
        }

        &:not(.sidebar):deep(.modal-body) {
            gap: 1rem;

            .back {
                display: inline-block;
            }

            .tabs {
                display: none;
            }

            .tab {
                flex: 0 0 calc(100% - 22px - 1rem);
            }
        }

        &.sidebar:deep(.modal-body) {
            .tab {
                display: none;
            }

            .tabs {
                flex: 0 0 100%;

                ul,
                .root-tabs {
                    align-items: center;
                    display: flex;
                    flex-direction: column;
                }
            }
        }
    }
}
</style>

<script lang="ts">
import { ESettingsRootTab, ESettingsTab } from '@/lib/enums';
import { defineComponent } from 'vue';
import Modal from './Modal.vue';
import Preferences from './Settings/Preferences.vue';
import ChangePassword from './Settings/ChangePassword.vue';
import Users from './Settings/Users.vue';
import About from './Settings/About.vue';
import Stats from './Settings/Stats.vue';
import AppIcon from '../Helpers/AppIcon.vue';

export default defineComponent({
    components: {
        Modal,
        Preferences,
        ChangePassword,
        Users,
        About,
        Stats,
        AppIcon,
    },
    props: {
        id: {
            type: String,
            required: true,
        },
    },
    data() {
        return {
            tabs: [
                ESettingsTab.PREFERENCES,
                ESettingsTab.CHANGE_PASSWORD,
                ESettingsTab.ABOUT,
            ] as ESettingsTab[],
            rootTabs: [
                ESettingsRootTab.USERS,
                ESettingsRootTab.STATS,
            ] as ESettingsRootTab[],
            activeTab: (window.innerWidth > 576
                ? ESettingsTab.PREFERENCES
                : null) as ESettingsTab | ESettingsRootTab | null,
        };
    },
    inheritAttrs: false,
});
</script>
