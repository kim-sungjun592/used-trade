FROM node:18-alpine

WORKDIR /app

# 패키지 파일 복사 및 설치
COPY package*.json ./
RUN npm install

# 소스코드 복사
COPY . .

# 리액트나 백엔드 포트 (보통 3000번이나 5000번)
EXPOSE 3000

# package.json의 start 스크립트 실행
CMD ["npm", "start"]
