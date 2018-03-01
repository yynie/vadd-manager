<template>
<div class="home-main">
        <!-- title bar -->
    <Row class="layout-header-bar">
        <Col span="4">
        <Icon @click.native="collapsedSider" :class="menuCloseIcon" :style="{margin: '14px 20px'}" type="navicon-round" size="20"></Icon>
        </Col>
        <Col span="12">
          <div class="title-area">
          <span>::后台管理</span>
          </div>
        </Col>
        <Col span="8">
        <div class="avatar-area">
          <avatar v-if=$store.state.isAdmin style="background-color: #ed3f14" icon="person" />
          <avatar v-else style="background-color: #87d068" icon="person" />
          <span :style="{margin: '0 20px 0 5px',color:'#444'}">{{$store.state.user}}</span>
          <Button type="primary" shape="circle" icon="log-out" @click="handleSignOut">注销</Button>
        </div>
        </Col>
    </Row>
</div>
</template>

<script>
import Cookies from '../libs/Cookies'
import {LOG_OUT} from '../store/mutation-types'
export default {
    data () {
        return {
            isCollapsed: false
        }
    },
    computed: {
        menuCloseIcon () {
            return [
                'close-menu-icon',
                this.isCollapsed ? 'blur-close-menu-icon' : ''
            ];
        }
    },
    methods: {
        collapsedSider () {
            this.$refs.sidebar.toggleCollapse();
        },
        sideMenuItemSelected(selected){
            console.log(selected);
        },
        handleSignOut(){
            Cookies.delete('user');
            this.$store.commit(LOG_OUT);
            this.$router.push({
                path: '/login'
            });
        }
    }
}
</script>
