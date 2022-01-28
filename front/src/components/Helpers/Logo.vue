<template>
    <div class="logo">
        <img src="@/assets/logo.png" />
    </div>
</template>

<style lang="less" scoped>
@keyframes breathe {
    0% {
        transform: scale(0.98);
    }

    50% {
        transform: scale(1.02);
    }

    100% {
        transform: scale(0.98);
    }
}

.logo {
    width: 300px;
    height: 300px;

    img {
        padding: 0.5rem;
        background-color: rgba(255, 255, 255, 0.5);
        display: block;
        border-radius: 100%;
        backdrop-filter: blur(5px);
        box-shadow: 0 0 15px 0 rgba(0, 0, 0, 0.65);
        width: 100%;
        height: 100%;
        animation: breathe 7s infinite ease;
        box-sizing: border-box;
    }
}
</style>
