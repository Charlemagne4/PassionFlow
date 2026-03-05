## PassionFlow 🎮

PassionFlow is a Node.js/Express web app for building and sharing your video game backlog. It lets you search games via the IGDB API, organize them into lists (e.g. playing, completed, to play), and browse your own and other users’ libraries. User profiles, favorites, and friend features turn it into a small social space around what you’re playing.

---

### 1. Project Title & Short Description

**PassionFlow** is a learning project focused on game discovery and backlog management. It combines a classic Express/MongoDB backend with EJS views to handle authentication, game lists, and profile management. The app integrates with the IGDB API to fetch real game data and display it with a custom UI.

---

### 2. Why I Built This

I built this as a **learning project**, using Node.js, Express, MongoDB, and EJS a second time before moving on to frameworks like Next.js and React. The goal was to really understand how routing, sessions, authentication, templating, and database models work **under the hood** without hiding behind too much abstraction. This app is a portfolio piece that documents that growth rather than a polished production-ready product.

---

### 3. Tech Stack & Dependencies ⚙️

**Core stack (with badges):**

- ![Node.js](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white)  
- ![Express](https://img.shields.io/badge/Express.js-000000?logo=express&logoColor=white)  
- ![MongoDB](https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=white)  
- ![EJS](https://img.shields.io/badge/EJS-8BC34A)

**Main runtime dependencies (from `package.json`):**

- **Server & core**: `express`, `mongoose`, `method-override`, `cors`
- **Templating & views**: `ejs`, `ejs-mate`, `bootstrap`, custom CSS/JS in `public/`
- **Auth & sessions**: `passport`, `passport-local`, `passport-local-mongoose`, `express-session`, `connect-mongo`, `cookie-parser`, `connect-flash`
- **Security & validation**: `helmet` (with a custom Content Security Policy), `express-mongo-sanitize`, `sanitize-html`, `joi`
- **File uploads & media**: `multer`, `multer-storage-cloudinary`, `cloudinary`
- **HTTP & APIs**: `axios` (for IGDB API calls)
- **Config & utilities**: `dotenv`, `mongoose-lean-virtuals`
- **Dev tooling**: `nodemon`

External services used in the code:

- **MongoDB** (via `DB_URL`)
- **Cloudinary** for image storage
- **IGDB API** for game data

---

### 4. What I Learned 🧠

From the actual code in this repo:

- **Routing with Express**
  - `app.js` wires up route modules for `"/"` (home), `"/games"`, `"/profile"`, and user-related routes under `"/"`.
  - `routes/games.js` handles listing games, advanced search, viewing individual games, managing personal game lists (`/myGames`, `/userGames/:id`), and favorites.
  - `routes/users.js` covers registration, login, logout, listing users, searching users, and friend-related routes.
  - `routes/profile.js` manages profile viewing/editing and settings.

- **Connecting to MongoDB & Mongoose models**
  - `app.js` connects to MongoDB using `mongoose.connect` with a configurable `DB_URL`.
  - The app uses several Mongoose models:
    - `models/User.js` for users, including profile fields, favorite genres/games, friends, and friend requests (with `passport-local-mongoose` and `mongoose-lean-virtuals` plugins).
    - `models/UserGameList.js` for tracking each user’s game list with statuses like `ToPlay`, `completed`, `playing`, `dropped`, and `onHold`.
    - `models/UserSettings.js` for user preferences (theme, language, public game list, notifications).
    - `models/GameReview.js` for user-written reviews (schema is present; integration into routes/views can be extended).

- **Templating with EJS**
  - The app uses `ejs` with `ejs-mate` layouts (`views/layouts/boilerplate.ejs`) for a shared structure (navbar, flash messages, etc.).
  - Views such as `views/home.ejs`, `views/games/index.ejs`, `views/games/search.ejs`, `views/games/show.ejs`, `views/games/myGames.ejs`, `views/games/advancedSearch.ejs`, and user-related views (`views/users/*.ejs`) render game data, search results, profiles, and friends.
  - Partials like `views/partials/navbar.ejs` and `views/partials/flash.ejs` are included to keep the layout DRY.

- **Middleware, auth, and session handling**
  - `app.js` configures sessions with `express-session` and `connect-mongo`, storing sessions in MongoDB with a secret.
  - `passport` is configured for local authentication using `User.authenticate()`, `serializeUser`, and `deserializeUser`.
  - Custom middleware in `middleware.js`:
    - `isLoggedIn` protects routes (e.g. profile, game lists, favorites).
    - `ReturnTo` remembers the original URL before login and redirects there after authentication.
    - `trimFields` cleans up whitespace in login/register form input.
  - Flash messages (`connect-flash`) are exposed to all views via `res.locals` in `app.js`.

- **Security hardening**
  - `helmet` is configured with a **custom Content Security Policy** limiting script, style, image, and font sources.
  - `express-mongo-sanitize` helps prevent query injection attacks.
  - `sanitize-html` is available for sanitizing user input (e.g., for future rich text content).

- **File uploads & Cloudinary integration**
  - `cloudinary/index.js` configures Cloudinary with environment variables and sets up `multer-storage-cloudinary`.
  - `routes/profile.js` and `controllers/profile.js` use `multer` to upload profile images, store them in Cloudinary, and update the user’s `profileImage` field (including deleting the old image when replacing).

- **CRUD operations around games & friends**
  - Game-related flows in `controllers/games.js`:
    - Fetch lists of popular, new, upcoming games and personalized recommendations (based on favorite genres) from IGDB.
    - Search games by name, view detailed information for a single game, and render those results.
    - Manage user-specific game status (add/update entries in `UserGameList`) and favorites.
    - Build advanced search queries based on themes, genres, platforms, and year ranges, returning JSON for the frontend.
  - User/friend flows in `controllers/user.js`:
    - Register and log in users, automatically logging them in after registration.
    - Manage friend requests (send, accept, reject) using `friendRequests` and `friends` arrays on the `User` model.
    - View a user’s friends list and search for other users (excluding the current user).

- **API calls & data handling**
  - IGDB API calls are made using `axios` with `Client-ID` and `Authorization` headers sourced from environment variables.
  - Multiple parallel requests are used (e.g. for multiple favorite genres) and combined into objects before rendering.
  - Advanced search dynamically builds IGDB query strings from the user’s selections (themes, genres, platforms, year range).

- **Error handling & utilities**
  - `Utility/catchAsync.js` wraps async route handlers and passes errors to Express’ error middleware.
  - `Utility/ExpressErrorHandler.js` defines a simple custom error class used for 404 handling and other server errors.
  - `views/error.ejs` is used to render errors thrown in the app.

---

### 5. Project Structure 🗂️

Key parts of the project:

- **`app.js`**: Main entry point. Configures Express, MongoDB connection, sessions, Passport auth, Helmet CSP, static assets, view engine, flash messages, and mounts all route modules.
- **`routes/`**
  - `users.js`: Registration, login/logout, friends, user search/list routes.
  - `games.js`: Game index, search, advanced search, my games, user games, favorites, and show routes.
  - `profile.js`: Profile display, profile editing, image uploads, and public game list settings.
- **`controllers/`**
  - `user.js`: User registration, login, logout, friend system, user listings, and search.
  - `games.js`: All game-related logic and IGDB integration.
  - `profile.js`: Profile retrieval, editable fields (username, email, bio, favorite genres), profile image, and settings.
- **`models/`**
  - `User.js`: User schema with auth plugin, profile fields, favorites, friends, and friend requests.
  - `UserGameList.js`: Mapping between users and IGDB game IDs, with status and timestamps.
  - `UserSettings.js`: Per-user preferences (theme, language, public game list, notifications).
  - `GameReview.js`: Structure for user-written game reviews (currently schema-level).
- **`views/`**
  - `layouts/boilerplate.ejs`: Base layout including navbar, flash messages, and Bootstrap.
  - `home.ejs`: Simple home page.
  - `games/*.ejs`: Listing, search results, advanced search UI, individual game pages, and “my games”/library views.
  - `users/*.ejs`: Login, register, profile display, profile edit page, users list, friends list.
  - `partials/*.ejs`: Shared UI chunks like the navbar and flash message blocks.
  - `error.ejs`: Error view.
- **`public/`**
  - `css/*.css`: Styling for global layout, index page, game grid, search, advanced search, my games, and show pages.
  - `javascripts/*.js`: Client-side behavior for advanced search, form validation, search bar, and user search.
- **`cloudinary/`**
  - `index.js`: Cloudinary + Multer storage configuration for profile images.
- **`Utility/`**
  - `catchAsync.js`, `ExpressErrorHandler.js`, `time.js` (and similar helpers).
- **Root utilities**
  - `themes.js`, `platforms.js`: Static configuration data used by the games and profile flows.

---

### 6. How to Run It Locally 🏃‍♂️

**Prerequisites**

- Node.js and npm installed.
- Access to a MongoDB instance.
- Cloudinary account (for profile images).
- IGDB API credentials (Client ID and OAuth token).

**1. Clone and install**

```bash
git clone https://github.com/Charlemagne4/PassionFlow.git
cd PassionFlow
npm install
```

**2. Environment variables**

Create a `.env` file in the project root and define the variables that are actually used in the code:

- **`DB_URL`** – MongoDB connection string used by Mongoose and `connect-mongo`.
- **`SECRET`** – Secret used to encrypt the session store.
- **`CLOUD_NAME`** – Cloudinary cloud name.
- **`APIkey`** – Cloudinary API key.
- **`APIsecret`** – Cloudinary API secret.
- **`ClientID`** – IGDB/Twitch Client ID for the IGDB API.
- **`Authorization`** – IGDB API authorization header value (e.g. an OAuth Bearer token).

`NODE_ENV` is also checked in `app.js` to decide when to load `dotenv`, but it’s optional for local development.

**3. Start the server**

You can run the app directly:

```bash
node app.js
```

Or, if you add a script in `package.json` like:

```json
"scripts": {
  "start": "node app.js"
}
```

then you can use:

```bash
npm start
```

By default the server listens on **port `3001`** (`http://localhost:3001`).

---

### 7. Screenshots 🖼️

*(To be added later)*  
Suggested screenshots:

- Home page
- Game discovery / search results
- Single game page
- “My Games” view with categories
- User profile page and friends list

---

### 8. Challenges & What I’d Do Differently Next Time

- **Stronger separation of concerns and smaller controllers**
  - Some controllers (especially `controllers/games.js` and parts of `controllers/user.js`) handle a lot of responsibilities in a single file. Next time, I’d break them into smaller modules (e.g. one file for IGDB integration, one for list management, one for favorites) to make testing and maintenance easier.

- **Tighter configuration and environment handling**
  - The code currently relies on a number of environment variables and some defaults (like the session secret and DB URL). In a future iteration, I’d centralize configuration, avoid hard-coded secrets, and add validation for required env vars at startup.

- **More consistent patterns and tests**
  - Error handling uses good patterns (like `catchAsync` and a custom `ExpressErrorHandler`), but it’s not fully consistent across all routes yet. I’d also add automated tests and clearer validation logic around user input (for example, when updating profiles or searching) to make the app safer and more robust.

- **Frontend polish and UX**
  - The EJS templates and custom CSS/JS work, but there’s room to streamline components and standardize styling. If I were to redo this after moving to React/Next.js, I’d reuse what I learned here about data modeling, auth, and APIs, then rebuild the UI with more reusable components and modern tooling.

Overall, this project is intentionally not “perfect”—it’s a snapshot of my progress with the Node.js/Express/MongoDB/EJS stack and a stepping stone towards more modern fullstack development.

