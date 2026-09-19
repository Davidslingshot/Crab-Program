const api = require('../../utils/api.js');

Page({
  data: {
    order: null,
    card: null,
    loading: true
  },

  onLoad() {
    const card = wx.getStorageSync('currentCard');
    console.log('order page - currentCard:', card);
    
    if (!card) {
      wx.redirectTo({ url: '/pages/login/index' });
      return;
    }
    
    api.getOrderByCard(card.cardNo).then(res => {
      console.log('order page - order response:', res);
      if (res.success && res.hasOrder) {
        this.setData({ card: res.card, order: res.order, loading: false });
      } else if (res.success && !res.hasOrder) {
        this.setData({ card: res.card, order: null, loading: false });
      } else {
        this.setData({ card, order: null, loading: false });
      }
    }).catch(err => {
      console.error('Failed to get order:', err);
      this.setData({ card, order: null, loading: false });
    });
  },

  goBack() {
    wx.navigateBack();
  },

  goPickup() {
    wx.redirectTo({ url: '/pages/pickup/index' });
  },

  async confirmReceipt() {
    wx.showModal({
      title: '确认收货',
      content: '请确认您已收到货物',
      success: async (modalRes) => {
        if (modalRes.confirm) {
          try {
            const result = await api.updateOrderStatus(this.data.order.orderId, 'completed');
            if (result.success) {
              wx.showToast({
                title: '确认成功',
                icon: 'success'
              });
              this.setData({ order: { ...this.data.order, status: 'completed' } });
            } else {
              wx.showToast({
                title: '操作失败',
                icon: 'none'
              });
            }
          } catch (err) {
            console.error('confirmReceipt error:', err);
            wx.showToast({
              title: '网络错误',
              icon: 'none'
            });
          }
        }
      }
    });
  },

  logout() {
    wx.removeStorageSync('currentCard');
    wx.redirectTo({ url: '/pages/login/index' });
  }
});