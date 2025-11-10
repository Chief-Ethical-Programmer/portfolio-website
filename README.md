# Portfolio Website

A modern, responsive portfolio website built with React, featuring blog posts, projects, achievements, and certifications.

## Features

- ✨ Modern and responsive design
- 📱 Mobile-friendly navigation
- 📝 Blog posts section
- 💼 Projects showcase with filtering
- 🏆 Achievements timeline
- 🎓 Certifications and badges
- 👤 About me section with skills and experience
- 🎨 Beautiful UI with smooth animations

## Tech Stack

- **React** - UI library
- **React Router** - Client-side routing
- **Vite** - Build tool and dev server
- **CSS3** - Styling with modern features

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Navigate to the project directory:
```bash
cd "Portfolio Website"
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and visit `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
Portfolio Website/
├── src/
│   ├── components/       # Reusable components
│   │   ├── Navigation.jsx
│   │   └── Navigation.css
│   ├── pages/            # Page components
│   │   ├── Home.jsx
│   │   ├── About.jsx
│   │   ├── Projects.jsx
│   │   ├── Blog.jsx
│   │   ├── Achievements.jsx
│   │   └── Certifications.jsx
│   ├── data/             # Data files for content
│   │   ├── aboutData.js
│   │   ├── projectsData.js
│   │   ├── blogData.js
│   │   ├── achievementsData.js
│   │   └── certificationsData.js
│   ├── App.jsx           # Main app component
│   ├── App.css
│   ├── main.jsx          # Entry point
│   └── index.css         # Global styles
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## Customization

### Updating Content

Edit the data files in `src/data/` to customize your content:

- **About Me**: Edit `src/data/aboutData.js` to update skills, experience, and education
- **Projects**: Edit `src/data/projectsData.js` to add or modify projects
- **Blog Posts**: Edit `src/data/blogData.js` to add new blog posts
- **Achievements**: Edit `src/data/achievementsData.js` to update achievements
- **Certifications**: Edit `src/data/certificationsData.js` to add certifications

### Styling

- Global styles: `src/index.css`
- Component styles: Individual CSS files in `src/components/` and `src/pages/`
- Color scheme: Update CSS variables in `src/index.css`

### Adding Images

1. Create a `public` folder in the root directory
2. Add your images to the `public` folder
3. Reference them in your data files using `/image-name.jpg`

## Pages

- **Home** (`/`) - Hero section and quick links
- **About** (`/about`) - Skills, experience, and education
- **Projects** (`/projects`) - Portfolio projects with filtering
- **Blog** (`/blog`) - Blog posts and articles
- **Achievements** (`/achievements`) - Milestones and accomplishments
- **Certifications** (`/certifications`) - Professional certifications and badges

## Deployment

### Deploy to Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`

### Deploy to Netlify

1. Build the project: `npm run build`
2. Drag and drop the `dist` folder to Netlify

### Deploy to GitHub Pages

1. Install gh-pages: `npm install --save-dev gh-pages`
2. Add to `package.json`:
```json
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d dist"
}
```
3. Run: `npm run deploy`

## License

MIT License - feel free to use this project for your portfolio!

## Contact

Feel free to customize this portfolio to match your style and add your own content!


