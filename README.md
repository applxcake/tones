# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/1f01a654-c0e4-4941-97f0-e5db1d3d5773

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/1f01a654-c0e4-4941-97f0-e5db1d3d5773) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/1f01a654-c0e4-4941-97f0-e5db1d3d5773) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

# Tones - Music Player

A modern, responsive music player built with React, TypeScript, and Tailwind CSS. Features background audio playback, YouTube integration, and a beautiful UI.

## Features

- 🎵 **YouTube Music Integration** - Stream music directly from YouTube
- 🎧 **Background Audio Playback** - Continue listening when the app is in the background
- 📱 **Progressive Web App (PWA)** - Install as a native app on mobile devices
- 🌙 **Dark/Light Theme** - Beautiful themes with smooth transitions
- 🎨 **Modern UI** - Responsive design with animations and visual effects
- 🔍 **Search & Discovery** - Find new music with advanced search
- 📋 **Playlists** - Create and manage your music playlists
- ⭐ **Favorites** - Save your favorite tracks for quick access

## Background Audio Support

The app includes comprehensive background audio support for mobile devices:

### Features
- **Service Worker** - Keeps audio playing when the app is in the background
- **Wake Lock** - Prevents device sleep during playback
- **Media Session API** - Lock screen controls and notifications
- **Audio Focus** - Proper audio session management on mobile

### How to Test Background Audio

1. **Open the app** in a mobile browser or desktop
2. **Navigate to Settings** page
3. **Enable Background Playback** using the toggle switch
4. **Start playing music** from any track
5. **Minimize the app** or switch to another tab/app
6. **Verify audio continues** playing in the background
7. **Check lock screen controls** (on supported devices)

### Testing on Different Devices

#### Mobile (iOS/Android)
- Add the app to home screen for best results
- Background audio works best when installed as PWA
- Lock screen controls available on supported devices

#### Desktop
- Background audio works when switching tabs
- Media session controls available in browser

#### Browser Support
- **Chrome/Edge**: Full support
- **Firefox**: Limited support
- **Safari**: Limited support (iOS restrictions)

### Troubleshooting

If background audio isn't working:

1. **Check browser support** - Use Chrome/Edge for best compatibility
2. **Enable permissions** - Allow notifications and audio permissions
3. **User interaction required** - Click/tap the page before testing
4. **Mobile restrictions** - Some mobile browsers have limitations
5. **Check Settings page** - Use the test features button to diagnose issues

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd tones
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI**: Tailwind CSS + shadcn/ui + Framer Motion
- **Authentication**: Firebase Auth
- **Database**: Firebase Firestore
- **Avatar Storage**: URLs stored in Firestore user profiles
- **Background Audio**: YouTube Player API
- **Deployment**: Vercel (recommended)

## Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # UI components (shadcn/ui)
│   └── ...             # Feature components
├── contexts/           # React contexts
├── hooks/              # Custom hooks
├── pages/              # Page components
├── services/           # API services
├── types/              # TypeScript types
└── integrations/       # Third-party integrations
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
