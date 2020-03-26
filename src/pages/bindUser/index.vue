<template>
  <div class="page">
    <div class="page__hd">
      <div class="page__title">用户绑定</div>
      <div class="page__desc"></div>
    </div>
    <div class="page__bd">
      <div class="weui-cells__title">用户信息</div>
      <div class="weui-cells weui-cells_after-title">
         <div class="weui-cell weui-cell_input weui-cell_vcode">
          <div class="weui-cell__hd">
            <div class="weui-label">用户名</div>
          </div>
          <div class="weui-cell__bd">
            <input class="weui-input" v-model="bind.userName" placeholder="请输入用户名" />
          </div>
        </div>
        <div class="weui-cell weui-cell_input weui-cell_vcode">
          <div class="weui-cell__hd">
            <div class="weui-label">密码</div>
          </div>
          <div class="weui-cell__bd">
            <input class="weui-input" password="true" v-model="bind.password" placeholder="请输入密码" />
          </div>
        </div>
        <div  v-show="bindError" class="weui-cell weui-cell_input">
          <div class="weui-cell__hd">
            <div class="weui-label"></div>
          </div>
          <div class="weui-cell__bd  weui-cell_warn">
            <div class="weui-input" >{{bindError}}</div>
          </div>
          <div class="weui-cell__ft">
          </div>
        </div>
      </div>
      <div  class="weui-btn-area">
        <button class="weui-btn  mini-btn" type="primary" @click="bindUser">绑定</button>
      </div>
    </div>
  </div>
</template>

<script>

import store from '@/store/index'
import { ajax } from '@/utils/index'

export default {
  components: {
  },
  data () {
    return {
      bind: {
        userName: null,
        password: null
      },
      bindError: null
    }
  },
  onLoad () {
    this.clearData()
  },
  methods: {
    clearData () {
      this.userName = null
      this.password = null
      this.bindError = null
    },
    bindUser () {
      var _this = this
      var data = _this.bind
      _this.bindError = null
      data.openId = store.state.openId
      data.wxName = store.state.wxName
      if (!data.userName) {
        this.bindError = '用户名不能为空'
        return
      }
      if (!data.password) {
        this.bindError = '密码不能为空'
        return
      }
      _this.bindError = null
      ajax({
        url: 'https://www.cloudchained.cn/qrcode/bindUser',
        data: data,
        loading: {tips: '绑定中。。。'},
        method: 'post',
        success (data) {
          wx.showToast({
            title: '绑定成功',
            icon: 'success',
            duration: 3000
          });
          store.commit('SET_DATA_CHANGE', data)
          wx.redirectTo({
            url: '../index/main'
          })
        },
        fail (data) {
          console.info(data)
          if (data.errorMsg) {
            _this.bindError = data.errorMsg
          } else {
            _this.bindError = '系统出错!'
          }
        }
      })
    }
  },
  mounted () {
  }
}

</script>
<style>
</style>
