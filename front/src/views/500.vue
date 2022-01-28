<template>
    <div class="route-body">
        <Logo />
        <span>
            {{ $_('other.500') }}
        </span>
    </div>
</template>

<style lang="less" scoped>
.route-body {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 2rem;

    .logo {
        width: 200px;
        height: 200px;
    }

    span {
        color: white;
        letter-spacing: 1px;
        font-weight: 700;
        font-size: 2rem;
        display: block;
        text-align: center;
    }
}

@media (max-width: 768px) {
    .route-body {
        .logo {
            width: 175px;
            height: 175px;
        }

        span {
            font-size: 1.5rem;
        }
    }
}
</style>

<script lang="ts">
import { defineComponent } from 'vue';
import Logo from '@/components/Helpers/Logo.vue';

export default defineComponent({
    components: { Logo },
});
</script>
