const api = require('../../utils/api.js');

function pickPlainOrder(res, cardNo) {
  var raw = null;
  if (res && res.order && res.order.orderId) raw = res.order;
  else if (res && res.data && res.data.length) {
    raw = res.data[0];
    var i;
    for (i = 0; i < res.data.length; i++) {
      if (res.data[i] && res.data[i].cardNo === cardNo) {
        raw = res.data[i];
        break;
      }
    }
  }
  if (!raw || !raw.orderId) return null;
  return {
    orderId: raw.orderId || '',
    cardNo: raw.cardNo || '',
    name: raw.name || '',
    phone: raw.phone || '',
    address: raw.address || '',
    remark: raw.remark || '',
    createTime: raw.createTime || '',
    status: raw.status || 'pending',
    shipTime: raw.shipTime || '',
    completeTime: raw.completeTime || ''
  };
}

Page({
  data: {
    buildTag: 'ORDER-FIX-3',
    hasOrder: false,
    loading: true,
    orderId: '',
    orderName: '',
    orderPhone: '',
    orderAddress: '',
    orderRemark: '',
    orderTime: '',
    orderStatus: '',
    shipTime: '',
    cardNo: '',
    cardStatus: ''
  },

  onLoad: function () {
    console.log('ORDER_BUILD ORDER-FIX-3');
    this.loadOrder();
  },

  onShow: function () {
    this.loadOrder();
  },

  loadOrder: function () {
    var storedCard = wx.getStorageSync('currentCard') || {};
    console.log('order page - currentCard:', storedCard);

    if (!storedCard.cardNo) {
      wx.redirectTo({ url: '/pages/login/index' });
      return;
    }

    this.setData({
      loading: true,
      cardNo: storedCard.cardNo || '',
      cardStatus: storedCard.status || ''
    });

    var that = this;
    api.getMyOrder(storedCard.cardNo, storedCard.password).then(function (res) {
      console.log('order page - order response:', res);
      var order = pickPlainOrder(res, storedCard.cardNo);
      that.applyOrder(order, storedCard);
    }).catch(function (err) {
      console.error('Failed to get order:', err);
      var cached = wx.getStorageSync('currentOrder');
      var order = pickPlainOrder({ order: cached, data: cached ? [cached] : [] }, storedCard.cardNo);
      that.applyOrder(order, storedCard);
    });
  },

  applyOrder: function (order, storedCard) {
    var hasOrder = !!(order && order.orderId);
    if (hasOrder) {
      wx.setStorageSync('currentOrder', order);
    }
    this.setData({
      loading: false,
      hasOrder: hasOrder,
      orderId: hasOrder ? order.orderId : '',
      orderName: hasOrder ? order.name : '',
      orderPhone: hasOrder ? order.phone : '',
      orderAddress: hasOrder ? order.address : '',
      orderRemark: hasOrder ? order.remark : '',
      orderTime: hasOrder ? order.createTime : '',
      orderStatus: hasOrder ? order.status : '',
      shipTime: hasOrder ? order.shipTime : '',
      cardNo: storedCard.cardNo || '',
      cardStatus: storedCard.status || ''
    });
  },

  confirmReceipt: function () {
    var that = this;
    var storedCard = wx.getStorageSync('currentCard') || {};
    wx.showModal({
      title: '确认收货',
      content: '请确认您已收到货物',
      success: function (modalRes) {
        if (!modalRes.confirm) return;
        api.confirmReceipt(storedCard.cardNo, storedCard.password, that.data.orderId).then(function (result) {
          if (result && result.success) {
            wx.showToast({ title: '确认成功', icon: 'success' });
            that.setData({ orderStatus: 'completed' });
          } else {
            wx.showToast({ title: '操作失败', icon: 'none' });
          }
        }).catch(function () {
          wx.showToast({ title: '网络错误', icon: 'none' });
        });
      }
    });
  },

  openService: function () {
    wx.navigateTo({ url: '/pages/legal/index?type=service' });
  },

  openPrivacy: function () {
    wx.navigateTo({ url: '/pages/legal/index?type=privacy' });
  },

  logout: function () {
    wx.removeStorageSync('currentCard');
    wx.removeStorageSync('currentOrder');
    wx.redirectTo({ url: '/pages/login/index' });
  }
});
