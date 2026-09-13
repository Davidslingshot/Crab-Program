const api = require('../../utils/api.js');

Page({
  data: {
    cardNo: '',
    password: '',
    error: '',
    loading: false
  },

  onLoad() {
    const card = wx.getStorageSync('currentCard');
    if (card) {
      api.validateCard(card.cardNo, card.password).then(res => {
        if (res.success) {
          wx.setStorageSync('currentCard', res.card);
          if (res.isUsed) {
            wx.redirectTo({ url: '/pages/order/index' });
          } else {
            wx.redirectTo({ url: '/pages/pickup/index' });
          }
        }
      }).catch(() => {
        wx.removeStorageSync('currentCard');
      });
    }
  },

  handleCardNoInput(e) {
    this.setData({ cardNo: e.detail.value.toUpperCase() });
  },

  handlePasswordInput(e) {
    this.setData({ password: e.detail.value });
  },

  async submit() {
    const { cardNo, password } = this.data;
    
    if (!cardNo.trim()) {
      this.setData({ error: '请输入卡号' });
      return;
    }
    
    if (!password.trim()) {
      this.setData({ error: '请输入密码' });
      return;
    }

    this.setData({ loading: true, error: '' });

    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      const result = await api.validateCard(cardNo, password);
      
      if (result.success) {
        this.setData({ loading: false });
        wx.setStorageSync('currentCard', result.card);
        if (result.isUsed) {
          wx.redirectTo({ url: '/pages/order/index' });
        } else {
          wx.redirectTo({ url: '/pages/pickup/index' });
        }
      } else {
        this.setData({ error: result.message || '登录失败', loading: false });
      }
    } catch (error) {
      console.error('登录请求失败:', error);
      this.setData({ 
        error: '网络错误，请重新尝试', 
        loading: false 
      });
    }
  }
});