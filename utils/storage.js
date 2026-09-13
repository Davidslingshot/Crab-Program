const CARD_KEY = 'crab_card_current';
const ADMIN_KEY = 'admin_token';

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

const adminUser = {
  username: 'admin',
  password: 'admin123'
};

function getCards() {
  try {
    const data = wx.getStorageSync('crab_cards');
    if (data !== '') {
      const cards = JSON.parse(data);
      return Array.isArray(cards) && cards.length > 0 ? cards : defaultCards;
    }
    return defaultCards;
  } catch {
    return defaultCards;
  }
}

function saveCards(cards) {
  wx.setStorageSync('crab_cards', JSON.stringify(cards));
}

function getOrders() {
  try {
    const data = wx.getStorageSync('crab_orders');
    if (data !== '') {
      const orders = JSON.parse(data);
      return Array.isArray(orders) ? orders : [];
    }
    return [];
  } catch (e) {
    console.error('getOrders error:', e);
    return [];
  }
}

function saveOrders(orders) {
  const data = JSON.stringify(orders);
  wx.setStorageSync('crab_orders', data);
  console.log('saveOrders - saved successfully, count:', orders.length);
  console.log('saveOrders - data:', data);
}

function validateCard(cardNo, password) {
  const cards = getCards();
  const card = cards.find(c => c.cardNo === cardNo && c.password === password);
  
  if (!card) {
    return { success: false, message: '卡号或密码错误' };
  }
  
  return { success: true, message: card.status === 'used' ? '已提货' : '验证成功', card, isUsed: card.status === 'used' };
}

function createOrder(cardNo, name, phone, address, remark) {
  const cards = getCards();
  const orders = getOrders();
  
  console.log('createOrder - cards:', cards);
  console.log('createOrder - existing orders:', orders);
  
  const card = cards.find(c => c.cardNo === cardNo);
  if (!card || card.status === 'used') {
    return { success: false, message: '蟹卡无效' };
  }
  
  const orderId = 'ORD' + Date.now();
  const order = {
    orderId,
    cardNo,
    name,
    phone,
    address,
    remark: remark || '',
    createTime: new Date().toLocaleString('zh-CN'),
    status: 'pending'
  };
  
  card.status = 'used';
  card.orderId = orderId;
  
  orders.push(order);
  
  saveCards(cards);
  saveOrders(orders);
  
  console.log('createOrder - saved orders:', orders);
  
  return { success: true, message: '提货申请提交成功', order };
}

function updateOrderStatus(orderId, status) {
  const orders = getOrders();
  const orderIndex = orders.findIndex(o => o.orderId === orderId);
  
  if (orderIndex === -1) {
    return { success: false, message: '订单不存在' };
  }
  
  orders[orderIndex].status = status;
  saveOrders(orders);
  
  return { success: true, message: '订单状态已更新' };
}

function getCardByNo(cardNo) {
  const cards = getCards();
  return cards.find(c => c.cardNo === cardNo);
}

function getOrderById(orderId) {
  const orders = getOrders();
  return orders.find(o => o.orderId === orderId);
}

function importCards(newCards) {
  const cards = getCards();
  const existingNos = new Set(cards.map(c => c.cardNo));
  
  let imported = 0;
  let skipped = 0;
  
  newCards.forEach(card => {
    if (!existingNos.has(card.cardNo)) {
      cards.push({
        cardNo: card.cardNo,
        password: card.password,
        status: 'unused',
        orderId: null
      });
      imported++;
    } else {
      skipped++;
    }
  });
  
  saveCards(cards);
  
  return { success: true, imported, skipped, total: newCards.length };
}

function validateAdmin(username, password) {
  if (username === adminUser.username && password === adminUser.password) {
    wx.setStorageSync(ADMIN_KEY, 'admin_token');
    return { success: true, message: '登录成功' };
  }
  return { success: false, message: '用户名或密码错误' };
}

function isAdminLoggedIn() {
  try {
    const token = wx.getStorageSync(ADMIN_KEY);
    return token === 'admin_token';
  } catch {
    return false;
  }
}

function logoutAdmin() {
  wx.removeStorageSync(ADMIN_KEY);
}

function getCurrentCard() {
  try {
    const data = wx.getStorageSync(CARD_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

function saveCurrentCard(card) {
  wx.setStorageSync(CARD_KEY, JSON.stringify(card));
}

function clearCurrentCard() {
  wx.removeStorageSync(CARD_KEY);
}

module.exports = {
  validateCard,
  createOrder,
  updateOrderStatus,
  getCards,
  getCardByNo,
  getOrders,
  getOrderById,
  importCards,
  validateAdmin,
  isAdminLoggedIn,
  logoutAdmin,
  getCurrentCard,
  saveCurrentCard,
  clearCurrentCard
};
