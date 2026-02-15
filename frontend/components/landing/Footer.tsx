import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-brownDark to-brownDarker text-white py-10 px-[5%] text-center border-t-4 border-primaryYellow">
      <div className="max-w-7xl mx-auto">
        <p className="font-heading text-xl text-primaryYellow mb-4">
          🥭 100% Pure & Fresh Management Solutions
        </p>
        <p className="text-sm">
          &copy; {new Date().getFullYear()} Machi Mango. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
