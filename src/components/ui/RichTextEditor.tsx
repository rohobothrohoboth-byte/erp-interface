import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ListItem from '@tiptap/extension-list-item';
import Placeholder from '@tiptap/extension-placeholder';
import { Bold, Italic, List, ListOrdered } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  disabled?: boolean;
  minHeight?: string;
}

const ToolbarBtn = ({
  onClick, active, title, children,
}: {
  onClick: () => void; active?: boolean; title: string; children: React.ReactNode;
}) => (
  <button
    type="button"
    title={title}
    onMouseDown={(e) => { e.preventDefault(); onClick(); }}
    className={`p-1.5 rounded transition-colors cursor-pointer ${
      active
        ? 'bg-green-100 text-green-700'
        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
    }`}
  >
    {children}
  </button>
);

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value, onChange, placeholder = 'Start typing...', disabled = false, minHeight = '100px',
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ bulletList: false, orderedList: false, listItem: false }),
      BulletList,
      OrderedList,
      ListItem,
      Placeholder.configure({ placeholder }),
    ],
    content: value || '',
    editable: !disabled,
    onUpdate: ({ editor }) => {
      // Strip to plain text when content is just whitespace/empty
      const html = editor.isEmpty ? '' : editor.getHTML();
      onChange(html);
    },
  });

  if (!editor) return null;

  return (
    <div className={`border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-green-500 focus-within:border-transparent transition-all ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-gray-200 bg-gray-50">
        <ToolbarBtn title="Bold" onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')}>
          <Bold size={14} />
        </ToolbarBtn>
        <ToolbarBtn title="Italic" onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')}>
          <Italic size={14} />
        </ToolbarBtn>
        <div className="w-px h-4 bg-gray-300 mx-1" />
        <ToolbarBtn title="Bullet list" onClick={() => editor.chain().focus().toggleList('bulletList', 'listItem').run()} active={editor.isActive('bulletList')}>
          <List size={14} />
        </ToolbarBtn>
        <ToolbarBtn title="Numbered list" onClick={() => editor.chain().focus().toggleList('orderedList', 'listItem').run()} active={editor.isActive('orderedList')}>
          <ListOrdered size={14} />
        </ToolbarBtn>
      </div>

      {/* Editor area */}
      <EditorContent
        editor={editor}
        style={{ minHeight }}
        className="prose prose-sm max-w-none px-3 py-2 text-sm text-gray-800 focus:outline-none [&_.tiptap]:outline-none [&_.tiptap]:min-h-[inherit] [&_.tiptap_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.tiptap_p.is-editor-empty:first-child::before]:text-gray-400 [&_.tiptap_p.is-editor-empty:first-child::before]:float-left [&_.tiptap_p.is-editor-empty:first-child::before]:pointer-events-none [&_.tiptap_ul]:list-disc [&_.tiptap_ul]:pl-5 [&_.tiptap_ol]:list-decimal [&_.tiptap_ol]:pl-5"
      />
    </div>
  );
};

// Helper: strip HTML tags to plain text for backend submission
export const htmlToPlainText = (html: string): string => {
  if (!html) return '';
  return html
    .replace(/<li>/gi, '\n• ')
    .replace(/<\/li>/gi, '')
    .replace(/<ol[^>]*>/gi, '')
    .replace(/<\/ol>/gi, '')
    .replace(/<ul[^>]*>/gi, '')
    .replace(/<\/ul>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<p>/gi, '')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

export default RichTextEditor;
