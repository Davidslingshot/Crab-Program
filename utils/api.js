const BASE_URL = 'http://175.27.225.217/api';

function request(url, method = 'GET', data) {
  return new Promise((resolve, reject) => {
    const options = {
      url: `${BASE_URL}${url}`,
      method,
      header: {
        'content-type': 'application/json'
      },
      success: (res) => {
        console.log('api request', method, url, res.statusCode, res.data);
        if (res.statusCode === 200) {
          resolve(res.data);
        } else {
          reject(res.data);
        }
      },
      fail: (err) => {
        console.error('api fail', method, url, err);
        reject(err);
      }
    };
    if (data !== undefined) {
      options.data = data;
    }
    wx.request(options);
  });
}

function pickOrder(res, cardNo) {
  if (!res) return null;
  if (res.order && res.order.orderId) return res.order;
  if (Array.isArray(res.data)) {
    if (cardNo) {
      const found = res.data.find(function (o) { return o && o.cardNo === cardNo; });
      if (found) return found;
    }
    return res.data[0] || null;
  }
  if (res.data && res.data.orderId) return res.data;
  if (res.orderId) return res;
  return null;
}

function validateCard(cardNo, password) {
  return request('/cards/validate', 'POST', { cardNo, password });
}

function createOrder(cardNo, name, phone, address, remark) {
  return request('/orders', 'POST', { cardNo, name, phone, address, remark });
}

function getOrders(status = 'all') {
  return request(`/orders?status=${status}`);
}

function getMyOrder(cardNo, password) {
  return request('/orders/mine', 'POST', { cardNo: cardNo, password: password }).catch(function () {
    return request('/orders/bycard/' + encodeURIComponent(cardNo));
  });
}

function confirmReceipt(cardNo, password, orderId) {
  return request('/orders/confirm', 'POST', { cardNo, password, orderId });
}

function updateOrderStatus(orderId, status) {
  return request(`/orders/${orderId}/status`, 'PUT', { status });
}

function getCards() {
  return request('/cards');
}

function importCards(newCards) {
  return request('/cards/import', 'POST', { newCards });
}

function deleteCard(cardNo) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${BASE_URL}/cards/${encodeURIComponent(cardNo)}`,
      method: 'DELETE',
      header: {
        'content-type': 'application/json'
      },
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.data);
        } else {
          reject(res.data);
        }
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
}

function exportOrders() {
  return new Promise((resolve, reject) => {
    wx.downloadFile({
      url: `${BASE_URL}/orders/export`,
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.tempFilePath);
        } else {
          reject(new Error('下载失败'));
        }
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
}

module.exports = {
  validateCard,
  createOrder,
  getOrders,
  getMyOrder,
  getOrderByCard: getMyOrder,
  pickOrder,
  confirmReceipt,
  updateOrderStatus,
  getCards,
  importCards,
  deleteCard,
  exportOrders
};