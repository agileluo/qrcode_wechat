import * as type from './mutation-types';
const mutations = {
  [type.SET_MPVUEINFO](state, mpvueInfo) { // eslint-disable-line
    state.mpvueInfo = mpvueInfo;
  },
  SET_TOKEN (state, token) {
    state.token = token
  },
  SET_OPENID (state, openId) {
    state.openId = openId
  },
  SET_WXNAME (state, wxName) {
    state.wxName = wxName
  },
  SET_FINANCE_RATE (state, financeRate) {
    state.financeRate = financeRate
  },
  SET_DATA_CHANGE (state, item) {
    state.dataChange[item] = true
  },
  CLEAR_DATA_CHANGE (state, item) {
    state.dataChange[item] = false
  }
}

export default mutations;
