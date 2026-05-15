# Associate Registration Portal

A full-featured multi-step associate registration system built with React + Vite + Tailwind CSS.

## Tech Stack
- **React 18** + **Vite**
- **Tailwind CSS v3**
- **React Router DOM** — client-side routing
- **React Hook Form** + **Zod** — form handling & validation
- **Lucide React** — icons
- **React Hot Toast** — notifications

## Project Structure
```
src/
├── components/
│   ├── layout/        Navbar, Footer, Stepper
│   ├── forms/         PersonalDetails, ProfessionalDetails, DocumentUpload,
│   │                  BankDetails, ReferralDetails, Declaration, ReviewSubmit
│   └── ui/            InputField, SelectField, FileUpload, Loader
├── pages/             Home, RegisterAssociate, Success, Report, NotFound
├── routes/            AppRoutes.jsx
├── services/          associateApi.js  (replace with real API)
└── utils/             validations.js, constants.js, localStorage.js
```

## Features
- ✅ 7-step multi-step form with animated stepper
- ✅ Real-time Zod validation (Aadhaar 12 digits, PAN format, IFSC, mobile 10 digits)
- ✅ File upload with image preview and remove option
- ✅ Auto-save draft to localStorage on every step change
- ✅ Restore draft on page reload (with toast prompt)
- ✅ Mobile responsive (phone / tablet / desktop)
- ✅ Edit any completed step from Review screen
- ✅ Printable registration report
- ✅ Success page with shareable Associate ID

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

## Connecting to a Real API
Edit `src/services/associateApi.js` and replace the mock with your actual endpoint:

```js
export const submitAssociate = async (data) => {
  const res = await fetch('https://your-api.com/associates', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
};
```

For file uploads use `FormData` in `src/services/uploadApi.js`.
