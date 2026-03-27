const Logo = () => {
  return (
    <svg width="50" height="50" viewBox="0 0 100 100" fill="none">
      <circle cx="50" cy="50" r="45" stroke="url(#gradient1)" strokeWidth="2.5" fill="none" opacity="0.4"/>
      <circle cx="50" cy="50" r="35" stroke="url(#gradient2)" strokeWidth="2" fill="none" opacity="0.6"/>
      <circle cx="50" cy="50" r="25" fill="url(#gradient3)"/>
      <path d="M 42 37 L 42 63 L 65 50 Z" fill="white"/>

      <circle cx="50" cy="5" r="4" fill="#EF4444" opacity="0.9">
        <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="8s" repeatCount="indefinite"/>
      </circle>

      <circle cx="85" cy="35" r="3" fill="#DC2626" opacity="0.8">
        <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="12s" repeatCount="indefinite"/>
      </circle>

      <circle cx="15" cy="65" r="3.5" fill="#B91C1C" opacity="0.9">
        <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="10s" repeatCount="indefinite"/>
      </circle>

      <defs>
        <linearGradient id="gradient1">
          <stop offset="0%" stopColor="#DC2626"/>
          <stop offset="100%" stopColor="#EF4444"/>
        </linearGradient>
        <linearGradient id="gradient2">
          <stop offset="0%" stopColor="#EF4444"/>
          <stop offset="100%" stopColor="#F87171"/>
        </linearGradient>
        <linearGradient id="gradient3">
          <stop offset="0%" stopColor="#DC2626"/>
          <stop offset="50%" stopColor="#B91C1C"/>
          <stop offset="100%" stopColor="#991B1B"/>
        </linearGradient>
      </defs>
    </svg>
  );
};

export default Logo;