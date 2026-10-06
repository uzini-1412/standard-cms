#!/usr/bin/env bash
# VM 배포 스크립트 — 최신 main 을 받아 API 서버 재시작 + 프론트 재빌드.
#   bash ~/standard-cms/scripts/deploy.sh
# GitHub Actions(.github/workflows/deploy.yml)가 push 때마다 SSH 로 이걸 실행한다.
#
# 전제(VM 최초 세팅 시 1회): docker compose 로 MySQL 기동, server/.env 작성,
# pm2 에 cms-api 등록, nginx 가 /var/www/cms 를 서빙.
#
# git pull 로 이 파일 자체가 바뀌어도 안전하도록 전체를 함수로 감싸 먼저 파싱한다.

main() {
  set -euo pipefail
  local repo web_root
  repo="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
  web_root=/var/www/cms

  echo "==> 코드 갱신"
  cd "$repo"
  git pull --ff-only -q origin main
  git log --oneline -1

  echo "==> API 서버"
  cd "$repo/server"
  npm ci --omit=dev --silent --no-audit --no-fund
  mkdir -p uploads
  pm2 restart cms-api --update-env > /dev/null
  pm2 save > /dev/null

  echo "==> 프론트 빌드"
  cd "$repo/CMS"
  npm ci --silent --no-audit --no-fund
  # 비워두면 같은 주소의 /api 를 호출한다(nginx 가 Node 로 프록시).
  VITE_SERVER_URL= npm run build > /dev/null
  find "$web_root" -mindepth 1 -delete
  cp -r dist/. "$web_root/"

  echo "==> 확인"
  sleep 2
  curl -fsS -o /dev/null -w "api: %{http_code}\n" http://127.0.0.1:5000/api/managers
  curl -fsS -o /dev/null -w "web: %{http_code}\n" http://127.0.0.1/
  echo "배포 완료"
}

main "$@"
