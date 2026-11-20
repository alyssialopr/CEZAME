export const ArrowIcon = ({ size = 17, color = "#FFFFFF" }) => (
  <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24">
    <path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke={color} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const CheckIcon = ({ size = 14, color = "#FFFFFF", width = 3 }) => (
  <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24">
    <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const FlameIcon = ({ size = 22 }) => (
  <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24">
    <path d="M12 2c1 3.5 5 6 5 11a5 5 0 0 1-10 0c0-2.6 1.4-4.3 2.6-5.4.2 1.7 1 2.8 2.1 3.3C11.4 8.4 11 5.3 12 2z" fill="#FF9A3D" />
    <path d="M12 13c1.2 1.3 2 2.3 2 3.6a2 2 0 0 1-4 0c0-1.2.8-2.3 2-3.6z" fill="#FFD36A" />
  </svg>
);

export const HeartIcon = ({ size = 18, color = "#FF5C7A" }) => (
  <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24">
    <path d="M12 21s-8-5.2-8-11.2A4.6 4.6 0 0 1 12 7a4.6 4.6 0 0 1 8 2.8C20 15.8 12 21 12 21z" fill={color} />
  </svg>
);

export const BellIcon = ({ size = 18, color = "#7B4FE2" }) => (
  <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24">
    <path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4z" fill={color} />
    <path d="M10 20a2 2 0 0 0 4 0" stroke={color} strokeWidth="2" fill="none" />
  </svg>
);

export const LockIcon = ({ size = 36 }) => (
  <svg aria-hidden="true" width={size} height={size} viewBox="0 0 48 48" style={{ overflow: "visible" }}>
    <path className="lock__shackle" d="M15 22v-7a9 9 0 0 1 18 0v7" fill="none" stroke="#1F1A3A" strokeWidth="5" strokeLinecap="round" />
    <rect x="8" y="21" width="32" height="24" rx="7" fill="#7B4FE2" />
    <circle cx="24" cy="33" r="3.5" fill="#FFFFFF" />
  </svg>
);

export const PhoneStoreIcon = () => (
  <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24">
    <rect x="6" y="2" width="12" height="20" rx="3" fill="none" stroke="#FFFFFF" strokeWidth="2" />
    <circle cx="12" cy="18" r="1.3" fill="#FFFFFF" />
  </svg>
);

export const PlayStoreIcon = () => (
  <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24">
    <path d="M5 3l14 9-14 9z" fill="#FFFFFF" />
  </svg>
);

// Grand pictogramme en filigrane derrière Rico, dans chaque porte.
const BIG = {
  cross: <path d="M38 8h24v30h30v24H62v30H38V62H8V38h30z" />,
  euro: (
    <>
      <path d="M78 22a36 36 0 1 0 0 56" fill="none" strokeWidth="16" strokeLinecap="round" />
      <path d="M14 42h44M14 58h40" fill="none" strokeWidth="12" strokeLinecap="round" />
    </>
  ),
  doc: (
    <>
      <path d="M20 6h40l22 22v58a8 8 0 0 1-8 8H20a8 8 0 0 1-8-8V14a8 8 0 0 1 8-8z" />
      <path d="M28 50h40M28 68h28" stroke="#FFFFFF" strokeOpacity="0.35" strokeWidth="9" strokeLinecap="round" />
    </>
  ),
  car: (
    <>
      <path d="M10 58l10-24a10 10 0 0 1 9-6h42a10 10 0 0 1 9 6l10 24v20a6 6 0 0 1-6 6H16a6 6 0 0 1-6-6z" />
      <circle cx="28" cy="84" r="10" fill="#FFFFFF" fillOpacity="0.35" />
      <circle cx="72" cy="84" r="10" fill="#FFFFFF" fillOpacity="0.35" />
    </>
  ),
  house: (
    <>
      <path d="M50 8l42 36h-10v46H18V44H8z" />
      <rect x="40" y="58" width="20" height="32" rx="4" fill="#FFFFFF" fillOpacity="0.35" />
    </>
  ),
};

export const BigIcon = ({ name, color, size = 96, className }) => (
  <svg
    aria-hidden="true"
    className={className}
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill={color}
    stroke={name === "euro" ? color : undefined}
  >
    {BIG[name]}
  </svg>
);
