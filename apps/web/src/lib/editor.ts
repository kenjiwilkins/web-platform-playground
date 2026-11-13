import { EditorView, basicSetup } from 'codemirror';
import { EditorState, type Extension } from '@codemirror/state';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { javascript } from '@codemirror/lang-javascript';
import { tags as t } from '@lezer/highlight';

export type FileKind = 'html' | 'css' | 'js';

const languages: Record<FileKind, () => Extension> = { html, css, js: javascript };

/** デザインシステムの CSS 変数をそのまま参照するので、テーマ切り替えに自動で追従する */
const theme = EditorView.theme({
  '&': {
    height: '100%',
    backgroundColor: 'var(--editor-bg)',
    color: 'var(--syn-text)',
    fontSize: 'var(--code-size)',
  },
  '.cm-scroller': { fontFamily: 'var(--font-mono)', lineHeight: 'var(--code-line)' },
  '.cm-content': { caretColor: 'var(--editor-cursor)' },
  '.cm-cursor, .cm-dropCursor': { borderLeftColor: 'var(--editor-cursor)' },
  '.cm-gutters': {
    backgroundColor: 'var(--editor-gutter)',
    color: 'var(--text-subtle)',
    border: 'none',
  },
  '.cm-activeLine': { backgroundColor: 'var(--editor-line-active)' },
  '.cm-activeLineGutter': { backgroundColor: 'var(--editor-line-active)' },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, ::selection': {
    backgroundColor: 'var(--editor-selection) !important',
  },
});

const highlight = HighlightStyle.define([
  { tag: [t.keyword, t.controlKeyword, t.modifier], color: 'var(--syn-keyword)' },
  { tag: [t.string, t.special(t.string)], color: 'var(--syn-string)' },
  { tag: [t.number, t.bool, t.unit, t.color], color: 'var(--syn-number)' },
  { tag: t.comment, color: 'var(--syn-comment)', fontStyle: 'italic' },
  { tag: [t.tagName, t.className], color: 'var(--syn-tag)' },
  { tag: t.attributeName, color: 'var(--syn-attr)' },
  { tag: t.propertyName, color: 'var(--syn-property)' },
  { tag: t.function(t.variableName), color: 'var(--syn-function)' },
  { tag: [t.variableName, t.special(t.variableName), t.self], color: 'var(--syn-variable)' },
  { tag: [t.punctuation, t.operator, t.bracket], color: 'var(--syn-punct)' },
]);

export function createEditorState(doc: string, kind: FileKind, onChange: () => void) {
  return EditorState.create({
    doc,
    extensions: [
      basicSetup,
      languages[kind](),
      theme,
      syntaxHighlighting(highlight),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) onChange();
      }),
    ],
  });
}

export { EditorView };
