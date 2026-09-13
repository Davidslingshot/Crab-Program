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
    
    api.getOrders().then(res => {
      console.log('order page - orders response:', res);
      let order = null;
      if (res.success && Array.isArray(res.data)) {
        console.log('order page - looking for cardNo:', card.cardNo);
        order = res.data.find(o => o.cardNo === card.cardNo);
        console.log('order page - found order:', order);
      }
      this.setData({ card, order, loading: false });
    }).catch(err => {
      console.error('Failed to get order:', err);
      this.setData({ card, order: null, loading: false });
    });
  },

  goBack() {
    wx.navigateBack();
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