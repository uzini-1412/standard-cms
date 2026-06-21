const express = require('express');
const router = express.Router();
const db = require('../database');

// 상담 이력 조회
router.get('/', (req, res) => {
  const sql = `
    SELECT 
      ch.*,
      c.name as company_name,   
      c.region,                
      c.customer_code           
    FROM consultation_history ch
    JOIN companies c ON ch.company_id = c.id
    ORDER BY ch.consult_date DESC, ch.start_time DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("🔥 상담 이력 전체 조회 실패:", err);
      return res.status(500).json({ error: 'DB 조회 오류' });
    }
    res.json(results);
  });
});

module.exports = router;