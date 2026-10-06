-- =====================================================================
-- CMS 샘플 데이터 (데모/로컬 실행용) — 전부 가상의 데이터다.
--   mysql -u root -p < server/db/seed.sql
-- schema.sql 을 먼저 실행한 뒤 적용한다. 재실행 시 기존 데이터를 비우고 다시 넣는다.
-- 등록일/계약일은 CURDATE() 기준 상대값이라 대시보드 차트가 항상 최근 데이터로 보인다.
-- =====================================================================

-- 클라이언트 기본 문자셋이 latin1 인 환경(docker-entrypoint 등)에서도 한글이 깨지지 않도록.
SET NAMES utf8mb4;

USE cms_db;

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE contract_history;
TRUNCATE TABLE consultation_history;
TRUNCATE TABLE company_contacts;
TRUNCATE TABLE company_sales;
TRUNCATE TABLE companies;
SET FOREIGN_KEY_CHECKS = 1;

-- ---------------------------------------------------------------------
-- 고객사 (등록일을 최근 6개월에 분산)
-- ---------------------------------------------------------------------
INSERT INTO companies
  (customer_code, name, reg_date, manager_name, biz_num, ceo_name, mobile_phone, email, tel, fax, region, zipcode, address_main, address_sub, products, industry, biz_status, homepage, brief_co)
VALUES
  ('2026-0001', '(주)한빛테크',   DATE_SUB(CURDATE(), INTERVAL 5 MONTH), '김영업', '123-45-67890', '홍길동', '010-1000-0001', 'contact@hanbit.example.com', '02-100-0001', '02-100-9001', '서울', '04524', '서울특별시 중구 세종대로 1', '10층', '산업용 센서', '제조업', '계약완료', 'https://hanbit.example.com', '정밀 센서 전문 제조사'),
  ('2026-0002', '대성물산(주)',   DATE_SUB(CURDATE(), INTERVAL 4 MONTH), '이수진', '234-56-78901', '이대성', '010-1000-0002', 'sales@daesung.example.com', '031-200-0002', NULL, '경기', '13494', '경기도 성남시 분당구 판교로 200', '3동 5층', '물류 솔루션', '도소매업', '계약진행중', 'https://daesung.example.com', '종합 물류/유통 기업'),
  ('2026-0003', '미래정보시스템', DATE_SUB(CURDATE(), INTERVAL 3 MONTH), '박민호', '345-67-89012', '박미래', '010-1000-0003', 'info@miraeis.example.com', '051-300-0003', NULL, '부산', '48058', '부산광역시 해운대구 센텀로 50', NULL, 'SI/SW', '정보통신업', '상담중', 'https://miraeis.example.com', '기업용 소프트웨어 개발'),
  ('2026-0004', '(주)그린에너지', DATE_SUB(CURDATE(), INTERVAL 3 MONTH), '최지은', '456-78-90123', '정그린', '010-1000-0004', 'green@greenenergy.example.com', '042-400-0004', NULL, '대전', '34126', '대전광역시 유성구 대학로 99', '연구동', '태양광 모듈', '제조업', '계약완료', 'https://greenenergy.example.com', '신재생에너지 설비'),
  ('2026-0005', '동방건설(주)',   DATE_SUB(CURDATE(), INTERVAL 2 MONTH), '김영업', '567-89-01234', '오동방', '010-1000-0005', 'build@dongbang.example.com', '053-500-0005', NULL, '대구', '41585', '대구광역시 북구 칠성로 12', NULL, '건축 시공', '건설업', '보류', NULL, '중대형 건축 시공사'),
  ('2026-0006', '(주)코스모유통', DATE_SUB(CURDATE(), INTERVAL 1 MONTH), '이수진', '678-90-12345', '한코스', '010-1000-0006', 'cosmo@cosmo.example.com', '062-600-0006', NULL, '광주', '61936', '광주광역시 서구 상무대로 77', '2층', '소비재 유통', '도소매업', '계약진행중', 'https://cosmo.example.com', '생활소비재 도소매'),
  ('2026-0007', '한울제약(주)',   DATE_SUB(CURDATE(), INTERVAL 1 MONTH), '박민호', '789-01-23456', '서한울', '010-1000-0007', 'pharm@hanwool.example.com', '032-700-0007', NULL, '인천', '21999', '인천광역시 연수구 송도과학로 10', '바이오동', '의약품', '제조업', '상담중', 'https://hanwool.example.com', '제약/바이오 연구개발'),
  ('2026-0008', '세종ENG',        DATE_SUB(CURDATE(), INTERVAL 0 MONTH), '최지은', '890-12-34567', '윤세종', '010-1000-0008', 'eng@sejong.example.com', '044-800-0008', NULL, '세종', '30121', '세종특별자치시 한누리대로 2130', NULL, '플랜트 설계', '서비스업', '상담중', NULL, '플랜트 엔지니어링');

-- ---------------------------------------------------------------------
-- 연도별 매출/인원
-- ---------------------------------------------------------------------
INSERT INTO company_sales (company_id, year, amount, personnel)
SELECT id, '2023', 1800000000, 45 FROM companies WHERE customer_code='2026-0001'
UNION ALL SELECT id, '2024', 2400000000, 52 FROM companies WHERE customer_code='2026-0001'
UNION ALL SELECT id, '2024',  900000000, 30 FROM companies WHERE customer_code='2026-0002'
UNION ALL SELECT id, '2024', 5200000000, 120 FROM companies WHERE customer_code='2026-0003'
UNION ALL SELECT id, '2024', 3100000000, 64 FROM companies WHERE customer_code='2026-0004'
UNION ALL SELECT id, '2024', 7800000000, 210 FROM companies WHERE customer_code='2026-0005'
UNION ALL SELECT id, '2024', 1500000000, 38 FROM companies WHERE customer_code='2026-0006'
UNION ALL SELECT id, '2024', 6400000000, 95 FROM companies WHERE customer_code='2026-0007'
UNION ALL SELECT id, '2024',  720000000, 18 FROM companies WHERE customer_code='2026-0008';

-- ---------------------------------------------------------------------
-- 고객사 담당자(연락처)
-- ---------------------------------------------------------------------
INSERT INTO company_contacts (company_id, name, department, position, mobile_phone, email, note, reg_date)
SELECT id, '김담당', '구매팀', '팀장', '010-2000-0001', 'buyer@hanbit.example.com', '', NOW() FROM companies WHERE customer_code='2026-0001'
UNION ALL SELECT id, '이주임', '경영지원', '주임', '010-2000-0002', 'admin@daesung.example.com', '', NOW() FROM companies WHERE customer_code='2026-0002'
UNION ALL SELECT id, '박과장', '기술연구소', '과장', '010-2000-0003', 'rnd@miraeis.example.com', '신규 도입 검토', NOW() FROM companies WHERE customer_code='2026-0003'
UNION ALL SELECT id, '정대리', '생산관리', '대리', '010-2000-0004', 'prod@greenenergy.example.com', '', NOW() FROM companies WHERE customer_code='2026-0004'
UNION ALL SELECT id, '오부장', '공무팀', '부장', '010-2000-0005', 'pm@dongbang.example.com', '', NOW() FROM companies WHERE customer_code='2026-0005'
UNION ALL SELECT id, '한사원', '영업기획', '사원', '010-2000-0006', 'plan@cosmo.example.com', '', NOW() FROM companies WHERE customer_code='2026-0006'
UNION ALL SELECT id, '서팀장', '품질관리', '팀장', '010-2000-0007', 'qa@hanwool.example.com', '', NOW() FROM companies WHERE customer_code='2026-0007'
UNION ALL SELECT id, '윤차장', '설계1팀', '차장', '010-2000-0008', 'design@sejong.example.com', '', NOW() FROM companies WHERE customer_code='2026-0008';

-- ---------------------------------------------------------------------
-- 상담 이력
-- ---------------------------------------------------------------------
INSERT INTO consultation_history
  (company_id, title, writer, consult_date, start_time, end_time, location, attendees_company, attendees_customer, content_general, content_meeting, content_future)
SELECT id, '도입 사전 미팅', '김영업', DATE_SUB(CURDATE(), INTERVAL 40 DAY), '10:00:00', '11:00:00', '본사 회의실', '김영업', '김담당', '시스템 도입 배경 공유', '요구사항 1차 협의', '제안서 송부 예정'
  FROM companies WHERE customer_code='2026-0001'
UNION ALL SELECT id, '요구사항 정의', '박민호', DATE_SUB(CURDATE(), INTERVAL 25 DAY), '14:00:00', '15:30:00', '고객사', '박민호, 최지은', '박과장', '현행 시스템 분석', '기능 범위 확정', 'PoC 일정 조율'
  FROM companies WHERE customer_code='2026-0003'
UNION ALL SELECT id, '계약 협의', '이수진', DATE_SUB(CURDATE(), INTERVAL 12 DAY), '11:00:00', '12:00:00', '화상회의', '이수진', '이주임', '견적 검토', '계약 조건 협의', '계약서 초안 발송'
  FROM companies WHERE customer_code='2026-0002'
UNION ALL SELECT id, '정기 점검', '최지은', DATE_SUB(CURDATE(), INTERVAL 5 DAY), '09:30:00', '10:15:00', '고객사', '최지은', '정대리', '운영 현황 점검', '추가 모듈 문의', '추가 견적 준비'
  FROM companies WHERE customer_code='2026-0004';

-- ---------------------------------------------------------------------
-- 계약 이력
-- ---------------------------------------------------------------------
INSERT INTO contract_history
  (company_id, biz_type, contract_no, contract_date, project_name, start_date, end_date, amount, md, pm, consultant_name, note)
SELECT id, '컨설팅', 'C-2026-001', DATE_SUB(CURDATE(), INTERVAL 60 DAY), '스마트팩토리 진단', DATE_SUB(CURDATE(), INTERVAL 60 DAY), DATE_ADD(CURDATE(), INTERVAL 120 DAY), 180000000, '120', '김영업', '박민호', ''
  FROM companies WHERE customer_code='2026-0001'
UNION ALL SELECT id, '스마트공장', 'C-2026-002', DATE_SUB(CURDATE(), INTERVAL 30 DAY), 'MES 구축', DATE_SUB(CURDATE(), INTERVAL 30 DAY), DATE_ADD(CURDATE(), INTERVAL 210 DAY), 540000000, '300', '최지은', '박민호', '1차 계약'
  FROM companies WHERE customer_code='2026-0003'
UNION ALL SELECT id, '컨설팅', 'C-2026-003', DATE_SUB(CURDATE(), INTERVAL 15 DAY), '에너지 효율 진단', DATE_SUB(CURDATE(), INTERVAL 15 DAY), DATE_ADD(CURDATE(), INTERVAL 90 DAY), 95000000, '60', '이수진', '최지은', ''
  FROM companies WHERE customer_code='2026-0004'
UNION ALL SELECT id, '스마트공장', 'C-2026-004', DATE_SUB(CURDATE(), INTERVAL 7 DAY), '품질관리 시스템', DATE_SUB(CURDATE(), INTERVAL 7 DAY), DATE_ADD(CURDATE(), INTERVAL 180 DAY), 320000000, '180', '박민호', '김영업', '착수 예정'
  FROM companies WHERE customer_code='2026-0007';
