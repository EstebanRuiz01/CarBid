# 🚗 CarBid — Online Car Auction Platform

CarBid is a web application for **online vehicle auctions**. Users can explore vehicle listings, place bids, track auction activity, and receive real-time updates.

🎯 **Project goal:** Demonstrate full-stack web development, database design, authentication, and real-time communication.

📦 This repository contains the source code and database schema only. **No users, auctions, bids, or other application records are included.**

## ✨ Features

- 🔐 User registration and authentication using JWT.
- 🚘 Vehicle auction creation and browsing.
- 💰 Bidding system with real-time updates.
- ⚡ Real-time communication using Socket.IO.
- 📜 Auction history and notifications.
- 🗄️ MySQL database integration.
- 📱 Responsive user interface.

## 🎬 Demo

- 📺 **Video demonstration:** [Watch on YouTube](YOUR_YOUTUBE_VIDEO_URL)
- 💻 **GitHub repository:** [EstebanRuiz01/CarBid](https://github.com/EstebanRuiz01/CarBid)

## 🛠️ Technologies

### 🎨 Frontend
- ⚛️ React
- ⚡ Vite
- 📘 TypeScript
- 🎨 Tailwind CSS
- 🔄 Axios
- 🔌 Socket.IO Client

### ⚙️ Backend
- 🟢 Node.js
- 🚂 Express
- 🐬 MySQL
- 🔑 JSON Web Tokens (JWT)
- 🔒 bcryptjs
- 🔌 Socket.IO
- 📁 Multer
- ⏰ node-cron

## 📂 Project Structure

```text
CarBid/
├── carbid-backend/
│   ├── routes/
│   ├── db.js
│   ├── server.js
│   ├── package.json
│   └── .env.example
├── carbid-frontend/
│   ├── public/
│   ├── src/
│   └── package.json
├── database/
│   └── schema.sql
└── README.md
```

## 📋 Requirements

Before getting started, install:

- 🟢 [Node.js](https://nodejs.org/) and npm
- 🐬 [MySQL Community Server](https://dev.mysql.com/downloads/mysql/)
- 🐙 [Git](https://git-scm.com/)

💡 MySQL Workbench is optional but useful for managing the database visually.

## 🚀 Local Installation

### 1️⃣ Clone the repository

```bash
git clone https://github.com/EstebanRuiz01/CarBid.git
cd CarBid
```

### 2️⃣ Create the local database

Start your local MySQL server and connect using MySQL Workbench or the MySQL command-line client.

Create an empty database:

```sql
CREATE DATABASE carbid
CHARACTER SET utf8mb4
COLLATE utf8mb4_0900_ai_ci;
```

Select the database:

```sql
USE carbid;
```

#### 📥 Import the database schema

**Option A — MySQL Workbench**

1. Open MySQL Workbench and connect to your local MySQL server.
2. Open `database/schema.sql` using **File → Open SQL Script**.
3. Select the `carbid` schema as the default schema.
4. Execute the script.
5. Refresh the schema and verify that the tables and view were created.

**Option B — Command line**

From the repository root, run the following command in Windows Command Prompt. Replace `your_mysql_user` with your local MySQL username:

```cmd
mysql -u your_mysql_user -p carbid < database/schema.sql
```

Enter your MySQL password when prompted.

✅ The schema creates the database tables and the `users_auction_history` view.

📌 **Important:** The database starts empty. No users, vehicles, bids, or other application records are included.

⚠️ The SQL script contains `DROP TABLE IF EXISTS` statements. Import it into a new, empty database rather than a database containing information you want to preserve.

### 3️⃣ Configure the backend

Open a terminal in the backend directory:

```bash
cd carbid-backend
npm install
```

Create a `.env` file by copying `.env.example`, then configure your local MySQL credentials:

```dotenv
DB_HOST=localhost
DB_USER=your_database_user
DB_PASS=your_database_password
DB_NAME=carbid
DB_PORT=3306

JWT_SECRET=replace_with_a_long_random_secret
PORT=4000
```

🔐 Replace the example values with your own local configuration. Use a long, random secret for `JWT_SECRET` and **never commit your real `.env` file**.

Start the backend:

```bash
node server.js
```

🌐 The backend should run at `http://localhost:4000` with the default configuration.

### 4️⃣ Configure and run the frontend

Open a second terminal:

```bash
cd carbid-frontend
npm install
npm run dev
```

🌍 Open the local URL displayed by Vite, usually `http://localhost:5173`.

Keep both terminals running while using the application.

## 🗄️ Database Structure

The `database/schema.sql` file defines the following database objects:

| Table / View | Description |
|---|---|
| 👤 `users` | User accounts and password hashes |
| 🚘 `auctions` | Vehicle auction listings |
| 💰 `bids` | Bids placed on auctions |
| 🚦 `flags` | Auction status values |
| 🏁 `auctions_result` | Auction result records |
| 📜 `users_auction_history` | View for auction and bidding history |

🧪 **Testing:** Register a user through the application to begin testing, if registration is available. You can then explore the application's features and create records through its interface.

## 🔒 Security Notes

- 🔑 Never commit `.env` files or real credentials.
- 🛡️ Do not publish personal information or production database exports.
- 👥 Use a dedicated local MySQL account with appropriate permissions.
- 🔐 Use strong, unique secrets for local testing.

## 🎓 Learning Objectives

This project demonstrates practical experience with:

- 🧩 Full-stack web development.
- 🔗 REST API integration.
- 🗃️ Relational database design.
- 🔐 Authentication and password hashing.
- ⚡ Real-time communication.
- 🧱 Frontend and backend integration.

## 👨‍💻 Author

**Esteban Ruiz**

🎓 Computer Science and Systems Engineering student at Rafael Landívar University.

## 📄 License

No license has been specified yet. Unless a license is added, the repository remains subject to the default copyright restrictions.
