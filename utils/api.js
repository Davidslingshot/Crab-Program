const BASE_URL = 'http://localhost:3000/api';

function request(url, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${BASE_URL}${url}`,
      method,
      data,
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

function validateCard(cardNo, password) {
  return request('/cards/validate', 'POST', { cardNo, password });
}

function createOrder(cardNo, name, phone, address, remark) {
  return request('/orders', 'POST', { cardNo, name, phone, address, remark });
}

function getOrders(status = 'all') {
  return request(`/orders?status=${status}`);
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
  updateOrderStatus,
  getCards,
  importCards,
  deleteCard,
  exportOrders
};