<template>
    <div class="btn-con" @click="showMessage">
        <Tooltip :content="value ? '有' + value + '条未读消息' : '无未读消息'" placement="bottom">
            <Badge :count="value" dot>
                <Icon type="ios-bell" :size="22"></Icon>
            </Badge>
        </Tooltip>
    </div>
</template>

<script>
export default {
    name: 'messagetip',
    props: {
        value: {
            type: Number,
            default: 0
        }
    },
    methods: {
        showMessage () {
            this.$Message.info('Not ready now. Incoming soon!');
        }
    }
}
</script>
<style lang="scss" scoped>
.btn-con{
    display: inline-block;
    width: 30px;
    text-align: center;
    cursor: pointer;
    padding: 8px 0;
    i{
        vertical-align: middle;
    }
}
</style>
