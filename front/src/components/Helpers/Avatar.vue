<template>
    <div :class="['avatar', { loading }]">
        <img
            v-if="account.info?.frame"
            :src="account.info?.frame.image_small"
            class="frame"
            type="image/gif"
            draggable="false"
        />
        <img draggable="false" :src="avatar" @load="loading = false" />
        <LoaderIcon v-if="loading" />
    </div>
</template>

<style lang="less" scoped>
.avatar {
    width: 96px;
    height: 96px;
    position: relative;
    box-shadow: 0 0 0 2px var(--status);
    flex: 0 0 auto;
    margin: 2px;

    img {
        width: 100%;
        height: 100%;
        border-radius: 4px;
        display: block;
        opacity: 1;
        transition: opacity 0.5s;
    }

    .frame {
        z-index: 1;
        position: absolute;
        left: 0;
        right: 0;
        transform: scale(1.24);
    }

    .loader {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        margin: auto;
        width: 75%;
        height: 75%;
    }

    &.loading {
        img {
            opacity: 0;
        }
    }
}
</style>

<script lang="ts">
import { Account } from '@/lib/types';
import { defineComponent, PropType } from 'vue';
import LoaderIcon from './LoaderIcon.vue';

export default defineComponent({
    props: {
        account: {
            type: Object as PropType<Account>,
            required: true,
        },
    },
    data() {
        return {
            loading: true,
        };
    },
    computed: {
        avatar(): string {
            return (
                this.account.info.avatar || require(`@/assets/no-avatar.jpg`)
            );
        },
    },
    components: { LoaderIcon },
});
</script>
