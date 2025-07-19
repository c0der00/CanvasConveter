# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

# Canvas.js Converter

Canvas.js Converter is a React-based tool that converts various file formats (PNG, JPEG, JPG, SVG, FIG, and PDF) into a JSON structure compatible with **Canvas.js**. It supports previews and generates a JavaScript-friendly object that includes bitmap data as base64-encoded images.

## Features

- ✅ Upload and preview image formats: PNG, JPEG, JPG
- ✅ Convert vector formats like SVG and FIG (via Figma API)
- ✅ Render multi-page PDFs and convert them into canvas bitmap objects
- ✅ View generated Canvas.js-compatible JSON
- ✅ Copy JSON output to clipboard

## 📦 Supported File Formats

- `.png`
- `.jpg`, `.jpeg`
- `.svg`
- `.pdf`
- `.fig` (requires Figma File Key and Node ID)

## 🚀 Getting Started

### 1. Installation

Clone the repository or copy the component into your React project:

```bash
git clone
cd canvas-converter

npm intall
npm run dev





