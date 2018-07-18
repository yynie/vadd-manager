<template>
    <div>
        <ul style="marginLeft:70px">
          <li v-for="(item, index) in row.sub">
              <span style="paddingRight:60px">{{item.phonenum}}</span>
              <span style="paddingRight:50px">{{item.createtime}}</span>
              <span style="paddingRight:40px">{{item.updatetime}}</span>
              <span style="paddingRight:70px">{{item.status}}</span>
              <span >{{item.verifysms}}</span>
          </li>
        </ul>
    </div>
</template>
<script>
    export default {
        props: {
            row: Object
        }
    };
</script>