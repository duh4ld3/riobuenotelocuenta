import React from 'react';
import type { EventEntry } from '../types';
import dayjs from 'dayjs';

interface Props {
  eventos: EventEntry[];
}

/**
 * Lista de eventos ordenados cronológicamente. Cada evento muestra la
 * fecha formateada (DD MMM) y el texto asociado.
 */
const TimelineList: React.FC<Props> = ({ eventos }) => {
  const sorted = [...eventos].sort((a, b) => a.fecha.localeCompare(b.fecha));
  return (
    <ul className="border-l border-darkBorder pl-4 space-y-2">
      {sorted.map((ev, idx) => (
        <li key={idx} className="relative">
          <span className="absolute -left-2 top-1.5 h-1.5 w-1.5 rounded-full bg-primary"></span>
          <span className="text-xs text-gray-400 mr-2">
            {dayjs(ev.fecha).format('DD MMM')}
          </span>
          <span className="text-sm text-gray-200">{ev.texto}</span>
        </li>
      ))}
    </ul>
  );
};

export default TimelineList;