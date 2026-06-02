type ApprovalEventHandler = () => void;

const listeners: ApprovalEventHandler[] = [];

export const approvalEvents = {
  subscribe(handler: ApprovalEventHandler) {
    listeners.push(handler);
    return () => {
      const index = listeners.indexOf(handler);
      if (index > -1) listeners.splice(index, 1);
    };
  },
  emit() {
    listeners.forEach((handler) => handler());
  },
};

// Convenience function for subscribing
export function onApprovalUpdate(handler: ApprovalEventHandler) {
  return approvalEvents.subscribe(handler);
}
