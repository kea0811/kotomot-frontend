import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  label?: string;
  error?: string;
  required?: boolean;
  name?: string;
}

interface PanelCoords {
  left: number;
  width: number;
  top?: number;
  bottom?: number;
  maxHeight: number;
}

export default function Select({
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  disabled = false,
  className = '',
  label,
  error,
  required = false,
  name,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [coords, setCoords] = useState<PanelCoords | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find(opt => opt.value === value);
  const filteredOptions = options.filter(opt =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Position the (portaled) panel relative to the trigger, flipping up if needed.
  const updatePosition = () => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;
    const margin = 8;
    const spaceBelow = window.innerHeight - rect.bottom - margin;
    const spaceAbove = rect.top - margin;
    const openUp = spaceBelow < 240 && spaceAbove > spaceBelow;
    setCoords({
      left: rect.left,
      width: rect.width,
      top: openUp ? undefined : rect.bottom + 4,
      bottom: openUp ? window.innerHeight - rect.top + 4 : undefined,
      maxHeight: Math.min(320, Math.max(160, openUp ? spaceAbove : spaceBelow)),
    });
  };

  useLayoutEffect(() => {
    if (!isOpen) return;
    updatePosition();
    const onScrollOrResize = () => updatePosition();
    // capture=true so scrolling any ancestor (e.g. a modal body) repositions it
    window.addEventListener('scroll', onScrollOrResize, true);
    window.addEventListener('resize', onScrollOrResize);
    return () => {
      window.removeEventListener('scroll', onScrollOrResize, true);
      window.removeEventListener('resize', onScrollOrResize);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        dropdownRef.current && !dropdownRef.current.contains(target) &&
        panelRef.current && !panelRef.current.contains(target)
      ) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isOpen) {
      e.preventDefault();
      setIsOpen(true);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium text-foreground mb-1">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}

      <button
        ref={buttonRef}
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={cn(
          'w-full h-10 px-3 text-left text-sm bg-background text-foreground border rounded-lg shadow-xs',
          'flex items-center justify-between',
          'transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-brand/30',
          disabled
            ? 'opacity-50 cursor-not-allowed border-border'
            : isOpen
            ? 'border-brand ring-2 ring-brand/30'
            : 'border-input hover:border-brand/40',
          error && 'border-destructive',
          className
        )}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-labelledby={label}
        name={name}
      >
        <span className={cn(
          'truncate',
          !selectedOption && 'text-muted-foreground'
        )}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={cn(
            'w-4 h-4 ml-2 transition-transform duration-200 text-muted-foreground',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {error && (
        <p className="mt-1 text-sm text-destructive">{error}</p>
      )}

      {isOpen && coords && createPortal(
        <div
          ref={panelRef}
          style={{
            position: 'fixed',
            left: coords.left,
            width: coords.width,
            top: coords.top,
            bottom: coords.bottom,
            maxHeight: coords.maxHeight,
            zIndex: 9999,
          }}
          className={cn(
            'flex flex-col',
            'bg-popover',
            'border border-border',
            'rounded-lg shadow-lg',
            'animate-in fade-in-0 zoom-in-95'
          )}
        >
          {options.length > 5 && (
            <div className="p-2 border-b border-border shrink-0">
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                className={cn(
                  'w-full px-3 py-1.5 text-sm',
                  'bg-background text-foreground',
                  'border border-input',
                  'rounded-md',
                  'focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/30',
                  'placeholder:text-muted-foreground'
                )}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}

          <div className="flex-1 overflow-y-auto py-1">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                No options found
              </div>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => !option.disabled && handleSelect(option.value)}
                  disabled={option.disabled}
                  className={cn(
                    'w-full px-3 py-2 text-left text-sm',
                    'flex items-center justify-between',
                    'transition-colors duration-150',
                    option.disabled
                      ? 'opacity-50 cursor-not-allowed text-muted-foreground'
                      : option.value === value
                      ? 'bg-brand/10 text-brand font-medium'
                      : 'hover:bg-accent text-popover-foreground'
                  )}
                  role="option"
                  aria-selected={option.value === value}
                >
                  <span className="truncate">{option.label}</span>
                  {option.value === value && (
                    <Check className="w-4 h-4 ml-2 flex-shrink-0 text-brand" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
