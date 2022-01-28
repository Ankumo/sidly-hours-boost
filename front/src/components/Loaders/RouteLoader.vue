<template>
    <transition name="loader" mode="out-in">
        <div class="route-body loader" v-if="!loaded && showLoader">
            <LoaderIcon />
        </div>

        <div class="route-body" v-else-if="loaded">
            <slot />
        </div>
    </transition>
</template>

<style lang="less" scoped>
.loader {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: auto;

    .icon {
        width: 100px;
        height: 100px;
    }
}

.loader-enter-active,
.loader-leave-active {
    transition: opacity 0.3s ease;
}

.loader-enter-from,
.loader-leave-to {
    opacity: 0;
}
</style>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { RouteFetcher } from '@/lib/types';
import { Route404, Route500 } from '@/lib/util';
import LoaderIcon from '../Helpers/LoaderIcon.vue';

export default defineComponent({
    components: {
        LoaderIcon,
    },
    props: {
        fetch: {
            type: Function as PropType<RouteFetcher>,
            required: true,
        },
    },
    data() {
        return {
            loaded: false,
            showLoader: false,
        };
    },
    async created() {
        const loaderTimeout = setTimeout(() => {
            this.showLoader = true;
        }, 400);

        try {
            const result = await this.fetch();

            if (result === '404') {
                this.$router.push(Route404(this.$route));
            }
        } catch (err) {
            console.error(err);

            this.$router.push(Route500(this.$route));
        } finally {
            clearTimeout(loaderTimeout);
            this.loaded = true;
        }
    },
});
</script>
