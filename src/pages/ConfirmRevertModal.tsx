interface ConfirmRevertModalProps {
  targetVersion: string;
  currentVersion: string;
  onConfirm: () => void;
  onCancel: () => void;
  isProcessing: boolean;
}

export default function ConfirmRevertModal({
  targetVersion,
  currentVersion,
  onConfirm,
  onCancel,
  isProcessing,
}: ConfirmRevertModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay backdrop-blur-sm">
      <div className="bg-card rounded-xl p-6 max-w-md w-full mx-4">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Confirm Revert
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Are you sure you want to revert from {currentVersion} to version {targetVersion}? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={isProcessing}
            className="px-4 py-2 text-sm text-foreground border border-border rounded-lg hover:bg-accent transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isProcessing}
            className="px-4 py-2 text-sm text-white bg-red-600 rounded-lg disabled:opacity-50"
          >
            {isProcessing ? 'Reverting...' : 'Revert'}
          </button>
        </div>
      </div>
    </div>
  );
}
