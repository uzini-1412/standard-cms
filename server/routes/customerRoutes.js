const express = require('express');
const router = express.Router();
const db = require('../database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const controller = require('../controllers/customerController');

// 고객번호 중복 확인 
router.get('/check-duplicate', (req, res) => {
  const code = req.query.code; 

  if (!code) {
    return res.status(400).json({ message: '코드가 없습니다.' });
  }

  const sql = 'SELECT COUNT(*) as count FROM companies WHERE customer_code = ?';
  
  db.query(sql, [code], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'DB 조회 오류' });
    }
    
    // count> 0 : 이미 있음 (isDuplicate: true)
    const isDuplicate = results[0].count > 0;
    res.json({ isDuplicate });
  });
});

// 2. 업로드 폴더 설정
try {
  fs.readdirSync('uploads');
} catch (error) {
  console.error('uploads 폴더 생성');
  fs.mkdirSync('uploads');
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf8'); // 한글 깨짐 방지
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// 3. 라우팅 연결 (Controller 함수 연결)

// 목록 조회
router.get('/', controller.getAllCustomers);

// 상세 조회
router.get('/:id', controller.getCustomerById);

// 등록
router.post('/', upload.fields([{ name: 'biz_license_file' }, { name: 'intro_file' }]), controller.createCustomer);

// 수정
router.put('/:id', upload.fields([{ name: 'biz_license_file' }, { name: 'intro_file' }]), controller.updateCustomer);

// 삭제
router.delete('/:id', controller.deleteCustomer);

module.exports = router;