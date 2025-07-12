// src/components/Header.tsx
import React from 'react';
import Link from 'next/link';

/**
 * アプリケーションのヘッダーコンポーネントです。
 * WakKnotのロゴを表示します。
 * モダンでグラデーションを活かしたダークテーマのデザインです。
 */
const Header: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-gradient-to-r from-indigo-900/90 via-purple-800/90 to-indigo-900/90 backdrop-blur-sm shadow-lg border-b border-white/20">
      <div className="container mx-auto flex justify-start items-center p-4">
        {/* ロゴ */}
        <Link href="/" className="text-2xl font-bold text-white hover:opacity-80 transition-opacity duration-300">
          WakKnot
          <span className="text-sm font-normal text-gray-300 ml-2 tracking-wider">
            VR Event
          </span>
        </Link>
      </div>
    </header>
  );
};
export default Header;
