const api = require('../../utils/api.js');

Page({
  data: {
    card: null,
    name: '',
    phone: '',
    address: '',
    remark: '',
    error: '',
    loading: false,
    submitted: false,
    order: null
  },

  onLoad() {
    const card = wx.getStorageSync('currentCard');
    if (!card) {
      wx.redirectTo({ url: '/pages/login/index' });
      return;
    }
    if (card.status === 'used') {
      wx.redirectTo({ url: '/pages/order/index' });
      return;
    }
    this.setData({ card });
  },

  handleNameInput(e) {
    this.setData({ name: e.detail.value });
  },

  handlePhoneInput(e) {
    this.setData({ phone: e.detail.value });
  },

  handleAddressInput(e) {
    this.setData({ address: e.detail.value });
  },

  handleRemarkInput(e) {
    this.setData({ remark: e.detail.value });
  },

  async submit() {
    const { card, name, phone, address, remark } = this.data;
    
    if (!name.trim()) {
      this.setData({ error: '请输入收货人姓名' });
      return;
    }
    
    if (!phone.trim()) {
      this.setData({ error: '请输入联系电话' });
      return;
    }
    
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      this.setData({ error: '请输入正确的手机号码' });
      return;
    }
    
    if (!address.trim()) {
      this.setData({ error: '请输入详细收货地址' });
      return;
    }

    this.setData({ loading: true, error: '' });

    await new Promise(resolve => setTimeout(resolve, 500));

    const result = await api.createOrder(card.cardNo, name, phone, address, remark);
    
    if (result.success) {
      this.setData({ loading: false });
      wx.showToast({
        title: '订购成功',
        icon: 'success',
        duration: 2000
      });
      setTimeout(() => {
        wx.removeStorageSync('currentCard');
        wx.redirectTo({ url: '/pages/login/index' });
      }, 2000);
    } else {
      this.setData({ error: result.message, loading: false });
    }
  },

  goBack() {
    wx.removeStorageSync('currentCard');
    wx.redirectTo({ url: '/pages/login/index' });
  },

  viewOrder() {
    wx.redirectTo({ url: '/pages/order/index' });
  }
});