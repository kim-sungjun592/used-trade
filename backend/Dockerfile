# 1. Node.js 가벼운 버전을 베이스 이미지로 사용
FROM node:18-alpine

# 2. 컨테이너 내부 작업 폴더 설정
WORKDIR /app

# 3. 라이브러리 목록 복사 및 설치
COPY package*.json ./
RUN npm install

# 4. 백엔드 소스코드 전체 복사
COPY . .

# 5. 백엔드가 사용할 5000번 포트 개방
EXPOSE 5000

# 6. 서버 실행 명령어
CMD ["node", "server.js"]