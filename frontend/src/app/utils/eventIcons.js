import { BookOpen, FileSpreadsheet, ClipboardList, FileText, Beaker, Calendar } from 'lucide-react';
import { EVENT_TYPES } from './constants';

export const getEventIcon = (event) => {
  const eventType = event.analysis?.type || 'other';
  
  const icons = {
    [EVENT_TYPES.CLASS]: { icon: BookOpen, color: 'text-blue-500' },
    [EVENT_TYPES.EXAM]: { icon: FileSpreadsheet, color: 'text-red-500' },
    [EVENT_TYPES.QUIZ]: { icon: ClipboardList, color: 'text-orange-500' },
    [EVENT_TYPES.ASSIGNMENT]: { icon: FileText, color: 'text-green-500' },
    [EVENT_TYPES.LAB]: { icon: Beaker, color: 'text-purple-500' },
    [EVENT_TYPES.OTHER]: { icon: Calendar, color: 'text-gray-500' }
  };

  const { icon: Icon, color } = icons[eventType] || icons[EVENT_TYPES.OTHER];
  return <Icon className={`h-4 w-4 ${color}`} />;
};
