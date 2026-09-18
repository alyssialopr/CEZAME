import React from 'react';

interface UnitCardPreviewProps {
  unitNumber?: number;
  title: string;
  subtitle?: string;
  color?: string;
  borderColor?: string;
  mascotName?: string | null;
  xpReward?: number;
}

export const UnitCardPreview: React.FC<UnitCardPreviewProps> = ({
  unitNumber = 1,
  title,
  subtitle,
  color = '#B4EE83',
  borderColor = '#91C85A',
  mascotName = 'RicoDocteur',
  xpReward = 50,
}) => {
  const effectiveMascot = mascotName || 'RicoEntreprise';

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
        <span>Aperçu Mobile de l'En-tête</span>
        <span className="text-emerald-600 font-normal normal-case">En direct</span>
      </div>

      <div
        style={{
          backgroundColor: color,
          borderColor: borderColor,
        }}
        className="relative overflow-hidden rounded-2xl border-4 p-5 shadow-lg transition-all"
      >
        <div className="flex items-center justify-between gap-4">
          {/* Bloc de texte gauche */}
          <div className="flex-1 space-y-2 z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/50 backdrop-blur-xs border border-white/60 text-xs font-bold text-slate-800 shadow-xs">
              <span>Unité {unitNumber}</span>
            </div>

            <h3 className="text-xl font-extrabold text-slate-900 leading-tight drop-shadow-2xs">
              {title || `Titre de l'Unité ${unitNumber}`}
            </h3>

            {subtitle && (
              <p className="text-sm font-semibold text-slate-800/80 leading-snug">
                {subtitle}
              </p>
            )}

            <div className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-900/10 text-slate-900">
              <span>✨ +{xpReward} XP</span>
            </div>
          </div>

          {/* Mascotte droite */}
          <div className="relative shrink-0 w-24 h-24 flex items-center justify-center">
            {/* Halo lumineux décoratif */}
            <div className="absolute inset-0 bg-white/40 rounded-full blur-xs transform scale-90" />
            <img
              src={`/mascots/${effectiveMascot}.svg`}
              alt="Mascotte"
              className="relative w-full h-full object-contain filter drop-shadow-md transform hover:scale-105 transition-transform"
              onError={(e) => {
                // Fallback image si manquante
                (e.target as HTMLImageElement).src = '/mascots/RicoEntreprise.svg';
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
