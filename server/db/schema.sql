-- =====================================================================
-- CMS (Customer Management System) — 데이터베이스 스키마
-- MySQL 8 / utf8mb4
--
-- 사용:
--   mysql -u root -p < server/db/schema.sql
--   mysql -u root -p < server/db/seed.sql      (샘플 데이터, 선택)
--
-- 스키마는 백엔드(server/controllers, server/routes)의 쿼리에서 도출했다.
-- companies 삭제 시 자식 행이 함께 지워지도록 FK 에 ON DELETE CASCADE 를 건다.
-- =====================================================================

-- 클라이언트 기본 문자셋이 latin1 인 환경(docker-entrypoint 등)에서도 한글이 깨지지 않도록.
SET NAMES utf8mb4;

CREATE DATABASE IF NOT EXISTS cms_db
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE cms_db;

-- 재실행 가능하도록 자식 → 부모 순으로 제거
DROP TABLE IF EXISTS contract_history;
DROP TABLE IF EXISTS consultation_history;
DROP TABLE IF EXISTS company_contacts;
DROP TABLE IF EXISTS company_sales;
DROP TABLE IF EXISTS companies;

-- ---------------------------------------------------------------------
-- 고객사
-- ---------------------------------------------------------------------
CREATE TABLE companies (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  customer_code VARCHAR(50) UNIQUE,           -- 고객번호 (중복 확인 대상)
  name          VARCHAR(255) NOT NULL,        -- 기업명
  reg_date      DATE,                         -- 등록일
  manager_name  VARCHAR(100),                 -- 영업담당자
  biz_num       VARCHAR(50),                  -- 사업자등록번호
  ceo_name      VARCHAR(100),                 -- 대표자
  mobile_phone  VARCHAR(50),                  -- 휴대전화
  email         VARCHAR(255),                 -- 이메일
  tel           VARCHAR(50),                  -- 전화번호
  fax           VARCHAR(50),                  -- 팩스번호
  region        VARCHAR(50),                  -- 지역구분
  zipcode       VARCHAR(20),                  -- 우편번호
  address_main  VARCHAR(255),                 -- 주소
  address_sub   VARCHAR(255),                 -- 상세주소
  products      TEXT,                         -- 생산제품
  industry      VARCHAR(100),                 -- 업종
  biz_status    VARCHAR(100),                 -- 업태/상태
  homepage      VARCHAR(255),                 -- 홈페이지
  brief_co      TEXT,                         -- 회사 간략소개
  biz_num_file  VARCHAR(500),                 -- 사업자등록증 파일 경로
  brief_co_file VARCHAR(500),                 -- 회사소개서 파일 경로
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_companies_name (name),
  INDEX idx_companies_region (region)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 연도별 매출/인원
-- ---------------------------------------------------------------------
CREATE TABLE company_sales (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  year       VARCHAR(10),                     -- 연도
  amount     BIGINT,                          -- 매출액(원)
  personnel  INT,                             -- 인원
  CONSTRAINT fk_sales_company FOREIGN KEY (company_id)
    REFERENCES companies(id) ON DELETE CASCADE,
  INDEX idx_sales_company (company_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 고객사 담당자(연락처)
-- ---------------------------------------------------------------------
CREATE TABLE company_contacts (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  company_id   INT NOT NULL,
  name         VARCHAR(100),                  -- 담당자명
  department   VARCHAR(100),                  -- 부서
  position     VARCHAR(100),                  -- 직책
  mobile_phone VARCHAR(50),                   -- 휴대전화
  email        VARCHAR(255),                  -- 이메일
  note         TEXT,                          -- 비고
  reg_date     DATETIME,                      -- 등록일자
  CONSTRAINT fk_contacts_company FOREIGN KEY (company_id)
    REFERENCES companies(id) ON DELETE CASCADE,
  INDEX idx_contacts_company (company_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 상담 이력
-- ---------------------------------------------------------------------
CREATE TABLE consultation_history (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  company_id        INT NOT NULL,
  title             VARCHAR(255),             -- 제목
  writer            VARCHAR(100),             -- 작성자
  consult_date      DATE,                     -- 상담일자
  start_time        TIME,                     -- 시작시간
  end_time          TIME,                     -- 종료시간
  location          VARCHAR(255),             -- 장소
  attendees_company VARCHAR(255),             -- 자사참석자
  attendees_customer VARCHAR(255),            -- 고객참석자
  content_general   TEXT,                     -- 주요 상담내용
  content_meeting   TEXT,                     -- 상담내용
  content_future    TEXT,                     -- 조치/진행사항
  reg_date          TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- 작성일
  CONSTRAINT fk_consult_company FOREIGN KEY (company_id)
    REFERENCES companies(id) ON DELETE CASCADE,
  INDEX idx_consult_company (company_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 계약 이력
-- ---------------------------------------------------------------------
CREATE TABLE contract_history (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  company_id      INT NOT NULL,
  biz_type        VARCHAR(100),               -- 사업구분
  contract_no     VARCHAR(100),               -- 계약번호
  contract_date   DATE,                       -- 계약일
  project_name    VARCHAR(255),               -- 프로젝트명
  start_date      DATE,                       -- 시작일
  end_date        DATE,                       -- 종료일
  amount          BIGINT,                     -- 계약금액(원)
  md              VARCHAR(50),                -- MD
  pm              VARCHAR(100),               -- PM
  consultant_name VARCHAR(100),               -- 담당 컨설턴트
  note            TEXT,                       -- 비고
  CONSTRAINT fk_contract_company FOREIGN KEY (company_id)
    REFERENCES companies(id) ON DELETE CASCADE,
  INDEX idx_contract_company (company_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
