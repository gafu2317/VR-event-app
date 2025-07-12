// src/components/Footer.tsx

import React from 'react';

/**
 * アプリケーションのフッターコンポーネントです。
 * 著作権情報や簡単なメッセージを含みます。
 */
const Footer: React.FC = () => {
  return (
    // mt-8 を削除しました。
    <footer className="bg-gray-800 text-gray-400 p-4 shadow-inner rounded-t-lg">
      <div className="container mx-auto text-center">
        <p>&copy; {new Date().getFullYear()} イベント予約システム. All rights reserved.</p>
        <p className="text-sm mt-1">シンプル予約管理</p>
      </div>
    </footer>
  );
};

export default Footer;
