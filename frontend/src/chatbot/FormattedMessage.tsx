import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ExternalLink, ArrowRight } from 'lucide-react';

interface FormattedMessageProps {
  content: string;
  onLinkClick?: () => void;
}

export const FormattedMessage: React.FC<FormattedMessageProps> = ({ content, onLinkClick }) => {
  const navigate = useNavigate();

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('/')) {
      e.preventDefault();
      navigate(href);
      if (onLinkClick) onLinkClick();
    }
  };

  // Render inline formatting (bold, italic, code, links)
  const renderInline = (text: string) => {
    // Regex matches markdown links: [label](url), bold: **bold**, italic: *italic*, code: `code`
    const regex = /(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
    const parts = text.split(regex);

    return parts.map((part, idx) => {
      if (!part) return null;

      // Link: [label](url)
      const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (linkMatch) {
        const [, label, href] = linkMatch;
        const isInternal = href.startsWith('/');
        return (
          <a
            key={idx}
            href={href}
            onClick={(e) => handleLinkClick(e, href)}
            target={isInternal ? undefined : '_blank'}
            rel={isInternal ? undefined : 'noopener noreferrer'}
            className="inline-flex items-center gap-1 font-semibold text-brand-700 hover:text-brand-900 underline underline-offset-2 hover:bg-brand-50/80 px-1 py-0.5 rounded transition"
          >
            {label}
            {isInternal ? <ArrowRight className="w-3 h-3 inline" /> : <ExternalLink className="w-3 h-3 inline" />}
          </a>
        );
      }

      // Bold: **text**
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={idx} className="font-bold text-charcoal-900">
            {part.slice(2, -2)}
          </strong>
        );
      }

      // Italic: *text*
      if (part.startsWith('*') && part.endsWith('*')) {
        return (
          <em key={idx} className="italic text-charcoal-800">
            {part.slice(1, -1)}
          </em>
        );
      }

      // Code: `code`
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={idx} className="bg-sand-100 text-brand-800 text-xs px-1.5 py-0.5 rounded font-mono border border-sand-300">
            {part.slice(1, -1)}
          </code>
        );
      }

      return part;
    });
  };

  // Process blocks (paragraphs, lists, headings)
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];

  let currentList: { type: 'ul' | 'ol'; items: React.ReactNode[] } | null = null;

  const flushList = () => {
    if (currentList) {
      if (currentList.type === 'ul') {
        elements.push(
          <ul key={`ul-${elements.length}`} className="my-2 space-y-1 pl-4 list-disc marker:text-brand-600 text-sm">
            {currentList.items.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        );
      } else {
        elements.push(
          <ol key={`ol-${elements.length}`} className="my-2 space-y-1 pl-4 list-decimal marker:text-brand-600 font-medium text-sm">
            {currentList.items.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ol>
        );
      }
      currentList = null;
    }
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    if (!trimmed) {
      flushList();
      elements.push(<div key={`blank-${index}`} className="h-1.5" />);
      return;
    }

    // Unordered list item: - or * or •
    const ulMatch = trimmed.match(/^[-*•]\s+(.*)$/);
    if (ulMatch) {
      if (!currentList || currentList.type !== 'ul') {
        flushList();
        currentList = { type: 'ul', items: [] };
      }
      currentList.items.push(renderInline(ulMatch[1]));
      return;
    }

    // Ordered list item: 1. or 2.
    const olMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
    if (olMatch) {
      if (!currentList || currentList.type !== 'ol') {
        flushList();
        currentList = { type: 'ol', items: [] };
      }
      currentList.items.push(renderInline(olMatch[2]));
      return;
    }

    // Any non-list line flushes open list
    flushList();

    // Headings
    if (trimmed.startsWith('### ')) {
      elements.push(
        <h4 key={`h4-${index}`} className="font-bold text-sm text-charcoal-900 mt-2 mb-1">
          {renderInline(trimmed.slice(4))}
        </h4>
      );
    } else if (trimmed.startsWith('## ')) {
      elements.push(
        <h3 key={`h3-${index}`} className="font-bold text-base text-charcoal-900 mt-2.5 mb-1">
          {renderInline(trimmed.slice(3))}
        </h3>
      );
    } else {
      elements.push(
        <p key={`p-${index}`} className="leading-relaxed text-sm my-1">
          {renderInline(trimmed)}
        </p>
      );
    }
  });

  flushList();

  return <div className="space-y-0.5 break-words">{elements}</div>;
};
