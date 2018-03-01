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
    <Layout class="layout-main">
        <Sider ref="sidebar" :style="{background:'#d0e0f2'}" hide-trigger collapsible :collapsed-width="0" v-model="isCollapsed">
            <Menu active-name="1-1" :open-names="['1', '2', '3']" theme="light" width="auto" :class="menuitemClasses" @on-select="sideMenuItemSelected">
                <Submenu name="1">
                    <template slot="title">
                        <Icon type="stats-bars"></Icon>
                        <span>数据查询</span>
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
                    <MenuItem name="2-2">发布</MenuItem>
                    <MenuItem name="2-3">导入imei</MenuItem>
                </Submenu>
                <Submenu name="3">
                    <template slot="title">
                        <Icon type="settings"></Icon>
                        <span>管理</span>
                    </template>
                    <MenuItem name="3-1">VCP 账户</MenuItem>
                    <MenuItem name="3-2">奖励池</MenuItem>
                    <MenuItem name="3-3">项目配置</MenuItem>
                </Submenu>
            </Menu>
        </Sider>
        <Content :style="{padding: '6px 4px 10px 6px'}">
            <Card>
                <div style="height:100vh">
                <router-view/>
                </div>
            </Card>
  </Content>
    </Layout>
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
        },
        menuitemClasses () {
            return [
                'menu-item',
                this.isCollapsed ? 'collapsed-menu-item' : ''
            ]
        }
    },
    methods: {
        collapsedSider: function (params) {
            this.$refs.sidebar.toggleCollapse();
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
    }
}
</script>
