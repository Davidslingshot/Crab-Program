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
    agreed: false
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
    const { card, name, phone, address, remark, agreed } = this.data;
    
    if (!agreed) {
      this.setData({ error: '请先阅读并同意《用户服务协议》和《隐私政策》' });
      return;
    }
    
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
      const usedCard = {
        ...card,
        status: 'used',
        orderId: result.order && result.order.orderId
      };
      wx.setStorageSync('currentCard', usedCard);
      this.setData({
        loading: false,
        submitted: true,
        order: result.order || {},
        card: usedCard
      });
      wx.showToast({
        title: '订购成功',
        icon: 'success',
        duration: 1500
      });
      setTimeout(() => {
        wx.redirectTo({ url: '/pages/order/index' });
      }, 1500);
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