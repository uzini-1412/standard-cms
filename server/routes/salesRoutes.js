const express = require('express');
const router = express.Router();
const db = require('../database');

// 매출 데이터 추가 
router.post('/', (req, res) => {
  const { company_id, year, amount, personnel } = req.body;

  // 금액에서 쉼표 제거
  const cleanAmount = amount ? parseInt(amount.toString().replace(/,/g, '')) : 0;

  const sql = `
    INSERT INTO company_sales (company_id, year, amount, personnel)
    VALUES (?, ?, ?, ?)
  `;

  db.query(sql, [company_id, year, cleanAmount, personnel], (err, result) => {
    if (err) {
      console.error("매출 추가 에러:", err);
      return res.status(500).json({ message: '매출 추가 실패', error: err });
    }
    res.json({ message: '매출 추가 성공', id: result.insertId });
  });
});
// 3. 고객 정보 수정 (PUT /:id)
router.put('/:id', async (req, res) => {
  const id = req.params.id;
  const { 
    customer_code, name, manager_name, biz_num, ceo_name, 
    mobile_phone, email, tel, fax, region, zipcode, 
    address_main, address_sub, products, industry, biz_status, 
    homepage, brief_co,

    salesYears, customerContacts, consultationHistories, contractHistories
  } = req.body;

  try {
    // 정보 업데이트
    const updateCompany = () => {
      return new Promise((resolve, reject) => {
        const sql = `
          UPDATE companies SET 
            customer_code=?, name=?, manager_name=?, biz_num=?, ceo_name=?, 
            mobile_phone=?, email=?, tel=?, fax=?, region=?, zipcode=?, 
            address_main=?, address_sub=?, products=?, industry=?, biz_status=?, 
            homepage=?, brief_co=?
          WHERE id=?
        `;
        const values = [
          customer_code, name, manager_name, biz_num, ceo_name, mobile_phone, email, tel, fax, region, zipcode, 
          address_main, address_sub, products, industry, biz_status, homepage, brief_co, 
          id
        ];
        db.query(sql, values, (err) => {
          if (err) return reject(err);
          resolve();
        });
      });
    };
    await updateCompany();



    //매출 데이터 재등록
    await new Promise((resolve, reject) => {
      db.query('DELETE FROM company_sales WHERE company_id = ?', [id], (err) => { // 기존 거 삭제
        if (err) return reject(err);
        resolve();
      });
    });
    if (salesYears && salesYears.length > 0) {
      const values = salesYears.map(item => [id, item.year, item.amount, item.personnel]);
      if (values.length > 0) {
        await new Promise((resolve, reject) => {
          db.query('INSERT INTO company_sales (company_id, year, amount, personnel) VALUES ?', [values], (err) => {
            if (err) return reject(err);
            resolve();
          });
        });
      }
    }

    // 고객 담당자 재등록
    await new Promise((resolve, reject) => {
      db.query('DELETE FROM company_contacts WHERE company_id = ?', [id], (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
    if (customerContacts && customerContacts.length > 0) {
      const values = customerContacts.map(item => [
        id, item.name, item.department, item.position, item.phone, item.email, item.note, item.reg_date
      ]);
      if (values.length > 0) {
        await new Promise((resolve, reject) => {
          db.query('INSERT INTO company_contacts (company_id, name, department, position, phone, email, note, reg_date) VALUES ?', [values], (err) => {
            if (err) return reject(err);
            resolve();
          });
        });
      }
    }

    // 상담 이력 재등록
    await new Promise((resolve, reject) => {
      db.query('DELETE FROM consultation_history WHERE company_id = ?', [id], (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
    if (consultationHistories && consultationHistories.length > 0) {
      const values = consultationHistories.map(item => [
        id, item.title, item.writer, item.date, item.start_time, item.end_time, item.location,
        item.attendees_company, item.attendees_customer, item.content_general, item.content_meeting, item.content_future
      ]);
      if (values.length > 0) {
        await new Promise((resolve, reject) => {
          db.query('INSERT INTO consultation_history (company_id, title, writer, consult_date, start_time, end_time, location, attendees_company, attendees_customer, content_general, content_meeting, content_future) VALUES ?', [values], (err) => {
            if (err) return reject(err);
            resolve();
          });
        });
      }
    }

    // 계약 이력 재등록
    await new Promise((resolve, reject) => {
      db.query('DELETE FROM contract_history WHERE company_id = ?', [id], (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
    if (contractHistories && contractHistories.length > 0) {
      const values = contractHistories.map(item => [
        id, item.biz_type, item.contract_no, item.contract_date, item.project_name, 
        item.start_date, item.end_date, item.amount, item.md_name, item.pm_name, item.consultant_name, item.note
      ]);
      if (values.length > 0) {
        await new Promise((resolve, reject) => {
          db.query('INSERT INTO contract_history (company_id, biz_type, contract_no, contract_date, project_name, start_date, end_date, amount, md_name, pm_name, consultant_name, note) VALUES ?', [values], (err) => {
            if (err) return reject(err);
            resolve();
          });
        });
      }
    }

    res.json({ message: '수정 성공' });

  } catch (error) {
    console.error("수정 에러:", error);
    res.status(500).json({ message: '수정 중 오류 발생', error });
  }
});
// 매출 데이터 삭제 
router.delete('/:id', (req, res) => {
  const id = req.params.id;
  
  const sql = 'DELETE FROM company_sales WHERE id = ?';

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("매출 삭제 에러:", err);
      return res.status(500).json({ message: '매출 삭제 실패', error: err });
    }
    res.json({ message: '매출 삭제 성공' });
  });
});

module.exports = router;