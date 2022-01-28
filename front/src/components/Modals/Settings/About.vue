<template>
    <div class="about">
        <div class="by">
            {{ $_('other.developedBy') }}
            <div class="emoji">ʕ •ᴥ•ʔฅ</div>
        </div>
        <ul class="links">
            <li v-for="link in links" :key="link.link" :title="link.title">
                <a :href="link.link" target="_blank">
                    <AppIcon :name="link.icon" />
                </a>
            </li>
        </ul>
    </div>
</template>

<style lang="less" scoped>
@keyframes emoji {
    0% {
        background-position: 0% 0%;
    }

    100% {
        background-position: 100% 0%;
    }
}

.about {
    display: flex;
    align-items: center;
    flex-direction: column;
    gap: 2rem;
    padding-bottom: 2rem;

    .by {
        letter-spacing: 2px;
        font-weight: 100;
        font-size: 1.1rem;
        display: inline-flex;
        flex-direction: column;
        align-items: center;
    }

    .emoji {
        background: linear-gradient(
            to left,
            red 10%,
            orange 22%,
            rgb(228, 228, 11) 35%,
            rgb(3, 187, 3) 47%,
            rgb(0, 217, 255) 60%,
            rgb(37, 24, 228) 72%,
            rgb(255, 0, 221) 85%,
            red 100%
        );
        background-repeat: no-repeat;
        background-size: 1000% 100%;
        animation: emoji 4s linear infinite;
        background-clip: text;
        color: transparent;
        font-weight: 600;
        font-size: 1.5rem;
    }

    .links {
        display: inline-flex;
        gap: 2rem;
        list-style: none;

        li {
            background: rgba(255, 255, 255, 0.8);
            border-radius: 100%;
            box-shadow: 0 0 3px 0 black;
            transition: box-shadow 0.3s, transform 0.3s, background 0.3s;

            &:hover {
                box-shadow: 0 0 8px 0 black;
                transform: scale(1.07);
                background: white;

                .icon {
                    transform: scale(1.1);
                }
            }

            a {
                width: 26px;
                height: 26px;
                display: block;
                padding: 1rem;
            }

            .icon {
                width: 100%;
                height: 100%;
                transition: transform 0.2s ease;
            }
        }
    }
}
</style>

<script lang="ts">
import { defineComponent } from 'vue';
import AppIcon from '../../Helpers/AppIcon.vue';

export default defineComponent({
    data() {
        return {
            links: [
                {
                    link: 'https://github.com/Ankumo/sidly-hours-boost',
                    icon: 'github',
                    title: 'GitHub',
                },
                {
                    link: 'https://ankumo.ru',
                    icon: 'paw',
                    title: 'Home page',
                },
            ],
        };
    },
    components: { AppIcon },
});
</script>
