<template>
    <div class="no-items" :style="calcH ? `height: ${h}px;` : ''">
        {{ $_(...resolveTSet('noItems', t)) }}
    </div>
</template>

<style lang="less" scoped>
.no-items {
    color: white;
    min-height: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    line-height: 145%;
}
</style>

<script lang="ts">
import { TranslationSet } from '@/lib/types';
import { resolveTSet } from '@/lib/util';
import { defineComponent, PropType } from 'vue';

export default defineComponent({
    props: {
        t: {
            type: String as PropType<TranslationSet<'noItems'>>,
            required: true,
        },
        calcH: {
            type: Function as PropType<
                (el: DOMRect, parent: DOMRect) => number
            >,
            required: false,
        },
    },
    data() {
        return {
            h: 0,
            prevWH: -1,
        };
    },
    methods: {
        resolveTSet,
        resized() {
            if (!this.calcH || this.prevWH === window.innerHeight) {
                return;
            }

            this.prevWH = window.innerHeight;

            const rect: DOMRect = this.$el.getBoundingClientRect();
            const parentRect: DOMRect =
                this.$el.parentNode.getBoundingClientRect();

            this.h = this.calcH(rect, parentRect);
        },
    },
    mounted() {
        this.resized();

        window.addEventListener('resize', this.resized);
    },
    unmounted() {
        window.removeEventListener('resize', this.resized);
    },
});
</script>
