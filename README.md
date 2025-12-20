# VidStreem

VidStreem is a comprehensive video streaming platform that allows users to upload, manage, and stream videos. It features user authentication, subscription management, category-based organization, and cross-platform support with web and mobile applications.

## Features

- **User Authentication**: Secure login and registration with JWT tokens.
- **Video Upload and Management**: Upload videos up to 500MB in supported formats (MP4, AVI, MKV, WebM).
- **Category Management**: Organize videos into categories for easy browsing.
- **Subscription Plans**: Manage user subscriptions with different plans.
- **Video Gallery**: Browse and stream videos with watch history tracking.
- **Admin Dashboard**: Manage users, categories, and videos.
- **Cross-Platform**: Web application (React) and Android mobile app.
- **API Documentation**: Integrated Swagger UI for API testing.

## Tech Stack

### Backend
- **Framework**: ASP.NET Core Web API
- **Language**: C#
- **Database**: SQL Server
- **Authentication**: JWT Bearer Tokens
- **ORM**: Entity Framework Core
- **Documentation**: Swagger/OpenAPI

### Frontend (Web)
- **Framework**: React 19
- **Build Tool**: Vite
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **Styling**: CSS

### Mobile
- **Platform**: Android
- **Language**: Kotlin
- **Build System**: Gradle (KTS)
- **Minimum SDK**: API 26 (Android 8.0)

### Other
- **Version Control**: Git
- **License**: MIT

## Prerequisites

Before running the project, ensure you have the following installed:

- **.NET 8.0 SDK** (for backend)
- **Node.js 18+** (for React frontend)
- **Android Studio** (for Android app)
- **SQL Server** (for database)
- **Git**

## Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/hinman2115/VidStreem.git
cd VidStreem
```

### 2. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend/VidStreem Backbone
   ```

2. Restore dependencies:
   ```bash
   dotnet restore
   ```

3. Update the connection string in `appsettings.json`:
   ```json
   "ConnectionStrings": {
     "DefaultConnection": "Server=your-server;Database=VidStreemDb;Trusted_Connection=True;TrustServerCertificate=True;"
   }
   ```

4. Update JWT settings in `appsettings.json`:
   ```json
   "Jwt": {
     "Key": "your-secret-key-here",
     "Issuer": "VidStreem",
     "Audience": "VidStreemUsers"
   }
   ```

5. Run database migrations:
   ```bash
   dotnet ef database update
   ```

6. Run the backend:
   ```bash
   dotnet run
   ```

   The API will be available at `http://localhost:5148` with Swagger UI at `http://localhost:5148/swagger`.

### 3. React Frontend Setup

1. Navigate to the React directory:
   ```bash
   cd ../react
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173`.

### 4. Android App Setup

1. Open Android Studio and select "Open an existing Android Studio project".
2. Navigate to the `android` directory and open it.
3. Wait for Gradle sync to complete.
4. Run the app on an emulator or connected device.

## API Endpoints

### Authentication
- `POST /api/UserController/login` - User login
- `POST /api/UserController/register` - User registration

### Videos
- `POST /api/VideohandelApiController/upload` - Upload a video
- `GET /api/VideohandelApiController/videos` - Get all videos
- `GET /api/VideohandelApiController/videos/{id}` - Get video by ID
- `DELETE /api/VideohandelApiController/videos/{id}` - Delete a video

### Categories
- `GET /api/CategoryVC/categories` - Get all categories
- `POST /api/CategoryVC/categories` - Create a new category
- `PUT /api/CategoryVC/categories/{id}` - Update a category
- `DELETE /api/CategoryVC/categories/{id}` - Delete a category

### Subscriptions
- `GET /api/SubscriptionController/plans` - Get subscription plans
- `POST /api/SubscriptionController/subscribe` - Subscribe to a plan

### Users (Admin)
- `GET /api/UserController/users` - Get all users
- `PUT /api/UserController/users/{id}` - Update user
- `DELETE /api/UserController/users/{id}` - Delete user

## Usage

1. **Registration/Login**: Users can register or log in via the web app or mobile app.
2. **Dashboard**: After login, access the dashboard to view videos, upload content, or manage categories/users (if admin).
3. **Video Upload**: Use the upload form to add videos with category selection.
4. **Browsing**: Navigate through categories and watch videos in the gallery.
5. **Subscriptions**: View and manage subscription plans.

## Screenshots

### Login Page
![Login Page](screenshots/login.png)

### Dashboard
![Dashboard](screenshots/dashboard.png)

### Video Upload
![Video Upload](screenshots/upload.png)

### Video Gallery
![Video Gallery](screenshots/gallery.png)

*Note: Add actual screenshots to the `screenshots/` directory.*

## Project Structure

```
VidStreem/
├── android/                 # Android mobile app
│   ├── app/
│   │   ├── build.gradle.kts
│   │   └── src/
│   └── build.gradle.kts
├── backend/                 # .NET Core API
│   └── VidStreem Backbone/
│       ├── Controllers/     # API controllers
│       ├── Db/              # Database contexts
│       ├── Entity/          # Entity models
│       ├── Models/          # DTOs and models
│       ├── Program.cs       # Application entry point
│       └── appsettings.json # Configuration
├── react/                   # React web application
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── App.jsx          # Main app component
│   │   └── ...
│   ├── package.json
│   └── vite.config.js
├── myreactapp/              # Additional React app (if used)
└── README.md
```

## Contributing

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature-name`.
3. Commit your changes: `git commit -am 'Add new feature'`.
4. Push to the branch: `git push origin feature-name`.
5. Submit a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

For questions or support, please open an issue on GitHub or contact the maintainers.