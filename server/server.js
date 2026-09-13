const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3000;
const JWT_SECRET = 'crab_card_jwt_secret_key';
const ADMIN_USER = { username: 'xmc', password: 'admin123' };

app.use(cors());
app.use(bodyParser.json());

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ success: false, message: '未授权' });
  }
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(401).json({ success: false, message: 'token无效' });
    }
    req.user = user;
    next();
  });
}

const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'crab_card.db');
const CARDS_JSON_FILE = path.join(DATA_DIR, 'cards.json');
const ORDERS_JSON_FILE = path.join(DATA_DIR, 'orders.json');

let db;

function initDatabase() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  db = new Database(DB_FILE, { verbose: console.log });

  db.exec(`
    CREATE TABLE IF NOT EXISTS cards (
      cardNo TEXT PRIMARY KEY,
      password TEXT NOT NULL,
      status TEXT DEFAULT 'unused',
      orderId TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      orderId TEXT PRIMARY KEY,
      cardNo TEXT NOT NULL,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      address TEXT NOT NULL,
      remark TEXT DEFAULT '',
      createTime TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      shipTime TEXT,
      completeTime TEXT,
      FOREIGN KEY (cardNo) REFERENCES cards(cardNo)
    )
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_cards_status ON cards(status)
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_orders_cardNo ON orders(cardNo)
  `);

  migrateFromJson();
}

function migrateFromJson() {
  try {
    const cardsMigrated = db.prepare('SELECT COUNT(*) as count FROM cards').get();
    if (cardsMigrated.count > 0) {
      console.log('Database already initialized with data');
      return;
    }

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

    const insertCard = db.prepare('INSERT OR IGNORE INTO cards (cardNo, password, status, orderId) VALUES (?, ?, ?, ?)');
    const insertOrder = db.prepare('INSERT OR IGNORE INTO orders (orderId, cardNo, name, phone, address, remark, createTime, status, shipTime, completeTime) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');

    if (fs.existsSync(CARDS_JSON_FILE)) {
      try {
        const cardsData = JSON.parse(fs.readFileSync(CARDS_JSON_FILE, 'utf8'));
        cardsData.forEach(card => {
          insertCard.run(card.cardNo, card.password, card.status || 'unused', card.orderId || null);
        });
        console.log(`Migrated ${cardsData.length} cards from JSON`);
      } catch (e) {
        console.error('Error reading cards.json, using default data:', e);
        defaultCards.forEach(card => {
          insertCard.run(card.cardNo, card.password, card.status, card.orderId);
        });
      }
    } else {
      defaultCards.forEach(card => {
        insertCard.run(card.cardNo, card.password, card.status, card.orderId);
      });
      console.log('Initialized cards with default data');
    }

    if (fs.existsSync(ORDERS_JSON_FILE)) {
      try {
        const ordersData = JSON.parse(fs.readFileSync(ORDERS_JSON_FILE, 'utf8'));
        ordersData.forEach(order => {
          insertOrder.run(
            order.orderId,
            order.cardNo,
            order.name,
            order.phone,
            order.address,
            order.remark || '',
            order.createTime,
            order.status || 'pending',
            order.shipTime || null,
            order.completeTime || null
          );
        });
        console.log(`Migrated ${ordersData.length} orders from JSON`);
      } catch (e) {
        console.error('Error reading orders.json:', e);
      }
    }

    if (fs.existsSync(CARDS_JSON_FILE)) {
      fs.renameSync(CARDS_JSON_FILE, CARDS_JSON_FILE + '.bak');
    }
    if (fs.existsSync(ORDERS_JSON_FILE)) {
      fs.renameSync(ORDERS_JSON_FILE, ORDERS_JSON_FILE + '.bak');
    }

    console.log('Database migration completed');
  } catch (e) {
    console.error('Database migration failed:', e);
  }
}

app.post('/api/admin/login', (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (username === ADMIN_USER.username && password === ADMIN_USER.password) {
      const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '24h' });
      res.json({ success: true, token, message: '登录成功' });
    } else {
      res.json({ success: false, message: '用户名或密码错误' });
    }
  } catch (e) {
    console.error('Login error:', e);
    res.status(500).json({ success: false, message: '登录失败' });
  }
});

app.put('/api/admin/password', authenticateToken, (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    
    if (!oldPassword || !newPassword) {
      return res.json({ success: false, message: '请填写旧密码和新密码' });
    }
    
    if (newPassword.length < 6) {
      return res.json({ success: false, message: '新密码长度至少6位' });
    }
    
    if (oldPassword === ADMIN_USER.password) {
      ADMIN_USER.password = newPassword;
      res.json({ success: true, message: '密码修改成功，请重新登录' });
    } else {
      res.json({ success: false, message: '旧密码错误' });
    }
  } catch (e) {
    console.error('Change password error:', e);
    res.status(500).json({ success: false, message: '修改密码失败' });
  }
});

app.get('/api/cards', authenticateToken, (req, res) => {
  try {
    const { search, status } = req.query;
    let query = 'SELECT * FROM cards';
    let params = [];
    let conditions = [];

    if (search) {
      conditions.push('cardNo LIKE ?');
      params.push(`%${search}%`);
    }

    if (status && status !== 'all') {
      conditions.push('status = ?');
      params.push(status);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY cardNo DESC';

    const cards = db.prepare(query).all(...params);
    res.json({ success: true, data: cards });
  } catch (e) {
    console.error('Error getting cards:', e);
    res.status(500).json({ success: false, message: '获取卡片失败' });
  }
});

app.post('/api/cards/validate', (req, res) => {
  try {
    const { cardNo, password } = req.body;
    const card = db.prepare('SELECT * FROM cards WHERE cardNo = ? AND password = ?').get(cardNo, password);

    if (!card) {
      return res.json({ success: false, message: '卡号或密码错误' });
    }

    res.json({
      success: true,
      message: card.status === 'used' ? '已提货' : '验证成功',
      card,
      isUsed: card.status === 'used'
    });
  } catch (e) {
    console.error('Error validating card:', e);
    res.status(500).json({ success: false, message: '验证失败' });
  }
});

app.post('/api/orders', (req, res) => {
  try {
    const { cardNo, name, phone, address, remark } = req.body;

    const card = db.prepare('SELECT * FROM cards WHERE cardNo = ?').get(cardNo);
    if (!card || card.status === 'used') {
      return res.json({ success: false, message: '蟹卡无效' });
    }

    const orderId = 'ORD' + Date.now();
    const createTime = new Date().toLocaleString('zh-CN');

    const insertOrder = db.prepare(`
      INSERT INTO orders (orderId, cardNo, name, phone, address, remark, createTime, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const updateCard = db.prepare(`
      UPDATE cards SET status = 'used', orderId = ? WHERE cardNo = ?
    `);

    const transaction = db.transaction(() => {
      insertOrder.run(orderId, cardNo, name, phone, address, remark || '', createTime, 'pending');
      updateCard.run(orderId, cardNo);
    });

    transaction();

    console.log('Order created:', orderId);
    res.json({ 
      success: true, 
      message: '提货申请提交成功', 
      order: {
        orderId,
        cardNo,
        name,
        phone,
        address,
        remark: remark || '',
        createTime,
        status: 'pending'
      }
    });
  } catch (e) {
    console.error('Error creating order:', e);
    res.status(500).json({ success: false, message: '创建订单失败' });
  }
});

app.get('/api/orders', authenticateToken, (req, res) => {
  try {
    const { status } = req.query;
    let query = 'SELECT * FROM orders';
    let params = [];

    if (status && status !== 'all') {
      query += ' WHERE status = ?';
      params.push(status);
    }

    query += ' ORDER BY createTime DESC';

    const orders = db.prepare(query).all(...params);
    res.json({ success: true, data: orders });
  } catch (e) {
    console.error('Error getting orders:', e);
    res.status(500).json({ success: false, message: '获取订单失败' });
  }
});

app.put('/api/orders/:orderId/status', authenticateToken, (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const order = db.prepare('SELECT * FROM orders WHERE orderId = ?').get(orderId);
    if (!order) {
      return res.json({ success: false, message: '订单不存在' });
    }

    const allowedStatus = ['pending', 'shipped', 'completed'];
    if (!allowedStatus.includes(status)) {
      return res.json({ success: false, message: '无效的订单状态' });
    }

    let updateFields = ['status = ?'];
    let updateParams = [status];

    if (status === 'shipped') {
      updateFields.push('shipTime = ?');
      updateParams.push(new Date().toLocaleString('zh-CN'));
    } else if (status === 'completed') {
      updateFields.push('completeTime = ?');
      updateParams.push(new Date().toLocaleString('zh-CN'));
    }

    updateParams.push(orderId);

    const query = `UPDATE orders SET ${updateFields.join(', ')} WHERE orderId = ?`;
    db.prepare(query).run(...updateParams);

    res.json({ success: true, message: '订单状态已更新' });
  } catch (e) {
    console.error('Error updating order status:', e);
    res.status(500).json({ success: false, message: '更新订单状态失败' });
  }
});

app.delete('/api/cards/:cardNo', authenticateToken, (req, res) => {
  try {
    const { cardNo } = req.params;

    const card = db.prepare('SELECT * FROM cards WHERE cardNo = ?').get(cardNo);
    if (!card) {
      return res.json({ success: false, message: '蟹卡不存在' });
    }

    const transaction = db.transaction(() => {
      db.prepare('DELETE FROM orders WHERE cardNo = ?').run(cardNo);
      db.prepare('DELETE FROM cards WHERE cardNo = ?').run(cardNo);
    });

    transaction();

    res.json({ success: true, message: '删除成功', deleted: 1 });
  } catch (e) {
    console.error('Error deleting card:', e);
    res.status(500).json({ success: false, message: '删除失败' });
  }
});

app.post('/api/cards/import', authenticateToken, (req, res) => {
  try {
    const { newCards } = req.body;

    const insertCard = db.prepare('INSERT OR IGNORE INTO cards (cardNo, password, status, orderId) VALUES (?, ?, ?, ?)');

    let imported = 0;
    let skipped = 0;

    newCards.forEach(card => {
      const result = insertCard.run(card.cardNo, card.password, 'unused', null);
      if (result.changes > 0) {
        imported++;
      } else {
        skipped++;
      }
    });

    res.json({ success: true, imported, skipped, total: newCards.length });
  } catch (e) {
    console.error('Error importing cards:', e);
    res.status(500).json({ success: false, message: '导入卡片失败' });
  }
});

app.get('/api/orders/export', authenticateToken, (req, res) => {
  try {
    const orders = db.prepare('SELECT * FROM orders ORDER BY createTime DESC').all();
    let csv = '订单号,卡号,收货人,电话,地址,备注,创建时间,状态,发货时间,完成时间\n';

    orders.forEach(order => {
      const statusText = order.status === 'pending' ? '待处理' : order.status === 'shipped' ? '已发货' : '已完成';
      csv += `"${order.orderId}","${order.cardNo}","${order.name}","${order.phone}","${order.address}","${order.remark}","${order.createTime}","${statusText}","${order.shipTime || ''}","${order.completeTime || ''}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="orders_${Date.now()}.csv"`);
    res.send('\uFEFF' + csv);
  } catch (e) {
    console.error('Error exporting orders:', e);
    res.status(500).json({ success: false, message: '导出订单失败' });
  }
});

initDatabase();

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Database file: ${DB_FILE}`);
});