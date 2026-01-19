# 📚 GPA Calculator

A modern, responsive web application to calculate your Grade Point Average (GPA) with an intuitive interface.

## Features

- ✨ **Easy-to-use interface** - Add courses with grades and credit hours
- 📊 **Real-time GPA calculation** - Watch your GPA update instantly
- 🎯 **Grade selection** - Choose from A to F grades with precise point values
- 🎨 **Beautiful design** - Modern, responsive UI that works on all devices
- 📱 **Mobile-friendly** - Fully responsive on phones, tablets, and desktops
- 🗑️ **Course management** - Add, view, and delete courses easily
- 🎊 **GPA status** - Visual feedback for your GPA performance

## Tech Stack

- **React** - UI library
- **Vite** - Build tool and development server
- **CSS3** - Styling with gradients and animations
- **JavaScript** - Application logic

## Local Development

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd GPA-Calculator
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173/`

## Building for Production

To create an optimized production build:

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/your-username/GPA-Calculator.git
git push -u origin main
```

2. Go to [Vercel](https://vercel.com) and sign up/login
3. Click "New Project"
4. Import your GitHub repository
5. Vercel will automatically detect Vite settings
6. Click "Deploy"

Your app will be live at a URL like `https://your-app-name.vercel.app`

### Deploy to Netlify

1. Push your code to GitHub
2. Go to [Netlify](https://netlify.com) and sign up/login
3. Click "New site from Git"
4. Connect your GitHub account and select the repository
5. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Click "Deploy"

### Deploy to GitHub Pages

1. Update `vite.config.js`:
```javascript
export default {
  base: '/GPA-Calculator/',
  // ... rest of config
}
```

2. Build and push to GitHub with the `dist/` folder

## Usage

1. **Enter Course Details**: Type in the course name, select the grade, and input credit hours
2. **Add Course**: Click the "Add Course" button
3. **View Results**: Your GPA will be calculated automatically and displayed
4. **Manage Courses**: View all added courses in the list, delete any course with the ✕ button
5. **Clear All**: Start over by clicking "Clear All Courses"

## Grade to GPA Conversion

| Grade | Points |
|-------|--------|
| A     | 4.0    |
| A-    | 3.7    |
| B+    | 3.3    |
| B     | 3.0    |
| B-    | 2.7    |
| C+    | 2.3    |
| C     | 2.0    |
| C-    | 1.7    |
| D+    | 1.3    |
| D     | 1.0    |
| F     | 0.0    |

## GPA Performance Status

- **Excellent** - 3.7 and above
- **Very Good** - 3.3 to 3.6
- **Good** - 3.0 to 3.2
- **Satisfactory** - 2.7 to 2.9
- **Average** - 2.0 to 2.6
- **Below Average** - Below 2.0

## License

This project is open source and available under the MIT License.

## Contributing

Feel free to fork this project and submit pull requests for any improvements!

## Support

If you encounter any issues or have suggestions, please create an issue on GitHub.

---

**Made with ❤️ for students everywhere**

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
