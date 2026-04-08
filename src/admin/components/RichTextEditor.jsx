import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Image } from '@tiptap/extension-image';
import { Link } from '@tiptap/extension-link';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { Placeholder } from '@tiptap/extension-placeholder';
import { TextAlign } from '@tiptap/extension-text-align';
import { Underline } from '@tiptap/extension-underline';
import { CharacterCount } from '@tiptap/extension-character-count';
import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Minus,
  Undo,
  Redo,
  Link as LinkIcon,
  Unlink,
  Image as ImageIcon,
  Table as TableIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  X,
  Plus,
  Trash2,
  Upload,
  Maximize2,
} from 'lucide-react';
import './RichTextEditor.css';

const BLOG_IMAGE_BUCKET = import.meta.env.VITE_SUPABASE_MEDIA_BUCKET || 'media';

// Custom Image extension with better selection support
const CustomImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: '400px',
        parseHTML: element => element.getAttribute('width') || element.style.width || '400px',
        renderHTML: attributes => {
          if (!attributes.width) return {};
          return { width: attributes.width, style: `width: ${attributes.width}` };
        },
      },
      height: {
        default: 'auto',
        parseHTML: element => element.getAttribute('height') || element.style.height || 'auto',
        renderHTML: attributes => {
          if (!attributes.height || attributes.height === 'auto') return {};
          return { height: attributes.height };
        },
      },
    };
  },
});

function MenuButton({ onClick, active, disabled, title, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`editor-menu-btn ${active ? 'active' : ''} ${disabled ? 'disabled' : ''}`}
      disabled={disabled}
      title={title}
    >
      {children}
    </button>
  );
}

function MenuDivider() {
  return <div className="editor-menu-divider" />;
}

function EditorMenuBar({ editor, onImageUpload, selectedImage, onSelectImage }) {
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [showImageSizeModal, setShowImageSizeModal] = useState(false);
  const [imageWidth, setImageWidth] = useState('');
  const linkInputRef = useRef(null);

  const handleSetLink = useCallback(() => {
    if (!linkUrl) {
      editor.chain().focus().unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run();
    }
    setShowLinkInput(false);
    setLinkUrl('');
  }, [editor, linkUrl]);

  const handleSetImageWidth = useCallback(() => {
    if (imageWidth) {
      editor.chain().focus().updateAttributes('image', { width: imageWidth }).run();
    }
    setShowImageSizeModal(false);
    setImageWidth('');
  }, [editor, imageWidth]);

  const openLinkInput = () => {
    const previousUrl = editor.getAttributes('link').href || '';
    setLinkUrl(previousUrl);
    setShowLinkInput(true);
    setTimeout(() => linkInputRef.current?.focus(), 50);
  };

  if (!editor) return null;

  return (
    <div className="editor-menu-bar">
      <div className="editor-menu-group">
        <MenuButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          title="Bold (Ctrl+B)"
        >
          <Bold size={16} />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          title="Italic (Ctrl+I)"
        >
          <Italic size={16} />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive('underline')}
          title="Underline (Ctrl+U)"
        >
          <UnderlineIcon size={16} />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive('strike')}
          title="Strikethrough"
        >
          <Strikethrough size={16} />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          active={editor.isActive('code')}
          title="Inline Code"
        >
          <Code size={16} />
        </MenuButton>
      </div>

      <MenuDivider />

      <div className="editor-menu-group">
        <MenuButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          active={editor.isActive('heading', { level: 1 })}
          title="Heading 1"
        >
          <Heading1 size={16} />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive('heading', { level: 2 })}
          title="Heading 2"
        >
          <Heading2 size={16} />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive('heading', { level: 3 })}
          title="Heading 3"
        >
          <Heading3 size={16} />
        </MenuButton>
      </div>

      <MenuDivider />

      <div className="editor-menu-group">
        <MenuButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
          title="Bullet List"
        >
          <List size={16} />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
          title="Numbered List"
        >
          <ListOrdered size={16} />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive('blockquote')}
          title="Quote"
        >
          <Quote size={16} />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Horizontal Rule"
        >
          <Minus size={16} />
        </MenuButton>
      </div>

      <MenuDivider />

      <div className="editor-menu-group">
        <MenuButton
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          active={editor.isActive({ textAlign: 'left' })}
          title="Align Left"
        >
          <AlignLeft size={16} />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          active={editor.isActive({ textAlign: 'center' })}
          title="Align Center"
        >
          <AlignCenter size={16} />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          active={editor.isActive({ textAlign: 'right' })}
          title="Align Right"
        >
          <AlignRight size={16} />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          active={editor.isActive({ textAlign: 'justify' })}
          title="Justify"
        >
          <AlignJustify size={16} />
        </MenuButton>
      </div>

      <MenuDivider />

      <div className="editor-menu-group">
        {showLinkInput ? (
          <div className="editor-link-input-wrapper">
            <input
              ref={linkInputRef}
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="Enter URL..."
              className="editor-link-input"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSetLink();
                }
                if (e.key === 'Escape') {
                  setShowLinkInput(false);
                  setLinkUrl('');
                }
              }}
            />
            <button type="button" className="editor-link-btn" onClick={handleSetLink} title="Apply Link">
              <Plus size={14} />
            </button>
            <button
              type="button"
              className="editor-link-btn cancel"
              onClick={() => {
                setShowLinkInput(false);
                setLinkUrl('');
              }}
              title="Cancel"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <>
            <MenuButton onClick={openLinkInput} active={editor.isActive('link')} title="Add Link">
              <LinkIcon size={16} />
            </MenuButton>
            <MenuButton
              onClick={() => editor.chain().focus().unsetLink().run()}
              disabled={!editor.isActive('link')}
              title="Remove Link"
            >
              <Unlink size={16} />
            </MenuButton>
          </>
        )}
      </div>

      <MenuDivider />

      <div className="editor-menu-group">
        <MenuButton onClick={onImageUpload} title="Insert Image">
          <ImageIcon size={16} />
        </MenuButton>
        <MenuButton
          onClick={() =>
            editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
          }
          title="Insert Table"
        >
          <TableIcon size={16} />
        </MenuButton>
      </div>

      {(editor.isActive('image') || selectedImage) && (
        <>
          <MenuDivider />
          <div className="editor-menu-group image-controls">
            <span style={{ fontSize: '11px', color: '#6b7280', marginRight: 4 }}>Size:</span>
            <MenuButton
              onClick={() => editor.chain().focus().updateAttributes('image', { width: '250px' }).run()}
              title="Small (250px)"
            >
              S
            </MenuButton>
            <MenuButton
              onClick={() => editor.chain().focus().updateAttributes('image', { width: '400px' }).run()}
              title="Default (400px)"
            >
              M
            </MenuButton>
            <MenuButton
              onClick={() => editor.chain().focus().updateAttributes('image', { width: '600px' }).run()}
              title="Large (600px)"
            >
              L
            </MenuButton>
            <MenuButton
              onClick={() => editor.chain().focus().updateAttributes('image', { width: '100%' }).run()}
              title="Full Width"
            >
              <Maximize2 size={14} />
            </MenuButton>
            <MenuButton
              onClick={() => setShowImageSizeModal(true)}
              title="Custom Size"
            >
              ⚙
            </MenuButton>
          </div>
        </>
      )}

      {showImageSizeModal && (
        <div className="editor-modal-overlay">
          <div className="editor-modal">
            <h3>Set Image Width</h3>
            <input
              type="text"
              value={imageWidth}
              onChange={(e) => setImageWidth(e.target.value)}
              placeholder="e.g., 400px, 50%, 100%"
              className="editor-modal-input"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSetImageWidth();
                }
                if (e.key === 'Escape') {
                  setShowImageSizeModal(false);
                }
              }}
              autoFocus
            />
            <div className="editor-modal-buttons">
              <button onClick={handleSetImageWidth} className="editor-modal-btn editor-modal-btn--primary">
                Apply
              </button>
              <button onClick={() => setShowImageSizeModal(false)} className="editor-modal-btn editor-modal-btn--secondary">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {editor.isActive('table') && (
        <>
          <MenuDivider />
          <div className="editor-menu-group table-controls">
            <MenuButton
              onClick={() => editor.chain().focus().addColumnBefore().run()}
              title="Add Column Before"
            >
              +Col←
            </MenuButton>
            <MenuButton
              onClick={() => editor.chain().focus().addColumnAfter().run()}
              title="Add Column After"
            >
              +Col→
            </MenuButton>
            <MenuButton
              onClick={() => editor.chain().focus().deleteColumn().run()}
              title="Delete Column"
            >
              -Col
            </MenuButton>
            <MenuButton
              onClick={() => editor.chain().focus().addRowBefore().run()}
              title="Add Row Before"
            >
              +Row↑
            </MenuButton>
            <MenuButton
              onClick={() => editor.chain().focus().addRowAfter().run()}
              title="Add Row After"
            >
              +Row↓
            </MenuButton>
            <MenuButton onClick={() => editor.chain().focus().deleteRow().run()} title="Delete Row">
              -Row
            </MenuButton>
            <MenuButton
              onClick={() => editor.chain().focus().deleteTable().run()}
              title="Delete Table"
            >
              <Trash2 size={14} />
            </MenuButton>
          </div>
        </>
      )}

      <MenuDivider />

      <div className="editor-menu-group">
        <MenuButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo (Ctrl+Z)"
        >
          <Undo size={16} />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo (Ctrl+Y)"
        >
          <Redo size={16} />
        </MenuButton>
      </div>
    </div>
  );
}

export default function RichTextEditor({ value, onChange, placeholder = 'Start writing your blog post...', slug = '' }) {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          rel: 'noopener noreferrer',
          target: '_blank',
        },
      }),
      CustomImage.configure({
        HTMLAttributes: {
          class: 'blog-content-image',
        },
        allowBase64: true,
        inline: false,
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'blog-content-table',
        },
      }),
      TableRow,
      TableCell,
      TableHeader,
      TextAlign.configure({
        types: ['heading', 'paragraph', 'image'],
      }),
      Placeholder.configure({
        placeholder,
      }),
      CharacterCount,
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html === '<p></p>' ? '' : html);
    },
    onSelectionUpdate: ({ editor }) => {
      // Check if an image is selected
      const isImage = editor.isActive('image');
      setSelectedImage(isImage);
    },
    editorProps: {
      attributes: {
        class: 'rich-text-editor-content',
      },
      handleClick: (view, pos, event) => {
        // Check if clicked on an image
        const node = view.state.doc.nodeAt(pos);
        if (node && node.type.name === 'image') {
          setSelectedImage(true);
          return false;
        }
        // Also check if the target is an img element
        if (event.target && event.target.tagName === 'IMG') {
          setSelectedImage(true);
          // Find and select the image node
          const { state } = view;
          const { doc } = state;
          let imagePos = null;
          doc.descendants((n, p) => {
            if (n.type.name === 'image') {
              const dom = view.nodeDOM(p);
              if (dom === event.target || (dom && dom.contains && dom.contains(event.target))) {
                imagePos = p;
                return false;
              }
            }
          });
          if (imagePos !== null) {
            const tr = state.tr.setSelection(
              view.state.selection.constructor.near(state.doc.resolve(imagePos))
            );
            view.dispatch(tr);
          }
          return true;
        }
        setSelectedImage(false);
        return false;
      },
    },
  });

  // Sync external value changes
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '');
    }
  }, [value, editor]);

  const handleImageUpload = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const processImageUpload = useCallback(
    async (event) => {
      const file = event.target.files?.[0];
      if (!file) return;

      // Only allow webp
      if (!file.type.includes('webp')) {
        alert('Only .webp images are allowed');
        event.target.value = '';
        return;
      }

      setUploading(true);

      try {
        const fileExt = 'webp';
        const baseName = file.name.replace(/\.[^.]+$/, '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const slugPart = slug || 'blog';
        const filePath = `blogs/${slugPart}-${Date.now()}-${baseName}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from(BLOG_IMAGE_BUCKET)
          .upload(filePath, file, {
            cacheControl: '31536000',
            upsert: false,
          });

        if (uploadError) throw uploadError;

        const { data: publicData } = supabase.storage.from(BLOG_IMAGE_BUCKET).getPublicUrl(filePath);

        if (!publicData?.publicUrl) {
          throw new Error('Upload succeeded but URL could not be generated');
        }

        // Insert image with default 400px width and center alignment
        editor?.chain()
          .focus()
          .setImage({ 
            src: publicData.publicUrl, 
            alt: baseName,
            width: '400px'
          })
          .setTextAlign('center')
          .run();
      } catch (error) {
        alert('Image upload failed: ' + error.message);
      } finally {
        setUploading(false);
        event.target.value = '';
      }
    },
    [editor, slug]
  );

  return (
    <div className="rich-text-editor-wrapper">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/webp"
        style={{ display: 'none' }}
        onChange={processImageUpload}
      />

      <EditorMenuBar editor={editor} onImageUpload={handleImageUpload} selectedImage={selectedImage} />

      {uploading && (
        <div className="editor-upload-indicator">
          <Upload size={16} className="spin" /> Uploading image...
        </div>
      )}

      <EditorContent editor={editor} />

      <div className="editor-footer">
        <span className="editor-word-count">
          {editor?.storage.characterCount?.words?.() || 0} words •{' '}
          {editor?.storage.characterCount?.characters?.() || 0} characters
        </span>
      </div>
    </div>
  );
}
