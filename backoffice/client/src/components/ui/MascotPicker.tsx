import React from 'react';
import { Check } from 'lucide-react';

export interface MascotOption {
  id: string;
  name: string;
  description: string;
  recommendedFor?: string;
}

export const AVAILABLE_MASCOTS: MascotOption[] = [
  {
    id: 'RicoDocteur',
    name: 'Rico Médecin',
    description: 'Blouse blanche & stéthoscope',
    recommendedFor: 'Santé',
  },
  {
    id: 'RicoEntrepriseDroit',
    name: 'Rico Banquier',
    description: 'Costume & mallette d’affaires',
    recommendedFor: 'Finance',
  },
  {
    id: 'RicoEntreprise',
    name: 'Rico Cadre',
    description: 'Tenue corporate & dossiers',
    recommendedFor: 'Administration',
  },
  {
    id: 'RicoBleuTravail',
    name: 'Rico Mécanicien',
    description: 'Bleu de travail & casquette',
    recommendedFor: 'Voiture',
  },
  {
    id: 'Riconstruction',
    name: 'Rico Bâtisseur',
    description: 'Casque de chantier & plan',
    recommendedFor: 'Logement',
  },
  {
    id: 'RicoHappy',
    name: 'Rico Souriant',
    description: 'Mascotte neutre joyeuse',
  },
  {
    id: 'RicoJoy',
    name: 'Rico En Fête',
    description: 'Saut de joie & célébration',
  },
];

interface MascotPickerProps {
  value?: string | null;
  onChange: (mascotId: string | null) => void;
  allowInherit?: boolean;
  inheritedMascotName?: string;
}

export const MascotPicker: React.FC<MascotPickerProps> = ({
  value,
  onChange,
  allowInherit = false,
  inheritedMascotName,
}) => {
  return (
    <div className="space-y-3">
      {allowInherit && (
        <button
          type="button"
          onClick={() => onChange(null)}
          className={`w-full flex items-center justify-between p-3 rounded-xl border text-sm font-medium transition-all ${
            !value
              ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 ring-2 ring-indigo-500/20'
              : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              Par défaut
            </span>
            <span>Hériter de la catégorie {inheritedMascotName ? `(${inheritedMascotName})` : ''}</span>
          </div>
          {!value && <Check className="w-4 h-4 text-indigo-600" />}
        </button>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-64 overflow-y-auto p-1">
        {AVAILABLE_MASCOTS.map((mascot) => {
          const isSelected = value === mascot.id;
          return (
            <button
              key={mascot.id}
              type="button"
              onClick={() => onChange(mascot.id)}
              className={`relative flex flex-col items-center p-3 rounded-xl border text-center transition-all group ${
                isSelected
                  ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/30'
                  : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
              }`}
            >
              {isSelected && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                  <Check className="w-3.5 h-3.5" />
                </div>
              )}

              {/* Aperçu de la mascotte */}
              <div className="w-16 h-16 mb-2 flex items-center justify-center">
                <img
                  src={`/mascots/${mascot.id}.svg`}
                  alt={mascot.name}
                  className="w-full h-full object-contain filter drop-shadow-sm group-hover:scale-105 transition-transform"
                  loading="lazy"
                />
              </div>

              <div className="text-xs font-semibold text-slate-800 leading-tight">
                {mascot.name}
              </div>

              {mascot.recommendedFor && (
                <span className="mt-1 text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                  {mascot.recommendedFor}
                </span>
              )}

              <span className="mt-0.5 text-[10px] text-slate-400 line-clamp-1">
                {mascot.description}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
