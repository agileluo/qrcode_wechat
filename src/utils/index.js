import store from '@/store/index'

function formatNumber (n) {
  const str = n.toString()
  return str[1] ? str : `0${str}`
}

export function formatTime (date) {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()

  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  const t1 = [year, month, day].map(formatNumber).join('/')
  const t2 = [hour, minute, second].map(formatNumber).join(':')

  return `${t1} ${t2}`
}

export function parseTime (time, cFormat) {
  if (!time) {
    return null
  }
  if (arguments.length === 0) {
    return null
  }
  const format = cFormat || '{y}-{m}-{d} {h}:{i}:{s}'
  let date
  if (typeof time === 'object') {
    date = time
  } else {
    if (('' + time).length === 10) time = parseInt(time) * 1000
    date = new Date(time)
  }
  const formatObj = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay()
  }
  const timeStr = format.replace(/{(y|m|d|h|i|s|a)+}/g, (result, key) => {
    let value = formatObj[key]
    if (key === 'a') return ['一', '二', '三', '四', '五', '六', '日'][value - 1]
    if (result.length > 0 && value < 10) {
      value = '0' + value
    }
    return value || 0
  })
  return timeStr
}

export function amountFormat (amount) {
  if (!amount && amount !== 0) {
    return null
  }
  return '¥' + parseFloat(amount).toFixed(2).toString().replace(/^-?\d+/g, m => m.replace(/(?=(?!\b)(\d{3})+$)/g, ','))
}

export function ajax (option) {
  var _this = option.target;
  const loading = option.loading
  if (loading) {
    if (loading.tips) {
      wx.showLoading({
        title: option.loading.tips || '请求处理中...',
        mask: true
      })
    }
    if (loading.loadView) {
      _this[loading.loadView] = true
      console.info(_this[loading.loadView])
    }
    if (loading.button) {
      loading.button.disabled = true
      loading.button.oldText = loading.button.text
      loading.button.text = '请求中。。。'
    }
  }
  wx.request({
    url: option.url,
    data: option.data,
    method: option.method || 'GET',
    header: {
      openId: store.state.openId
    },
    success (res) {
      var data = res.data
      if (data.result === 'success') {
        option.success(data.content)
      } else {
        if (option.fail) {
          option.fail(data)
        }
      }
    },
    fail (err) {
      if (option.fail) {
        option.fail(err)
      }
    },
    complete () {
      if (loading) {
        if (loading.loadView) {
          setTimeout(() => {
            _this[loading.loadView] = false
          }, 200)
        }
        if (loading.button) {
          loading.button.disabled = false
          loading.button.text = loading.button.oldText
        }
        if (loading.tips) {
          wx.hideLoading()
        }
      }
    }
  })
}

export function deepClone (source) {
  if (!source && typeof source !== 'object') {
    throw new Error('error arguments', 'shallowClone')
  }
  const targetObj = source.constructor === Array ? [] : {}
  Object.keys(source).forEach((keys) => {
    if (source[keys] && typeof source[keys] === 'object') {
      targetObj[keys] = deepClone(source[keys])
    } else {
      targetObj[keys] = source[keys]
    }
  })
  return targetObj
}

export function amountLe (amount1, amount2) {
  return parseFloat(amount1).toFixed(2) - parseFloat(amount2).toFixed(2) > 0
}

export function tradeStatusFormat (type, status) {
  const transferMap = {
    '0': '待签章',
    '1': '待签收',
    '2': '交易成功',
    '3': '已取消',
    '4': '已拒绝'
  }
  const financeMap = {
    '0': '待签章',
    '1': '待审核',
    '2': '放款中',
    '3': '交易成功',
    '4': '已取消',
    '5': '审核驳回',
    '6': '审核失败',
    '7': '放款失败'
  }
  if (type === 1) {
    return transferMap[status]
  } else {
    return financeMap[status]
  }
}

export function assetStatusFormat (status) {
  const map = {
    'INIT': '初始',
    'APPROVE': '审核通过',
    'REJECT': '审核拒绝',
    'LOCK': '锁定',
    'BIND': '绑定'
  }
  return map[status]
}
export function assetStatusTypeFormat (status) {
  const map = {
    INIT: 'info',
    APPROVE: 'success',
    REJECT: 'warning',
    LOCK: 'warning',
    BIND: 'info'
  }
  return map[status]
}

export function tokenStatusFormat (status) {
  const map = {
    'ACTIVE': '正常',
    'FROZEN': '冻结',
    'CLOSE': '关闭'
  }
  return map[status]
}

export function companyStatusFormat (status) {
  const map = {
    'NEW': '暂存',
    'PENDING_REVIEW': '待审核',
    'REJECTED': '审核拒绝',
    'NORMAL': '正常',
    'LOCKED': '锁定'
  }
  return map[status]
}

export function companyTypeFormat (status) {
  const map = {
    'ANCHOR': '核心企业',
    'SUPPLIER': '供应商'
  }
  return map[status]
}

export function idTypeFormat (status) {
  const map = {
    'IDCARD': '身份证',
    'PASSPORT': '护照',
    'FOREIGN': '外国人永久居留证',
    'GAJMLW': '港澳居民来往内地通行证',
    'TWJMLW': '台湾居民来往大陆通行证',
    'QTZJLX': '其他证件类型'
  }
  return map[status]
}

export function tokenOpenStatusFormat (status) {
  const map = {
    '1': '待签章',
    '2': '待审核',
    '3': '待签收',
    '4': '完成',
    '5': '已取消',
    '6': '已拒收'
  }
  return map[status]
}

export function formatToken (token) {
  if (!token) {
    return
  }
  token.startDate = parseTime(token.assetVo.startDate, '{y}-{m}-{d}')
  token.endDate = parseTime(token.assetVo.endDate, '{y}-{m}-{d}')
  token.amountView = amountFormat(token.amount)
  token.assetVo.amountView = amountFormat(token.assetVo.amount)
  token.availableDays = token.assetVo.availableDays
  token.availableDaysView = token.availableDays + '天'
  token.statusView = tokenStatusFormat(token.status)
  return token
}

export function formatTokenOpen (open) {
  if (!open) {
    return
  }
  open.amountView = amountFormat(open.amount)
  open.updatedDate = parseTime(open.updatedDate, '{y}-{m}-{d} {h}:{i}:{s}')
  open.statusView = tokenOpenStatusFormat(open.status)
  return open
}

export function formatAsset (asset) {
  if (!asset) {
    return
  }
  asset.amountView = amountFormat(asset.amount)
  asset.updatedDate = parseTime(asset.updatedDate, '{y}-{m}-{d} {h}:{i}:{s}')
  asset.statusView = assetStatusFormat(asset.status)
  asset.startDate = parseTime(asset.startDate, '{y}-{m}-{d}')
  asset.endDate = parseTime(asset.endDate, '{y}-{m}-{d}')
  asset.availableDaysView = asset.availableDays + '天'
  return asset
}

export function isNotEmpty (list) {
  return list && list.length > 0
}

export function formatCompany (company) {
  if (!company) {
    return
  }
  company.legalPersonIdType = idTypeFormat(company.legalPersonIdType)
  company.idType = idTypeFormat(company.idType)
  company.stateView = companyStatusFormat(company.state)
  return company
}
