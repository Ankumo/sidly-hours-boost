<template>
    <transition name="fade" :duration="1000" appear>
        <div class="app-wrapper">
            <Bg />
            <LoginForm />
            <LocaleSelect />

            <div class="link">
                <a
                    href="https://github.com/Ankumo/sidly-hours-boost"
                    target="_blank"
                    title="GitHub"
                >
                    <AppIcon name="github" />
                </a>
            </div>
        </div>
    </transition>
    <Alerts />
</template>

<style lang="less">
@import '../assets/global';

#app,
.app-wrapper {
    height: 100%;
    width: 100%;
    position: relative;
}

body {
    overflow: hidden;
}

.link {
    position: absolute;
    top: 2rem;
    right: 2rem;

    a {
        padding: 0.5rem;
        display: block;
        border-radius: 100%;
        background-color: rgba(255, 255, 255, 0.8);
        transition: background-color 0.3s, transform 0.2s ease;
        width: 24px;
        height: 24px;

        .icon {
            width: 100%;
            height: 100%;
            transition: transform 0.2s ease;
        }

        &:hover {
            transform: scale(1.05);
            background-color: white;

            .icon {
                transform: scale(1.1);
            }
        }
    }
}

@media (max-width: 768px) {
    .link {
        top: 1rem;
        right: 1rem;
    }
}
</style>

<script lang="ts">
import { defineComponent } from 'vue';
import Bg from './components/Bg.vue';
import Alerts from '@/components/Helpers/Alerts.vue';
import LoginForm from './components/LoginForm.vue';
import AppIcon from '../components/Helpers/AppIcon.vue';
import LocaleSelect from './components/LocaleSelect.vue';

export default defineComponent({
    components: { Bg, Alerts, LoginForm, AppIcon, LocaleSelect },
});
</script>
