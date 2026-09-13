// app.js
App({
  onLaunch() {
    console.log('App Launch');
    this.initData();
  },

  onShow() {
    console.log('App Show');
  },

  onHide() {
    console.log('App Hide');
  },

  initData() {
    try {
      const initialized = wx.getStorageSync('crab_initialized');
      const existingCards = wx.getStorageSync('crab_cards');
      const existingOrders = wx.getStorageSync('crab_orders');
      
      console.log('initData - initialized:', initialized, 'type:', typeof initialized);
      console.log('initData - existingCards:', existingCards, 'type:', typeof existingCards);
      console.log('initData - existingOrders:', existingOrders, 'type:', typeof existingOrders);
      
      if (initialized !== 'true') {
        console.log('Initializing default cards...');
        
        const defaultCards = [
          { cardNo: 'CRAB20240001', password: '123456', status: 'unused', orderId: null },
          { cardNo: 'CRAB20240002', password: 'abcdef', status: 'unused', orderId: null },
          { cardNo: 'CRAB20240003', password: '888888', status: 'unused', orderId: null },
          { cardNo: 'CRAB20240004', password: '666666', status: 'unused', orderId: null },
          { cardNo: 'CRAB20240005', password: '111111', status: 'unused', orderId: null },
          { cardNo: 'CRAB20240006', password: '222222', status: 'unused', orderId: null },
          { cardNo: 'CRAB20240007', password: '333333', status: 'unused', orderId: null },
          { cardNo: 'CRAB20240008', password: '444444', status: 'unused', orderId: null },
          { cardNo: 'CRAB20240009', password: '555555', status: 'unused', orderId: null },
          { cardNo: 'CRAB20240010', password: '777777', status: 'unused', orderId: null },
        ];

        wx.setStorageSync('crab_cards', JSON.stringify(defaultCards));
        wx.setStorageSync('crab_initialized', 'true');
        wx.setStorageSync('crab_orders', JSON.stringify([]));
        
        console.log('Default cards and orders initialized');
      } else {
        console.log('Cards already initialized');
        
        if (existingOrders === '' || existingOrders === null) {
          wx.setStorageSync('crab_orders', JSON.stringify([]));
          console.log('Orders storage was empty, initialized to empty array');
        } else {
          try {
            const parsedOrders = JSON.parse(existingOrders);
            console.log('Existing orders found:', parsedOrders.length, 'orders');
          } catch (e) {
            console.error('Failed to parse existing orders:', e);
            wx.setStorageSync('crab_orders', JSON.stringify([]));
          }
        }
      }

      const orders = wx.getStorageSync('crab_orders');
      console.log('Final orders in storage:', orders);
    } catch (e) {
      console.error('initData error:', e);
    }
  }
});