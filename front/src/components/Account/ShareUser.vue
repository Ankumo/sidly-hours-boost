<template>
    <div class="share-user">
        <span>{{ user.username }}</span>
        <AppIcon name="times" class="ihover" @click="$emit('delete')" />
    </div>
</template>

<style lang="less" scoped>
@import (reference) '../../assets/global.less';

.share-user {
    background: var(--form-bg);
    padding: 0.625rem 1rem;
    border-radius: 4px;
    display: inline-flex;
    .gap(1rem);
    align-items: center;

    span {
        color: white;
    }

    .icon {
        width: 16px;
        height: 16px;
    }
}
</style>

<script lang="ts">
import { User } from '@/lib/types';
import { defineComponent, PropType } from 'vue';
import AppIcon from '../Helpers/AppIcon.vue';

export default defineComponent({
    components: { AppIcon },
    props: {
        user: {
            type: Object as PropType<User>,
            required: true,
        },
    },
    emits: ['delete'],
});
</script>
