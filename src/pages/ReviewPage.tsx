import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ReviewPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the unified approvals page
    navigate('/approvals', { replace: true });
  }, [navigate]);

  return (
    <div className="flex items-center justify-center h-64">
      <p className="text-gray-600">Redirecting to approvals...</p>
    </div>
  );
}
