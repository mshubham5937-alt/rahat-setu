import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useProblems } from '../../context/ProblemContext';
import { SEVERITY_CONFIG } from '../../data/demoData';
import type { Problem, Severity } from '../../types';
import { MaterialIcon } from '../common/MaterialIcon';
import { Badge } from '../common/Badge';
import { Card } from '../common/Card';
import { cn } from '../../utils/cn';

const SEVERITY_COLORS: Record<Severity, string> = {
  critical: '#BA1A1A',
  high: '#F59E0B',
  medium: '#06B6D4',
  low: '#76767e',
};

function createIcon(severity: Severity, active = false): L.DivIcon {
  return L.divIcon({
    className: '',
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    html: `<div style="
      width:26px;height:26px;border-radius:50%;
      background:${SEVERITY_COLORS[severity]};
      border:3px solid #fff;
      box-shadow:0 2px 8px rgba(0,0,0,0.35), 0 0 0 ${active ? 8 : 4}px ${SEVERITY_COLORS[severity]}40;
      display:flex;align-items:center;justify-content:center;
      font-size:13px;color:#fff;
    ">!</div>`,
  });
}

function FocusController({ focusId, target }: { focusId: string | null; target: Problem[] }) {
  const map = useMap();
  useEffect(() => {
    if (!focusId) return;
    const p = target.find((x) => x.id === focusId);
    if (p) {
      setCenter(map, p.location.latitude, p.location.longitude);
    }
  }, [focusId, target, map]);
  return null;
}

function setCenter(map: L.Map, lat: number, lng: number) {
  map.flyTo([lat, lng], Math.max(map.getZoom(), 14), { duration: 1.1 });
}

interface LiveMapProps {
  problems?: Problem[];
  height?: number;
  focusId?: string | null;
  onSelect?: (problem: Problem) => void;
}

export function LiveMap({ problems: external, height = 480, focusId, onSelect }: LiveMapProps) {
  const { problems: allProblems } = useProblems();
  const problems = external ?? allProblems;

  const center = useMemo(() => {
    if (problems.length === 0) return [23.0225, 72.5714] as [number, number];
    const lat = problems.reduce((s, p) => s + p.location.latitude, 0) / problems.length;
    const lng = problems.reduce((s, p) => s + p.location.longitude, 0) / problems.length;
    return [lat, lng] as [number, number];
  }, [problems]);

  const [filter, setFilter] = useState<Severity | 'all'>('all');
  const [selected, setSelected] = useState<string | null>(focusId ?? null);

  useEffect(() => { if (focusId) setSelected(focusId); }, [focusId]);

  const visible = filter === 'all' ? problems : problems.filter((p) => p.severity === filter);

  return (
    <Card padding="none" className="overflow-hidden">
      <div className="flex items-center justify-between p-3 border-b border-outline-variant/20">
        <div className="flex items-center gap-2">
          <MaterialIcon icon="map" size={20} className="text-secondary" />
          <h3 className="font-headline-sm text-on-surface">Live Disaster Map</h3>
          <Badge variant="success" size="sm" dot pulse>Live</Badge>
        </div>
        <div className="flex items-center gap-1">
          {(['all', 'critical', 'high', 'medium', 'low'] as const).map((sev) => (
            <button
              key={sev}
              onClick={() => setFilter(sev)}
              className={cn(
                'px-2 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide border transition-colors',
                filter === sev
                  ? 'bg-secondary text-on-secondary-container border-secondary'
                  : 'bg-surface-container-high text-on-surface-variant border-outline-variant hover:border-secondary'
              )}
            >
              {sev === 'all' ? 'All' : SEVERITY_CONFIG[sev].label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ height }} className="relative z-0">
        <MapContainer center={center as [number, number]} zoom={10} scrollWheelZoom style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {visible.map((p) => (
            <Marker
              key={p.id}
              position={[p.location.latitude, p.location.longitude]}
              icon={createIcon(p.severity, selected === p.id)}
              eventHandlers={{
                click: () => {
                  setSelected(p.id);
                  if (onSelect) onSelect(p);
                },
              }}
            >
              <Popup>
                <div className="min-w-[200px]">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span
                      className="inline-block w-2 h-2 rounded-full"
                      style={{ backgroundColor: SEVERITY_COLORS[p.severity] }}
                    />
                    <span className="text-[11px] font-bold uppercase" style={{ color: SEVERITY_COLORS[p.severity] }}>
                      {SEVERITY_CONFIG[p.severity].label}
                    </span>
                    <span className="text-[11px] font-semibold text-on-surface-variant">Score {p.priorityScore}</span>
                  </div>
                  <p className="text-[13px] font-bold text-on-surface leading-snug mb-0.5">{p.title}</p>
                  <p className="text-[11px] text-on-surface-variant mb-1">
                    {p.location.address || p.location.city}
                  </p>
                  <p className="text-[11px] text-on-surface-variant">
                    {p.affectedPopulation.toLocaleString()} affected • {p.status.replace(/_/g, ' ')}
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}
          {visible
            .filter((p) => p.severity === 'critical')
            .map((p) => (
              <Circle
                key={`c-${p.id}`}
                center={[p.location.latitude, p.location.longitude]}
                radius={4000}
                pathOptions={{ color: '#BA1A1A', fillColor: '#BA1A1A', fillOpacity: 0.08, weight: 1, dashArray: '4 4' }}
              />
            ))}
          <FocusController focusId={selected} target={visible} />
        </MapContainer>
      </div>

      <div className="flex items-center gap-4 p-3 border-t border-outline-variant/20 text-[11px] text-on-surface-variant">
        {(['critical', 'high', 'medium', 'low'] as Severity[]).map((sev) => (
          <span key={sev} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: SEVERITY_COLORS[sev] }} />
            {SEVERITY_CONFIG[sev].label} ({problems.filter((p) => p.severity === sev).length})
          </span>
        ))}
      </div>
    </Card>
  );
}