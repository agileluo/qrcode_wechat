<template>
  <div class="page" v-show="!isScan">
    <div class="weui-msg" v-show="showGetInfo">
        <div class="weui-msg__text-area">
            <div class="weui-msg__title">授权提示!</div>
            <div class="weui-msg__desc">需要获取您的基础信息</div>
        </div>
        <div class="weui-msg__opr-area">
            <div class="weui-btn-area">
              <button class="weui-btn" type="primary" open-type="getUserInfo" @getuserinfo="getUserInfo">授权</button>
            </div>
        </div>
    </div>
    <div v-show="!showGetInfo">
      <div class="weui-flex">
        <div class="weui-flex__item">
          <picker  @change="changeGroup1" :value="group1" :range="group1List">
            <button class="weui-btn" size="mini" type="default">{{group1 ? gorup1ShortName : '一级分类'}}</button>
          </picker>
        </div>
        <div class="weui-flex__item">
          <picker  @change="changeGroup2" :value="group2" :range="group2List">
            <button class="weui-btn" size="mini" type="default">{{group2 ? gorup2ShortName : '二级分类'}}</button>
          </picker>
        </div>
        <div class="weui-flex__item">
          <picker  @change="changeGroup3" :value="group3" :range="group3List">
            <button class="weui-btn" size="mini" type="default">{{group3 ? gorup3ShortName : '三级分类'}}</button>
          </picker>
        </div>
      </div>
      <div class="weui-panel weui-panel_access">
          <div class="weui-panel__bd">
            <div class="weui-media-box weui-media-box_text">
              <div class="weui-media-box__desc">{{group1 ? group1 + ' - ' : ''}}  {{group2 ? group2 + ' - ' : ''}}  {{group3}}</div>
            </div>
          </div>
          <div class="weui-panel__ft" >
            <div>
                <input class="weui-input" v-model="group" placeholder="输入分类" />
            </div>
            <div>
              <button class="weui-btn myButton" size="mini" type="default" @click="addGroup1" :disabled="!group" >+1级</button>
              <button class="weui-btn myButton" size="mini" type="default" @click="addGroup2" :disabled="!group1 || !group" >+2级</button>
              <button class="weui-btn myButton" size="mini" type="default" @click="addGroup3" :disabled="!group2 || !group">+3级</button>
            </div>
            <div>
              <button class="weui-btn myButton" size="mini" type="primary" @click="queryMineLog()" >我的记录</button>
              <button class="weui-btn myButton" size="mini" type="primary" :disabled="!group1 || !group2 || !group3"  @click="downloadLog" >下载记录</button>
              <button class="weui-btn myButton" size="mini" type="primary" @click="scanCode" :disabled="!group3" >二维码扫描</button>
            </div>
          </div>
      </div>
      <div class="weui-form-preview" v-for="scan in scanList" :key="scan.id">
        <div class="weui-form-preview__bd">
          <div class="weui-form-preview__item">
            <div class="weui-form-preview__label">{{scan.group1}}-{{scan.group2}}-{{scan.group3}}</div>
          </div>
          <div class="weui-form-preview__item">
            <div class="weui-form-preview__label">{{scan.qrcode}}</div>
          </div>
          <div class="weui-form-preview__item">
            <div class="weui-form-preview__label"> {{scan.userId}} | {{scan.createTime}} </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {ajax} from '@/utils/index'
import store from '@/store/index'
import _ from 'underscore'
export default {
  data() {
    return {
      gorup1ShortName: null,
      gorup2ShortName: null,
      gorup3ShortName: null,
      group1: '',
      group1List: [],
      group1Map: {},
      group2: '',
      group2List: [],
      group2Map: {},
      group3: '',
      group3List: [],
      group3Map: {},
      scanList: [],
      isScan: false,
      userInfo: {},
      openId: null,
      showGetInfo: false,
      group: null,
      downLoadUrl: null
    }
  },
  mounted () {
    var _this = this;
    this.getUserInfo()
    this.queryUserInfo(function() {
      _this.queryGroup1List()
      _this.queryGroup2List()
      _this.queryGroup3List()
    })
  },
  methods: {
    addGroup1: function() {
      this.addGroup(1, null, this.group)
    },
    addGroup2: function() {
      this.addGroup(2, this.getGroupId(1, this.group1), this.group)
    },
    addGroup3: function() {
      this.addGroup(3, this.getGroupId(2, this.group2), this.group)
    },
    addGroup: function(level, parentId, name) {
      var _this = this
      ajax({
        url: 'https://www.cloudchained.cn/qrcode/group/add',
        data: {
          name: name,
          parentId: parentId,
          openId: _this.openId
        },
        method: 'POST',
        success (data) {
          var list = _this['group' + level + "List"]
          if (!_.contains(list, name)) {
            list.unshift(name)
          }
          wx.showToast({
            title: '增加成功',
            icon: 'success',
            duration: 2000
          })
          _this['group' + level] = name
          _this['gorup' + level + 'ShortName'] = _this.getShortGroupName(name)
          _this['group' + level + 'Map'][name] = data.id
        },
        fail (data) {
          wx.showModal({
            title: '出错',
            content: data.errorMsg ? data.errorMsg : '系统出错',
            success: function(res) {
            }
          })
        }
      })
    },
    queryGroup1List: function() {
      this.queryGroupList(null, 1)
    },
    queryGroup2List: function() {
      if (this.group1) {
        this.queryGroupList(this.getGroupId(1, this.group1), 2)
      }
    },
    queryGroup3List: function() {
      if (this.group2) {
        this.queryGroupList(this.getGroupId(2, this.group2), 3)
      }
    },
    getShortGroupName: function(group) {
      if (group && group.length > 4) {
        return group.substr(0, 4) + "."
      }
      return group
    },
    queryGroupList: function(parentId, num, callback) {
      var _this = this
      ajax({
        url: 'https://www.cloudchained.cn/qrcode/group/groupList',
        method: 'GET',
        data: {
          parentId: parentId || '',
          openId: _this.openId
        },
        success (data) {
          var list = []
          var map = {}
          _.each(data, function(d) {
            list.push(d.name)
            map[d.name] = d.id
          })
          _this['group' + num + 'List'] = list
          _this['group' + num + 'Map'] = map
          if (callback) {
            callback()
          }
        }
      })
    },
    getGroupId(num, name) {
      console.info(num, name)
      return this['group' + num + 'Map'][name]
    },
    changeGroup1(e) {
      this.group1 = this.group1List[e.mp.detail.value]
      this.gorup1ShortName = this.getShortGroupName(this.group1)
      this.group2 = ''
      this.group3 = ''
      this.queryGroup2List()
    },
    changeGroup2(e) {
      this.group2 = this.group2List[e.mp.detail.value]
      this.gorup2ShortName = this.getShortGroupName(this.group2)
      this.group3 = ''
      this.queryGroup3List()
    },
    changeGroup3(e) {
      this.group3 = this.group3List[e.mp.detail.value]
      this.gorup3ShortName = this.getShortGroupName(this.group3)
    },
    scanCode: function() {
      var _this = this;
      _this.isScan = true
      wx.scanCode({
        onlyFromCamera: true,
        scanType: ['qrCode'],
        success: (res) => {
          ajax({
            url: 'https://www.cloudchained.cn/qrcode/log/add',
            method: 'POST',
            data: {
              userId: _this.userInfo.nickName,
              openId: _this.openId,
              group1: _this.group1,
              group2: _this.group2,
              group3: _this.group3,
              qrcode: res.result
            },
            success (data) {
              var isExist = _.find(_this.scanList, function(s) {
                return s.id === data.id
              })
              if (isExist) {
                wx.showModal({
                  title: '提示！',
                  content: '已被【' + data.userId + '】- 于【' + data.createTime + '】扫描到: ' + data.group1 + ' - ' + data.group2 + ' - ' + data.group3,
                  success: function(res) {
                  }
                })
              } else {
                wx.showToast({
                  title: '成功扫描入库',
                  icon: 'success',
                  duration: 2000
                })
                _this.scanList.unshift(data)
              }
            },
            fail (data) {
              wx.showModal({
                title: '出错',
                content: data.errorMsg ? data.errorMsg : '系统出错',
                success: function(res) {
                }
              })
            }
          })
        },
        fail: (err) => {
          console.info(err)
        },
        complete: (res) => {
          this.isScan = false
        }
      })
    },
    queryUserInfo(callback) {
      var _this = this
      this.loading = true
      wx.login({
        success: (res) => {
          ajax({
            url: 'https://www.cloudchained.cn/qrcode/login',
            data: {
              code: res.code
            },
            success (data) {
              console.info(data)
              store.commit('SET_OPENID', data.openid)
              _this.openId = data.openid
              _this.queryLogList()
              _this.loading = false
              if (callback) {
                callback()
              }
            }
          })
        }
      })
    },
    getUserInfo(res) {
      var _this = this
      if (!res) {
        wx.getUserInfo({
          success: (res) => {
            console.info(res.userInfo)
            _this.userInfo = res.userInfo
          },
          fail: () => {
            _this.showGetInfo = true
          }
        })
      } else {
        this.showGetInfo = false
        this.userInfo = res.userInfo
      }
    },
    queryLogList: function() {
      var _this = this
      ajax({
        url: 'https://www.cloudchained.cn/qrcode/log/pageQuery',
        method: 'POST',
        data: {
          page: 1,
          pageSize: 20,
          data: {
            openId: _this.openId
          }
        },
        success (data) {
          _this.scanList = data.items
        }
      })
    },
    queryMineLog: function() {
      var _this = this
      ajax({
        url: 'https://www.cloudchained.cn/qrcode/log/pageQuery',
        method: 'POST',
        data: {
          page: 1,
          pageSize: 100,
          data: {
            openId: _this.openId
          }
        },
        success (data) {
          _this.scanList = data.items
        }
      })
    },
    downloadLog (contract) {
      wx.showLoading({
        title: '记录下载中...',
        mask: true
      })
      var downLoadUrl = "https://www.cloudchained.cn/qrcode/log/downLoad?group1=" +
        encodeURIComponent(this.group1) +
        "&group2=" + encodeURIComponent(this.group2) +
        "&group3=" + encodeURIComponent(this.group3)
      wx.downloadFile({
        url: downLoadUrl,
        success: function (res) {
          var filePath = res.tempFilePath
          wx.openDocument({
            filePath: filePath,
            fileType: 'xlsx',
            success: function (res) {
              console.log('打开文档成功')
            },
            error: function (err) {
              console.info(err)
            }
          })
        },
        complete: function () {
          wx.hideLoading()
        }
      })
    }
  }
}
</script>

<style>
page {
  margin-top: 10px;
  padding: 10px;
}
.myButton {
  margin-left: 10px;
}
</style>