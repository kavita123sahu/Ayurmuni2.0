import { Copy, Facebook, Mail, MessageCircle, Send, Share2 } from 'lucide-react';
import { showSuccessToast } from '../config/key';
import {
  copyToClipboard,
  getEmailShareUrl,
  getFacebookShareUrl,
  getTelegramShareUrl,
  getTwitterShareUrl,
  getWhatsAppShareUrl,
  shareContent,
} from '../utils/shareUtils';
import { Modal } from './ui';
import '../design/components/share-modal.css';

export default function ShareModal({ open, onClose, title, text, url }) {
  const shareUrl = url || window.location.href;

  const handleNativeShare = async () => {
    const result = await shareContent({ title, text, url: shareUrl });
    if (result.success && result.method === 'native') {
      showSuccessToast('Shared successfully!', 'success');
      onClose();
    }
  };

  const handleCopyLink = async () => {
    try {
      await copyToClipboard(shareUrl);
      showSuccessToast('Link copied to clipboard!', 'success');
      onClose();
    } catch (error) {
      showSuccessToast('Could not copy link', 'error');
    }
  };

  const handleSocialShare = (getUrl) => {
    try {
      window.open(getUrl(), '_blank', 'noopener,noreferrer');
      onClose();
    } catch (error) {
      showSuccessToast('Could not open share window', 'error');
    }
  };

  const shareOptions = [
    {
      id: 'native',
      label: 'Share',
      icon: <Share2 size={24} />,
      color: '#0D614E',
      onClick: handleNativeShare,
      show: typeof navigator !== 'undefined' && navigator.share,
    },
    {
      id: 'copy',
      label: 'Copy Link',
      icon: <Copy size={24} />,
      color: '#6B7280',
      onClick: handleCopyLink,
      show: true,
    },
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      icon: <MessageCircle size={24} />,
      color: '#25D366',
      onClick: () => handleSocialShare(() => getWhatsAppShareUrl(text || title, shareUrl)),
      show: true,
    },
    {
      id: 'facebook',
      label: 'Facebook',
      icon: <Facebook size={24} />,
      color: '#1877F2',
      onClick: () => handleSocialShare(() => getFacebookShareUrl(shareUrl)),
      show: true,
    },
    {
      id: 'twitter',
      label: 'Twitter',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
      color: '#000000',
      onClick: () => handleSocialShare(() => getTwitterShareUrl(text || title, shareUrl)),
      show: true,
    },
    {
      id: 'telegram',
      label: 'Telegram',
      icon: <Send size={24} />,
      color: '#0088cc',
      onClick: () => handleSocialShare(() => getTelegramShareUrl(text || title, shareUrl)),
      show: true,
    },
    {
      id: 'email',
      label: 'Email',
      icon: <Mail size={24} />,
      color: '#EA4335',
      onClick: () => handleSocialShare(() => getEmailShareUrl(title, `${text}\n\n${shareUrl}`)),
      show: true,
    },
  ];

  const visibleOptions = shareOptions.filter((opt) => opt.show);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Share"
      className="share-modal"
    >
      <div className="share-modal-content">
        {title && <p className="share-modal-title">{title}</p>}
        {text && <p className="share-modal-text">{text}</p>}
        
        <div className="share-modal-url">
          <input
            type="text"
            value={shareUrl}
            readOnly
            className="share-modal-url-input"
          />
          <button
            type="button"
            onClick={handleCopyLink}
            className="share-modal-url-copy"
            aria-label="Copy"
          >
            <Copy size={18} />
          </button>
        </div>

        <div className="share-modal-options">
          {visibleOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={option.onClick}
              className="share-modal-option"
              style={{ '--share-color': option.color }}
            >
              <span className="share-modal-option-icon" style={{ color: option.color }}>
                {option.icon}
              </span>
              <span className="share-modal-option-label">{option.label}</span>
            </button>
          ))}
        </div>
      </div>
    </Modal>
  );
}
