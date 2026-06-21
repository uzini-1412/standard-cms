const express = require('express');
const router = express.Router();
const db = require('../database');

// 계약 이력 조회
router.get('/', (req, res) => {
  const sql = `
    SELECT 
      ch.*,
      c.name as company_name,    
      c.customer_code          
    FROM contract_history ch
    LEFT JOIN companies c ON ch.company_id = c.id
    ORDER BY ch.contract_date DESC, ch.id DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("🔥 계약 이력 전체 조회 실패:", err);
      return res.status(500).json({ error: 'DB 조회 오류' });
    }
    res.json(results);
  });
});

module.exports = router;