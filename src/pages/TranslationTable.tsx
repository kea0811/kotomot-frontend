import { useState, useRef, useEffect } from 'react';
import { Check, X, Sparkles, Trash2 } from 'lucide-react';

interface TranslationTableProps {
  keys: any[];
  enabledLanguages: any[];
  selectedProject: string;
  collapsedNamespaces: Set<string>;
  toggleNamespace: (namespace: string) => void;
  editingCell: any;
  editValue: string;
  setEditValue: (value: string) => void;
  handleEditClick: (keyId: string, language: string, currentValue: string) => void;
  handleSaveEdit: (...args: any[]) => void;
  handleCancelEdit: () => void;
  updatingTranslation: boolean;
  getCompletionColor: (completion: number) => string;
  getCompletionBg: (completion: number) => string;
  handleGetAISuggestions: (...args: any[]) => void;
  aiSuggestions: any;
  showSuggestions: boolean;
  handleSelectSuggestion: (suggestion: string) => void;
  setShowSuggestions: (show: boolean) => void;
  gettingAISuggestion: boolean;
  handleDeleteKey: (...args: any[]) => void;
  hasAIAccess: boolean;
}

export default function TranslationTable(props: TranslationTableProps) {
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (props.editingCell && inputRef.current) {
      inputRef.current.focus();
    }
  }, [props.editingCell]);

  const isEditing = (keyId: string, langCode: string) =>
    props.editingCell === `${keyId}-${langCode}`;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 px-4 font-medium text-muted-foreground min-w-[200px]">Key</th>
            {props.enabledLanguages.map((lang: any) => (
              <th key={lang.code || lang._id} className="text-left py-3 px-4 font-medium text-muted-foreground min-w-[150px]">
                {lang.name || lang.code}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {props.keys.map((key: any) => (
            <tr key={key._id || key.id} className="border-b border-border hover:bg-accent/50">
              <td className="py-3 px-4 font-mono text-xs text-foreground">{key.key}</td>
              {props.enabledLanguages.map((lang: any) => {
                const langCode = lang.code;
                const value = key.translations?.[langCode] || '';
                const editing = isEditing(key.id || key._id, langCode);

                return (
                  <td key={langCode} className="py-1 px-2">
                    {editing ? (
                      <div className="flex flex-col gap-1">
                        <textarea
                          ref={inputRef}
                          value={props.editValue}
                          onChange={(e) => props.setEditValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              props.handleSaveEdit(key.id || key._id, langCode);
                            }
                            if (e.key === 'Escape') {
                              props.handleCancelEdit();
                            }
                          }}
                          className="w-full px-2 py-1.5 text-sm bg-card border-2 border-indigo-500 rounded-md focus:outline-none resize-none text-foreground"
                          rows={2}
                          disabled={props.updatingTranslation}
                        />
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => props.handleSaveEdit(key.id || key._id, langCode)}
                            disabled={props.updatingTranslation}
                            className="p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded"
                            title="Save (Enter)"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={props.handleCancelEdit}
                            className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                            title="Cancel (Esc)"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => props.handleEditClick(key.id || key._id, langCode, value)}
                        className="cursor-pointer px-2 py-1.5 rounded-md hover:bg-accent min-h-[32px] flex items-center text-foreground"
                        title="Click to edit"
                      >
                        {value || <span className="text-gray-400 dark:text-gray-600">-</span>}
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
