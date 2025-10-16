# CardPro - Professional Business Card Platform

A modern, mobile-first platform for creating and discovering professional business cards with advanced search and geolocation features.

## Project info

**URL**: https://lovable.dev/projects/aee22516-5111-4130-a06e-c7a60e6d2e70

## ✨ Key Features

- 🔍 **Advanced Search** - Filter by category, location, rating, and more
- 📍 **Geolocation** - Find businesses near you with "Use my location"
- 🎨 **Dynamic Domains** - Categories fetched from API with fallback
- 📱 **Mobile-First Design** - Optimized for mobile devices
- 🌐 **Multi-language Support** - Ready for internationalization
- ⭐ **Favorites System** - Save your favorite businesses
- 📊 **Analytics** - Track views and scans
- 🔐 **Authentication** - Secure user login

## 🚀 Quick Start

### Prerequisites

- Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- Backend API running (see [API Documentation](./docs/api-documentation.md))

### Setup

```sh
# Step 1: Clone the repository
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory
cd <YOUR_PROJECT_NAME>

# Step 3: Install dependencies
npm i

# Step 4: Configure environment variables
cp .env.example .env
# Edit .env and set VITE_API_BASE_URL to your API endpoint

# Step 5: Start development server
npm run dev
```

### Environment Configuration

Create a `.env` file with:

```env
# API Configuration (Required)
VITE_API_BASE_URL=http://localhost:3000/api/v1

# Supabase (if using Lovable Cloud)
VITE_SUPABASE_PROJECT_ID=your-project-id
VITE_SUPABASE_PUBLISHABLE_KEY=your-key
VITE_SUPABASE_URL=https://your-project.supabase.co

# Google OAuth (Optional)
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

## 📖 Documentation

- [API Documentation](./docs/api-documentation.md) - Complete API reference
- [Production Setup Guide](./docs/production-setup.md) - Deployment checklist

## 💻 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Editing Options

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/aee22516-5111-4130-a06e-c7a60e6d2e70) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE (Local Development)**

Clone this repo and push changes. Pushed changes will also be reflected in Lovable.

```sh
# Clone and setup
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
npm i

# Configure environment
cp .env.example .env
# Edit .env with your API endpoint

# Start development
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

## 🛠️ Tech Stack

This project is built with:

- **Vite** - Fast build tool and dev server
- **TypeScript** - Type-safe JavaScript
- **React** - UI library
- **shadcn-ui** - Re-usable component library
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **OpenStreetMap Nominatim** - Free geocoding service

## 🌍 Geolocation Features

The app includes advanced location-based search:

- **Browser Geolocation** - Automatically detect user's location
- **Reverse Geocoding** - Convert coordinates to city names
- **Radius Search** - Find businesses within configurable distance (1-50km)
- **Manual Selection** - Fallback to manual city selection

### Usage

1. Click "Use my location" in the filter panel
2. Grant browser location permission
3. App detects your city automatically
4. Adjust search radius as needed

## 📦 Deployment

### Deploy with Lovable

Simply open [Lovable](https://lovable.dev/projects/aee22516-5111-4130-a06e-c7a60e6d2e70) and click on Share → Publish.

### Manual Deployment

See the [Production Setup Guide](./docs/production-setup.md) for detailed instructions on deploying to:
- Vercel
- Netlify
- Custom servers

## 🔗 Custom Domain

### Setting up a custom domain

Yes, you can connect a custom domain!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is part of the Lovable platform.

## 🆘 Support

- Check [Production Setup Guide](./docs/production-setup.md) for deployment issues
- Review [API Documentation](./docs/api-documentation.md) for API integration
- Visit [Lovable Documentation](https://docs.lovable.dev) for platform help
