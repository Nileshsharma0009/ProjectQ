# Smart QR Attendance System

A robust, secure, and efficient attendance management system built with the **MERN Stack** (MongoDB, Express, React, Node.js). This application streamlines the attendance process using dynamic QR codes while preventing proxy attendance through advanced security measures.

##  Key Features

###  Advanced Security (Anti-Proxy)
- **Dynamic QR Codes**: QR codes regenerate every few seconds to prevent sharing.
- **Geo-Fencing**: Students must be within a specific radius of the classroom to mark attendance.
- **Device Binding**: Accounts are locked to a specific device (fingerprint) to prevent multiple logins.
- **IP Binding**: Restricts attendance marking to specific network IPs (e.g., college Wi-Fi).
- **Encrypted Tokens**: QR data is encrypted to prevent tampering.

###  User Roles

#### **Student**
- Scan QR code to mark attendance.
- View attendance history and statistics.
- Dashboard with subject-wise analytics.
- Profile and device management.

#### **Teacher**
- Create and schedule lectures.
- Generate dynamic QR codes for live classes.
- View real-time attendance updates.
- Manually modify attendance records if needed.
- Export attendance reports.

#### **Admin**
- Manage users (Students, Teachers).
- Configure system-wide security settings (Geo-fence radius, IP ranges).
- View overall system analytics.

##  Tech Stack

- **Frontend**: React.js, Tailwind CSS, Lucide React (Icons), Html5-Qrcode.
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB (MongooseODM).
- **Authentication**: JWT (JSON Web Tokens).

##  Project Structure

```
ProjectQ/
├── qr/                 # Frontend (React Application)
│   ├── src/
│   │   ├── pages/      # Route components (Student, Teacher, Admin)
│   │   ├── components/ # Reusable UI components
│   │   ├── context/    # State management
│   │   └── assets/     # Images and static files
│   └── ...
│
├── server/             # Backend (Node.js API)
│   ├── src/
│   │   ├── controllers/# Route logic
│   │   ├── models/     # Database schemas
│   │   ├── routes/     # API endpoints
│   │   └── middleware/ # Auth and security checks
│   └── ...
└── ...
```

##  Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (Local or Atlas)

### Installation

1.  **Clone the repository**
    ```bash
    git clone <repository-url>
    cd ProjectQ
    ```

2.  **Backend Setup**
    ```bash
    cd server
    npm install
    ```
    *   Create a `.env` file in the `server` directory with the following variables:
        ```env
        PORT=5000
        MONGO_URI=your_mongodb_connection_string
        JWT_SECRET=your_jwt_secret_key
        # Add other config variables as needed
        ```
    *   Start the server:
        ```bash
        npm run dev
        ```

3.  **Frontend Setup**
    ```bash
    cd qr
    npm install
    ```
    *   Create a `.env` file in the `qr` directory (if needed for API URL):
        ```env
        VITE_API_URL=http://localhost:5000/api
        ```
    *   Start the React app:
        ```bash
        npm run dev
        ```

4.  **Access the Application**
    *   Frontend: `http://localhost:5173` (or port shown in terminal)
    *   Backend API: `http://localhost:5000`

##  Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

##  License

This project is licensed under the MIT License.
