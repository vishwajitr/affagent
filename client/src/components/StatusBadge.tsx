import { ContactStatus } from '../types';

const config: Record<ContactStatus, { label: string; className: string }> = {
  NOT_CALLED: { label: 'Not Called', className: 'bg-gray-100 text-gray-700' },
  CALLED: { label: 'Called', className: 'bg-blue-100 text-blue-700' },
  INTERESTED: { label: 'Interested', className: 'bg-green-100 text-green-700' },
  NOT_INTERESTED: { label: 'Not Interested', className: 'bg-red-100 text-red-700' },
  NO_ANSWER: { label: 'No Answer', className: 'bg-yellow-100 text-yellow-700' },
  FAILED: { label: 'Failed', className: 'bg-orange-100 text-orange-700' },
};

interface Props {
  status: ContactStatus;
}

export default function StatusBadge({ status }: Props) {
  const { label, className } = config[status] || config.NOT_CALLED;
  return <span className={`badge ${className}`}>{label}</span>;
}
