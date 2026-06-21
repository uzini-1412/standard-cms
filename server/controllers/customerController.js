const db = require('../database');

// 담당자에 날짜 뒤 시간
const addCurrentTime = (dateStr) => {
  if (!dateStr) return new Date(); 
  const now = new Date();
  const timePart = now.toTimeString().split(' ')[0]; 
  return `${dateStr} ${timePart}`; 
};

// 1. 고객 목록 조회
exports.getAllCustomers = (req, res) => {
  const sql = `
    SELECT c.*,
      (SELECT amount FROM company_sales s WHERE s.company_id = c.id ORDER BY s.year DESC, s.id DESC LIMIT 1) as recent_amount,
      (SELECT personnel FROM company_sales s WHERE s.company_id = c.id ORDER BY s.year DESC, s.id DESC LIMIT 1) as recent_personnel,
      (SELECT name FROM company_contacts cc WHERE cc.company_id = c.id ORDER BY cc.reg_date DESC, cc.id DESC LIMIT 1) as contact_name,
      (SELECT mobile_phone FROM company_contacts cc WHERE cc.company_id = c.id ORDER BY cc.reg_date DESC, cc.id DESC LIMIT 1) as contact_phone,
      (SELECT email FROM company_contacts cc WHERE cc.company_id = c.id ORDER BY cc.reg_date DESC, cc.id DESC LIMIT 1) as contact_email
    FROM companies c
    ORDER BY c.id DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'DB 조회 오류' });
    }
    res.json(results);
  });
};

// 2. 고객 상세 조회
exports.getCustomerById = async (req, res) => {
  const companyId = req.params.id;
  try {
    const promisePool = db.promise();
    const [
      [company], [sales], [contacts], [consultations], [contracts]
    ] = await Promise.all([
      promisePool.query('SELECT * FROM companies WHERE id = ?', [companyId]),
      promisePool.query('SELECT * FROM company_sales WHERE company_id = ? ORDER BY year DESC', [companyId]),
      promisePool.query('SELECT * FROM company_contacts WHERE company_id = ? ORDER BY reg_date DESC', [companyId]),
      promisePool.query('SELECT * FROM consultation_history WHERE company_id = ? ORDER BY consult_date DESC', [companyId]),
      promisePool.query('SELECT * FROM contract_history WHERE company_id = ? ORDER BY contract_no ASC', [companyId])
    ]);

    if (company.length === 0) return res.status(404).json({ message: '존재하지 않는 고객입니다.' });

    res.json({
      ...company[0],
      salesYears: sales,
      customerContacts: contacts,
      consultationHistories: consultations,
      contractHistories: contracts
    });
  } catch (err) {
    console.error("💥 상세 조회 실패:", err);
    res.status(500).json({ message: '서버 에러', error: err });
  }
};

// 3. 고객 등록 (POST)
exports.createCustomer = async (req, res) => {
  try {

    const salesYears = req.body.salesYears ? JSON.parse(req.body.salesYears) : [];
    const customerContacts = req.body.customerContacts ? JSON.parse(req.body.customerContacts) : [];
    const consultationHistories = req.body.consultationHistories ? JSON.parse(req.body.consultationHistories) : [];
    const contractHistories = req.body.contractHistories ? JSON.parse(req.body.contractHistories) : [];

    const files = req.files || {};

    // 파일 경로 추출
    const bizFilePath = files['biz_license_file'] ? files['biz_license_file'][0].path.replace(/\\/g, '/') : null;
    const introFilePath = files['intro_file'] ? files['intro_file'][0].path.replace(/\\/g, '/') : null;

    const insertCompany = () => {
      return new Promise((resolve, reject) => {
        const sql = `
          INSERT INTO companies 
          (customer_code, name, reg_date, manager_name, biz_num, ceo_name, mobile_phone, email, tel, fax, region, zipcode, address_main, address_sub, products, industry, biz_status, homepage, brief_co, biz_num_file, brief_co_file)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [
          req.body.customer_code, req.body.name, req.body.reg_date, req.body.manager_name, req.body.biz_num, req.body.ceo_name, 
          req.body.mobile_phone, req.body.email, req.body.tel, req.body.fax, req.body.region, req.body.zipcode, 
          req.body.address_main, req.body.address_sub, req.body.products, req.body.industry, req.body.biz_status, 
          req.body.homepage, req.body.brief_co, bizFilePath, introFilePath
        ];
        db.query(sql, values, (err, result) => {
          if (err) return reject(err);
          resolve(result.insertId);
        });
      });
    };

    const newCompanyId = await insertCompany();

    // 매출
    if (salesYears.length > 0) {
      const values = salesYears.map(item => [newCompanyId, item.year, item.amount, item.personnel]);
      await new Promise((resolve, reject) => db.query('INSERT INTO company_sales (company_id, year, amount, personnel) VALUES ?', [values], (err) => err ? reject(err) : resolve()));
    }
    // 담당자
    if (customerContacts.length > 0) {
      const values = customerContacts.map(item => [
        newCompanyId, 
        item.name, 
        item.department, 
        item.position, 
        item.phone, 
        item.email, 
        item.note, 
        addCurrentTime(item.reg_date)
    ]);
      await new Promise((resolve, reject) => db.query('INSERT INTO company_contacts (company_id, name, department, position, mobile_phone, email, note, reg_date) VALUES ?', [values], (err) => err ? reject(err) : resolve()));
    }
    // 상담
    if (consultationHistories.length > 0) {
      const values = consultationHistories.map(item => [newCompanyId, item.title, item.writer, item.date, item.start_time, item.end_time, item.location, item.attendees_company, item.attendees_customer, item.content_general, item.content_meeting, item.content_future]);
      await new Promise((resolve, reject) => db.query('INSERT INTO consultation_history (company_id, title, writer, consult_date, start_time, end_time, location, attendees_company, attendees_customer, content_general, content_meeting, content_future) VALUES ?', [values], (err) => err ? reject(err) : resolve()));
    }
    // 계약
    if (contractHistories.length > 0) {
      const values = contractHistories.map(c => [
        newCompanyId, c.biz_type, c.contract_no, c.contract_date || null, c.project_name, 
        c.start_date || null, c.end_date || null, (c.amount ? c.amount.replace(/,/g, '') : null), c.md, c.pm, c.consultant_name, c.note
      ]);
      await new Promise((resolve, reject) => db.query('INSERT INTO contract_history (company_id, biz_type, contract_no, contract_date, project_name, start_date, end_date, amount, md, pm, consultant_name, note) VALUES ?', [values], (err) => err ? reject(err) : resolve()));
    }

    res.status(201).json({ message: '등록 성공', id: newCompanyId });
  } catch (error) {
    console.error("등록 에러:", error);
    if (error.code === 'ER_DUP_ENTRY') return res.status(400).json({ message: '이미 등록된 고객번호입니다.' });
    res.status(500).json({ message: '서버 에러', error });
  }
};

// 4. 고객 수정 (PUT)
exports.updateCustomer = async (req, res) => {
  const id = req.params.id;
  try {
    const salesYears = req.body.salesYears ? JSON.parse(req.body.salesYears) : [];
    const customerContacts = req.body.customerContacts ? JSON.parse(req.body.customerContacts) : [];
    const consultationHistories = req.body.consultationHistories ? JSON.parse(req.body.consultationHistories) : [];
    const contractHistories = req.body.contractHistories ? JSON.parse(req.body.contractHistories) : [];

    const newBizFilePath = req.files['biz_license_file'] ? req.files['biz_license_file'][0].path.replace(/\\/g, '/') : null;
    const newIntroFilePath = req.files['intro_file'] ? req.files['intro_file'][0].path.replace(/\\/g, '/') : null;

    const updateCompany = () => {
      return new Promise((resolve, reject) => {
        const sql = `
          UPDATE companies SET 
            customer_code=?, name=?, manager_name=?, biz_num=?, ceo_name=?, 
            mobile_phone=?, email=?, tel=?, fax=?, region=?, zipcode=?, 
            address_main=?, address_sub=?, products=?, industry=?, biz_status=?, 
            homepage=?, brief_co=?,
            biz_num_file = COALESCE(?, biz_num_file),
            brief_co_file = COALESCE(?, brief_co_file)
          WHERE id=?
        `;
        const values = [
          req.body.customer_code, req.body.name, req.body.manager_name, req.body.biz_num, req.body.ceo_name, 
          req.body.mobile_phone, req.body.email, req.body.tel, req.body.fax, req.body.region, req.body.zipcode, 
          req.body.address_main, req.body.address_sub, req.body.products, req.body.industry, req.body.biz_status, 
          req.body.homepage, req.body.brief_co, newBizFilePath, newIntroFilePath, id
        ];
        db.query(sql, values, (err) => err ? reject(err) : resolve());
      });
    };
    await updateCompany();

    // 매출
    await new Promise((resolve, reject) => db.query('DELETE FROM company_sales WHERE company_id = ?', [id], (err) => err ? reject(err) : resolve()));
    if (salesYears.length > 0) {
      const values = salesYears.map(item => [id, item.year, item.amount, item.personnel]);
      await new Promise((resolve, reject) => db.query('INSERT INTO company_sales (company_id, year, amount, personnel) VALUES ?', [values], (err) => err ? reject(err) : resolve()));
    }
    // 담당자
    await new Promise((resolve, reject) => db.query('DELETE FROM company_contacts WHERE company_id = ?', [id], (err) => err ? reject(err) : resolve()));
    if (customerContacts.length > 0) {
      const values = customerContacts.map(item => [
        id, 
        item.name, 
        item.department, 
        item.position, 
        item.phone, 
        item.email, 
        item.note, 
        addCurrentTime(item.reg_date)
    ]);
      await new Promise((resolve, reject) => db.query('INSERT INTO company_contacts (company_id, name, department, position, mobile_phone, email, note, reg_date) VALUES ?', [values], (err) => err ? reject(err) : resolve()));
    }
    // 상담
    await new Promise((resolve, reject) => db.query('DELETE FROM consultation_history WHERE company_id = ?', [id], (err) => err ? reject(err) : resolve()));
    if (consultationHistories.length > 0) {
      const values = consultationHistories.map(item => [id, item.title, item.writer, item.date, item.start_time, item.end_time, item.location, item.attendees_company, item.attendees_customer, item.content_general, item.content_meeting, item.content_future]);
      await new Promise((resolve, reject) => db.query('INSERT INTO consultation_history (company_id, title, writer, consult_date, start_time, end_time, location, attendees_company, attendees_customer, content_general, content_meeting, content_future) VALUES ?', [values], (err) => err ? reject(err) : resolve()));
    }
    // 계약
    await new Promise((resolve, reject) => db.query('DELETE FROM contract_history WHERE company_id = ?', [id], (err) => err ? reject(err) : resolve()));
    if (contractHistories.length > 0) {
      const values = contractHistories.map(c => [id, c.biz_type, c.contract_no, c.contract_date || null, c.project_name, c.start_date || null, c.end_date || null, (c.amount ? c.amount.replace(/,/g, '') : null), c.md, c.pm, c.consultant_name, c.note]);
      await new Promise((resolve, reject) => db.query('INSERT INTO contract_history (company_id, biz_type, contract_no, contract_date, project_name, start_date, end_date, amount, md, pm, consultant_name, note) VALUES ?', [values], (err) => err ? reject(err) : resolve()));
    }

    res.json({ message: '수정 성공' });
  } catch (error) {
    console.error("수정 에러:", error);
    res.status(500).json({ message: '수정 중 오류', error });
  }
};

// 5. 고객 삭제
exports.deleteCustomer = (req, res) => {
  const id = req.params.id;
  db.query('DELETE FROM companies WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ message: '삭제 에러', error: err });
    if (result.affectedRows === 0) return res.status(404).json({ message: '삭제할 고객 없음' });
    res.json({ message: '삭제 성공' });
  });
};