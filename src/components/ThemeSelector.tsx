import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Palette, X } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { ThemeColors } from '@/lib/themes';

interface ThemeSelectorProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ isOpen, onClose }) => {
  const { currentTheme, setTheme, themes } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        key="theme-modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-overlay backdrop-blur-sm z-[9999] flex items-center justify-center"
        onClick={onClose}
      >
        <motion.div
          key="theme-modal"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-card border border-border rounded-xl p-6 max-w-2xl w-[90%] max-h-[80vh] overflow-y-auto shadow-lg m-4"
          onClick={(e) => e.stopPropagation()}
        >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-brand text-brand-foreground">
              <Palette className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">
              Accent color
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {themes.map((theme) => (
            <ThemeCard
              key={theme.id}
              theme={theme}
              isSelected={currentTheme.id === theme.id}
              onSelect={() => setTheme(theme.id)}
            />
          ))}
        </div>

        <div className="mt-6 p-4 bg-secondary rounded-lg">
          <p className="text-sm text-muted-foreground text-center">
            Your accent color is saved automatically and applied across the app.
          </p>
        </div>
      </motion.div>
    </motion.div>
    </AnimatePresence>,
    document.body
  );
};

interface ThemeCardProps {
  theme: ThemeColors;
  isSelected: boolean;
  onSelect: () => void;
}

const ThemeCard: React.FC<ThemeCardProps> = ({ theme, isSelected, onSelect }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all duration-200 ${
        isSelected
          ? 'border-brand shadow-md'
          : 'border-border hover:border-muted-foreground/40'
      }`}
      onClick={onSelect}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Color Preview */}
      <div className="aspect-square p-3">
        <div className="w-full h-full rounded-md overflow-hidden relative">
          {/* Background */}
          <div
            className="absolute inset-0"
            style={{ backgroundColor: theme.background }}
          />

          {/* Primary Color Bar */}
          <div
            className="absolute top-0 left-0 right-0 h-1/3"
            style={{ background: theme.gradient.primary }}
          />

          {/* Secondary Color Bar */}
          <div
            className="absolute top-1/3 left-0 right-0 h-1/3"
            style={{ background: theme.gradient.secondary }}
          />

          {/* Accent Color Bar */}
          <div
            className="absolute top-2/3 left-0 right-0 h-1/3"
            style={{ background: theme.gradient.accent }}
          />

          {/* Color Dots */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex gap-1">
              <div
                className="w-3 h-3 rounded-full border border-white/30"
                style={{ backgroundColor: theme.primary }}
              />
              <div
                className="w-3 h-3 rounded-full border border-white/30"
                style={{ backgroundColor: theme.secondary }}
              />
              <div
                className="w-3 h-3 rounded-full border border-white/30"
                style={{ backgroundColor: theme.accent }}
              />
            </div>
          </div>

          {/* Selection Check */}
          {isSelected && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-2 right-2 w-5 h-5 bg-brand rounded-full flex items-center justify-center"
            >
              <Check className="w-3 h-3 text-white" />
            </motion.div>
          )}
        </div>
      </div>

      {/* Theme Name */}
      <div className="p-3 pt-0">
        <h3 className={`text-sm font-medium text-center transition-colors ${
          isSelected || isHovered
            ? 'text-foreground'
            : 'text-muted-foreground'
        }`}>
          {theme.name}
        </h3>
      </div>
    </motion.div>
  );
};

// Theme Toggle Button Component
export const ThemeToggleButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        title="Change accent color"
      >
        <Palette className="w-[18px] h-[18px]" />
      </button>

      <ThemeSelector isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};
