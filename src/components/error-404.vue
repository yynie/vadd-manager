<template>
    <div class="error-body">
        <Card>
            <div class="error-body-title">404</div>
            <p class="error-body-message">YOU&nbsp;&nbsp;LOOK&nbsp;&nbsp;LOST</p>
            <div class="error-body-btn">
                <Button @click="goHome" size="large" style="width: 200px;" type="text">返回首页</Button>
                <Button @click="backPage" size="large" style="width: 200px;margin-left: 40px;" type="primary">返回上一页</Button>
            </div>
        </Card>
    </div>
</template>

<script>
export default {
    name: 'Error404',
    methods: {
        backPage () {
            this.$router.go(-1);
        },
        goHome () {
            this.$router.push({
                name: 'home_index'
            });
        }
    }
}
</script>
<style lang="less" scoped>
    @import './error.less';
</style>


