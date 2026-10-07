const api = require('../../utils/api.js');

Page({
  data: {
    cardNo: '',
    password: '',
    error: '',
    loading: false,
    agreed: false
  },

  onLoad() {
    const card = wx.getStorageSync('currentCard');
    if (card) {
      api.validateCard(card.cardNo, card.password).then(res => {
        if (res.success) {
          wx.setStorageSync('currentCard', res.card);
          if (res.order) {
            wx.setStorageSync('currentOrder', res.order);
          }
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
    const value = (e.detail.value || '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    this.setData({ cardNo: value });
  },

  handlePasswordInput(e) {
    const value = (e.detail.value || '').replace(/[^\x20-\x7E]/g, '');
    this.setData({ password: value });
  },

  toggleAgree() {
    this.setData({ agreed: !this.data.agreed, error: '' });
  },

  openService() {
    wx.navigateTo({ url: '/pages/legal/index?type=service' });
  },

  openPrivacy() {
    wx.navigateTo({ url: '/pages/legal/index?type=privacy' });
  },

  async submit() {
    const { cardNo, password, agreed } = this.data;
    
    if (!agreed) {
      this.setData({ error: '请先阅读并同意《用户服务协议》和《隐私政策》' });
      return;
    }

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
        if (result.order) {
          wx.setStorageSync('currentOrder', result.order);
        }
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