import { useThemeMode, useThemeMounted } from '@/contexts/ThemeContext';
import { Sun, Moon, Monitor, Check } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
  // Show as a dropdown menu
  showDropdown?: boolean;
  // Custom class names
  className?: string;
  // Icon size
  iconSize?: number;
  // Show label
  showLabel?: boolean;
}

export function ThemeToggle({
  showDropdown = false,
  className = '',
  iconSize = 20,
  showLabel = false
}: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useThemeMode();
  const mounted = useThemeMounted();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!showDropdown) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown]);

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className={`inline-flex items-center justify-center p-2 rounded-lg ${className}`}>
        <div className="w-5 h-5" />
      </div>
    );
  }

  const Icon = resolvedTheme === 'dark' ? Moon : Sun;

  const themes = [
    { value: 'system' as const, label: 'System', icon: Monitor },
    { value: 'light' as const, label: 'Light', icon: Sun },
    { value: 'dark' as const, label: 'Dark', icon: Moon },
  ];

  const handleToggle = () => {
    if (showDropdown) {
      setIsOpen(!isOpen);
    } else {
      // Simple toggle between light and dark
      setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={handleToggle}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-md p-2 text-muted-foreground transition-colors duration-200 hover:bg-accent hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          className
        )}
        aria-label={`Current theme: ${theme}. Click to ${showDropdown ? 'open theme menu' : 'toggle theme'}`}
      >
        <Icon style={{ width: iconSize, height: iconSize }} />
        {showLabel && (
          <span className="text-sm font-medium">
            {theme === 'system' ? 'System' : theme === 'light' ? 'Light' : 'Dark'}
          </span>
        )}
      </button>

      {showDropdown && isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-44 overflow-hidden rounded-xl border border-border bg-popover shadow-lg">
          <div className="p-1" role="menu" aria-orientation="vertical">
            {themes.map(({ value, label, icon: ItemIcon }) => (
              <button
                key={value}
                type="button"
                onClick={() => {
                  setTheme(value);
                  setIsOpen(false);
                }}
                className={cn(
                  'flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors',
                  theme === value
                    ? 'bg-accent font-medium text-foreground'
                    : 'text-popover-foreground hover:bg-accent'
                )}
                role="menuitem"
              >
                <ItemIcon className="h-4 w-4" />
                <span>{label}</span>
                {theme === value && <Check className="ml-auto h-4 w-4 text-brand" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
