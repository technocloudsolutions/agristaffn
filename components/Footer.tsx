export default function Footer() {
  return (
    <footer className="w-full border-t border-gray-200 dark:border-gray-800 py-4 px-4">
      <div className="container mx-auto text-center text-sm text-gray-600 dark:text-gray-400">
        <p>© {new Date().getFullYear()} Department of Agriculture, Sri Lanka. All rights reserved.</p>
        <p className="mt-1">Developed by Television and Farmers Broadcasting Service</p>
        <p className="mt-1 text-xs">Version 1.0.0</p>
      </div>
    </footer>
  );
} 