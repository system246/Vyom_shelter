export default function Footer() {
  return (
    <footer className="bg-[#1a3a5c] text-blue-200 text-center py-4 mt-auto text-xs">
      <p>&copy; {new Date().getFullYear()} Associate Portal &mdash; All rights reserved.</p>
      <p className="mt-0.5 text-blue-300/60">Secure &bull; Reliable &bull; Compliant</p>
    </footer>
  );
}
