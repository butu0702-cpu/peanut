# 田邊好日｜雲林花生小農 D2C

以 Next.js App Router、Prisma 與 SQLite 建置的全端電商 MVP。包含消費者商店、Mock 手機／LINE 登入、購物車與多地址送禮、訂單建立、農友手機後台、模擬寄件條碼及 LINE 推播預覽。

## 本機啟動

需求：Node.js 20.9 以上及 npm。

```bash
npm install
copy .env.example .env
npx prisma db push
npm run db:seed
npm run dev
```

開啟 `http://localhost:3000`；農友後台位於 `/admin`。展示登入按鈕不需密碼。消費者可使用任意手機號碼與展示簡訊碼 `1234` 登入；種子資料的老客電話為 `0912345678`，首頁即可使用「一鍵跟單」。付款採展示流程，無需金流帳號。

## GitHub 推送

在 GitHub 建立空白 repository，於專案根目錄執行：

```bash
git init
git add .
git commit -m "Build Yunlin peanut D2C MVP"
git branch -M main
git remote add origin https://github.com/<your-account>/<repository>.git
git push -u origin main
```

不要提交 `.env` 或任何真實 Token。`.gitignore` 已排除環境檔及本機 SQLite 資料庫。

## Render 一鍵部署

1. 將 GitHub repository 連接 Render，選擇 **New + → Blueprint**。
2. Render 會讀取根目錄 `render.yaml`，建立 Web Service 並執行安裝、資料庫同步、種子資料與 Next.js production build。
3. 部署完成後透過 Render 提供的網址開啟商店，`/admin` 可進入農友 Demo 後台。
4. LINE 欄位可先留空，系統會採 Mock 模式並在畫面顯示推播預覽。設定 `LINE_NOTIFY_TOKEN` 後，伺服器會改以 LINE Messaging API 的 broadcast endpoint 發送訊息；請使用 LINE 官方帳號 Messaging API Channel access token。`LINE_CHANNEL_ID` 預留供帳號設定。

> Blueprint 會掛載 1 GB Render Persistent Disk 至 `/var/data`，SQLite 資料在該磁碟保存。Render Persistent Disk 限制單一服務實例擴展；正式營運需依流量評估資料庫方案。若改用 Render PostgreSQL，需將 `prisma/schema.prisma` datasource provider 改為 `postgresql`、重新產生 Prisma Client，並將 Render 提供的 `DATABASE_URL` 設為 Web Service 環境變數後部署。

## 環境變數

| 變數 | 用途 | 預設／Mock 行為 |
| --- | --- | --- |
| `DATABASE_URL` | Prisma 連線字串 | `file:./dev.db` |
| `LINE_CHANNEL_ID` | LINE Channel 設定預留 | 空白時採展示模式 |
| `LINE_NOTIFY_TOKEN` | LINE Messaging API token | 空白時只顯示推播預覽 |
| `NEXT_PUBLIC_APP_URL` | 公開網站網址 | 本機 `http://localhost:3000` |
| `PORT` | Render Web Service 連接埠 | Next.js start 預設 3000 |

## 展示功能

- 商品內含元長黑金剛、台南選 9 號焙炒花生仁、北港紅仁花生、冷壓花生油及無添加花生醬。
- 提供 1、5、10 台斤規格、免運門檻，以及超過 8 台斤改黑貓宅配的前端提示。
- 完售商品可登記簡訊採收通知；支援春作／秋作狀態切換。
- 後台訂單佇列可產生 Code 128 模擬寄件條碼及列印檢視。
- SGS 卡為互動式展示摘要，不代表實際批次檢驗文件；正式上線前應替換為真實報告。

## 專案結構

```text
app/             Next.js 商店、後台與 API
lib/prisma.ts    Prisma Client 單例
prisma/          SQLite Schema 與種子資料
render.yaml      Render Blueprint
```
