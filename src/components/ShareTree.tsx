'use client';

import { useState } from 'react';
import { Tree } from '@/types';

interface ShareTreeProps {
  tree: Tree;
  onClose: () => void;
}

export default function ShareTree({ tree, onClose }: ShareTreeProps) {
  const [copied, setCopied] = useState(false);

  const shareUrl = `${window.location.origin}/tree/${tree.id}`;
  const shareText = `Check out my tree "${tree.name}" on LeafyBuddy! 🌳 ${tree.species ? `It's a ${tree.species} ` : ''}planted on ${new Date(tree.planted_date).toLocaleDateString()}.`;

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const shareViaWebShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${tree.name} - LeafyBuddy`,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    }
  };

  const shareOnSocial = (platform: string) => {
    const encodedText = encodeURIComponent(shareText);
    const encodedUrl = encodeURIComponent(shareUrl);
    
    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
      telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
    };

    window.open(urls[platform as keyof typeof urls], '_blank', 'width=600,height=400');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">🔗 Share Tree</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Tree Preview */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-3">
            <img
              src={tree.image_url}
              alt={tree.name}
              className="w-16 h-16 object-cover rounded-lg"
            />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800">{tree.name}</h3>
              {tree.species && <p className="text-sm text-green-600">{tree.species}</p>}
              <p className="text-xs text-gray-500">
                📅 {new Date(tree.planted_date).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Share URL */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Share Link</label>
          <div className="flex">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="flex-1 p-2 border border-gray-300 rounded-l-lg bg-gray-50 text-sm"
            />
            <button
              onClick={() => copyToClipboard(shareUrl)}
              className={`px-4 py-2 rounded-r-lg text-sm font-medium transition-colors ${
                copied
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {copied ? '✓' : '📋'}
            </button>
          </div>
        </div>

        {/* Native Share (if available) */}
        {navigator.share && (
          <button
            onClick={shareViaWebShare}
            className="w-full mb-4 p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            📱 Share via Device
          </button>
        )}

        {/* Social Media Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => shareOnSocial('twitter')}
            className="flex items-center justify-center space-x-2 p-3 bg-blue-400 text-white rounded-lg hover:bg-blue-500 transition-colors"
          >
            <span>🐦</span>
            <span>Twitter</span>
          </button>
          <button
            onClick={() => shareOnSocial('facebook')}
            className="flex items-center justify-center space-x-2 p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <span>📘</span>
            <span>Facebook</span>
          </button>
          <button
            onClick={() => shareOnSocial('whatsapp')}
            className="flex items-center justify-center space-x-2 p-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            <span>💬</span>
            <span>WhatsApp</span>
          </button>
          <button
            onClick={() => shareOnSocial('telegram')}
            className="flex items-center justify-center space-x-2 p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <span>✈️</span>
            <span>Telegram</span>
          </button>
        </div>

        {/* Share Text */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Share Message</label>
          <div className="flex">
            <textarea
              value={shareText}
              readOnly
              className="flex-1 p-2 border border-gray-300 rounded-l-lg bg-gray-50 text-sm resize-none"
              rows={3}
            />
            <button
              onClick={() => copyToClipboard(shareText)}
              className={`px-4 py-2 rounded-r-lg text-sm font-medium transition-colors self-start ${
                copied
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {copied ? '✓' : '📋'}
            </button>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full p-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
        >
          Close
        </button>
      </div>
    </div>
  );
}