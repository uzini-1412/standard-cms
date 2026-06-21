const db = require('../database');

// 모든 담당자 목록 조회 (회사 정보 JOIN)
exports.getAllManagers = (req, res) => {
  const sql = `
    SELECT 
      cc.id,
      cc.reg_date,
      cc.name,          
      cc.department,
      cc.position,
      cc.mobile_phone,
      cc.email,
      cc.note,
      
      -- 회사 정보 (JOIN)
      c.id as company_id,
      c.name as company_name,   
      c.region,
      c.industry
    FROM company_contacts cc
    JOIN companies c ON cc.company_id = c.id
    ORDER BY cc.reg_date ASC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("🔥 담당자 목록 조회 실패:", err);
      return res.status(500).json({ error: 'DB 조회 오류' });
    }
    res.json(results);
  });
};