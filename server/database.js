// MySQL 커넥션 풀 설정.
// 접속 정보는 환경변수(.env)에서 읽으며, 미설정 시 로컬 개발 기본값으로 폴백한다.

const mysql = require('mysql2');
const dotenv = require('dotenv');
dotenv.config();

const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'cms_db',
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = db;
