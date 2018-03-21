<template>
<div class="home-main">
        <!-- title bar -->
    <Layout class="layout-header-bar">
        <div>
            <div class="layout-header-bar-div">
                <img v-if="isCollapsed" src="../assets/logo-dark.png" alt="logo img" height="46"/>
                <img v-else src="../assets/logo-dark-long.png" alt="logo img" height="46" />
            </div>
            <div class="layout-header-bar-div">
                <Icon @click.native="collapsedSider" :class="menuCloseIcon" :style="{margin: '13px 0'}" type="navicon" size="32"></Icon>
            </div>
            <div class="title-area layout-header-bar-div">
                <breadcrumb-nav :currentPath="path"></breadcrumb-nav>
                <!--
                <span>::后台管理</span>
                -->
            </div>
            <div class="avatar-area layout-header-bar-div">
                <full-screen v-model="isFullScreen" @on-change="fullscreenChange"></full-screen>
                <message-tip v-model="mesCount"></message-tip>
                <!--
                <lock-screen></lock-screen>
                -->
                <avatar v-if=$store.state.isAdmin style="background-color: #ed3f14; margin:0 0 0 20px" icon="person" />
                <avatar v-else style="background-color: #87d068; margin:0 0 0 20px" icon="person" />
                <span :style="{lineHeight:'60px', color:'#444', margin:'0 10px'}">{{$store.state.user}}</span>
                <Button type="primary" shape="circle" icon="log-out" @click="handleSignOut">注销</Button>
            </div>
        </div>
    </Layout>
    <Layout class="layout-main">
        <Sider ref="sidebar" :style="{background:'#d0e0f2'}" hide-trigger collapsible :collapsed-width="0"><!-- @on-collapse="onCollapse"-->
            <Menu :active-name="activeMentItem" :open-names="['1', '2', '3']" theme="light" width="auto" :class="menuitemClasses" @on-select="sideMenuItemSelected">
                <Submenu name="1">
                    <template slot="title">
                        <Icon type="stats-bars"></Icon>
                        <span>数据</span>
                    </template>
                    <MenuItem name="query">Option 1</MenuItem>
                    <MenuItem name="1-2">Option 2</MenuItem>
                    <MenuItem name="1-3">Option 3</MenuItem>
                </Submenu>
                <Submenu name="2">
                    <template slot="title">
                        <Icon type="navigate"></Icon>
                        <span>流量消耗</span>
                    </template>
                    <MenuItem name="dtquery">查询</MenuItem>
                    <MenuItem name="dttask">发布</MenuItem>
                </Submenu>
                <Submenu name="3">
                    <template slot="title">
                        <Icon type="settings"></Icon>
                        <span>管理</span>
                    </template>
                    <MenuItem name="dtcustomer">流量任务客户</MenuItem>
                    <MenuItem name="vcpaccount">VCP 账户</MenuItem>
                    <MenuItem name="subject">Vadd项目</MenuItem>
                    <MenuItem name="bonuspool">奖励池</MenuItem>
                </Submenu>
            </Menu>
        </Sider>
        <Content :style="{background: '#f0f0f0', padding: '6px 4px 4px 6px'}">
            <div style="height:90vh">
                <router-view/>
            </div>
        </Content>
    </Layout>
</div>
</template>

<script>
import Cookies from '../libs/Cookies'
import {LOG_OUT, SIDER_COLLAPSE} from '../store/mutation-types'
import Util from '../libs/util'

export default {
    data () {
        return {
            isFullScreen: false,
            mesCount:1,
            activeMentItem:''
        }
    },
    computed: {
        isCollapsed(){
            return this.$store.state.isCollapsed;
        },
        menuCloseIcon () {
            return [
                'close-menu-icon',
                this.isCollapsed ? 'blur-close-menu-icon' : ''
            ];
        },
        menuitemClasses () {
            return [
                'menu-item',
                this.isCollapsed ? 'collapsed-menu-item' : ''
            ]
        },
        path(){
            return this.$store.state.currentPath;
        }
    },
    methods: {
        fullscreenChange (param) {
           console.log("fullscreenChange:isFullScreen="+this.isFullScreen);
           console.log("fullscreenChange:param="+param);
        },
        collapsedSider: function (params) {
            this.$refs.sidebar.toggleCollapse();
            this.$store.commit(SIDER_COLLAPSE,this.$refs.sidebar.isCollapsed);
           // console.log("sider change:"+this.$refs.sidebar.isCollapsed);
        },
        sideMenuItemSelected: function(selected){
            console.log(selected);
            this.$router.push({
                name: selected
            });
        },
        handleSignOut: function(){
            Cookies.delete('user');
            this.$store.commit(LOG_OUT);
            this.$router.push({
                path: '/login'
            });
        }
    },
    watch: {
        '$route' (to) {
            var curpath={
            name: this.$route.name,
            path: this.$route.path,
            title: this.$route.meta.title,
            group: this.$route.meta.group,
            groupname: this.$route.meta.groupname
            };
            
            this.activeMentItem=curpath.name;
            
           // console.log("rout to:" + curpath.name);
            Util.setCurrentPath(this, curpath);
        }
    },
    mounted () {
        var curpath={
            name: this.$route.name,
            path: this.$route.path,
            title: this.$route.meta.title,
            group: this.$route.meta.group,
            groupname: this.$route.meta.groupname
        };
        this.activeMentItem=curpath.name;
        //console.log("mounted to:" +  curpath.name);
        Util.setCurrentPath(this, curpath);
    },
    created () {
        //console.log("created");
    }
}
</script>
