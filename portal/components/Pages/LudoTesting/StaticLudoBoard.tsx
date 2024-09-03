import { useMemo } from 'react';

type LudoBoardColor = {
  [key: string]: string;
};

const StaticLudoBoard: React.FC<{ color: LudoBoardColor; }> = ({ color }) => {

  const memoizedBoard = useMemo(() => {

    const { P1, P2, P3, P4 } = color;
    const lines = [];

    for (let i = 0; i <= 15; i++) {
      const y = i * 10;
      lines.push(<line key={`C${i}`} x1={y} y1="0" x2={y} y2="150" stroke="black" />);
      lines.push(<line key={`R${i}`} x1="0" y1={y} x2="150" y2={y} stroke="black" />);
    }

    return (
      <svg strokeWidth="0.8" stroke="black">
        <defs>
          <symbol id="star" viewBox="0 0 150 150" fill="none">
            <polygon points="5,0 6.5,3.1 10,3.6 7.4,6 8,9.5 5,7.8 1.9,9.5 2.5,6 0,3.6 3.4,3.1" />
          </symbol>
        </defs>

        {lines}

        <rect rx="2" ry="2" x="0" y="0" width="60" height="60" fill={P2} />
        <rect rx="2" ry="2" x="90" y="0" width="60" height="60" fill={P3} />
        <rect rx="2" ry="2" x="90" y="90" width="60" height="60" fill={P4} />
        <rect rx="2" ry="2" x="0" y="90" width="60" height="60" fill={P1} />

        <rect rx="2" ry="2" x="10" y="10" width="40" height="40" fill="white" />
        <rect rx="2" ry="2" x="100" y="10" width="40" height="40" fill="white" />
        <rect rx="2" ry="2" x="100" y="100" width="40" height="40" fill="white" />
        <rect rx="2" ry="2" x="10" y="100" width="40" height="40" fill="white" />

        <circle cx="20" cy="20" r="5" fill={P2} />
        <circle cx="40" cy="20" r="5" fill={P2} />
        <circle cx="20" cy="40" r="5" fill={P2} />
        <circle cx="40" cy="40" r="5" fill={P2} />

        <circle cx="110" cy="20" r="5" fill={P3} />
        <circle cx="130" cy="20" r="5" fill={P3} />
        <circle cx="110" cy="40" r="5" fill={P3} />
        <circle cx="130" cy="40" r="5" fill={P3} />

        <circle cx="110" cy="110" r="5" fill={P4} />
        <circle cx="130" cy="110" r="5" fill={P4} />
        <circle cx="110" cy="130" r="5" fill={P4} />
        <circle cx="130" cy="130" r="5" fill={P4} />

        <circle cx="20" cy="110" r="5" fill={P1} />
        <circle cx="40" cy="110" r="5" fill={P1} />
        <circle cx="20" cy="130" r="5" fill={P1} />
        <circle cx="40" cy="130" r="5" fill={P1} />

        <path d="M 60 140 L 80 140 L 80 90 L 90 90 L 75 75 L 60 90 L 70 90 L 70 130 L 60 130 Z" fill={P1} />
        <path d="M 10 60 L 10 80 L 60 80 L 60 90 L 75 75 L 60 60 L 60 70 L 20 70 L 20 60 Z" fill={P2} />
        <path d="M 70 10 L 90 10 L 90 20 L 80 20 L 80 60 L90 60 L75 75 L 60 60 L70 60 Z" fill={P3} />
        <path d="M 130 90 L 130 80 L 90 80 L90 90 L 75 75 L 90 60 L 90 70 L 140 70 L 140 90 Z" fill={P4} />


        <line x1="70" y1="20" x2="80" y2="20" stroke="black" />
        <line x1="70" y1="30" x2="80" y2="30" stroke="black" />
        <line x1="70" y1="40" x2="80" y2="40" stroke="black" />
        <line x1="70" y1="50" x2="80" y2="50" stroke="black" />
        <line x1="70" y1="60" x2="80" y2="60" stroke="black" />

        <line x1="10" y1="70" x2="20" y2="70" stroke="black" />
        <line x1="130" y1="80" x2="140" y2="80" stroke="black" />

        <line x1="70" y1="90" x2="80" y2="90" stroke="black" />
        <line x1="70" y1="100" x2="80" y2="100" stroke="black" />
        <line x1="70" y1="110" x2="80" y2="110" stroke="black" />
        <line x1="70" y1="120" x2="80" y2="120" stroke="black" />
        <line x1="70" y1="130" x2="80" y2="130" stroke="black" />

        <line x1="80" y1="10" x2="80" y2="20" stroke="black" />

        <line x1="20" y1="70" x2="20" y2="80" stroke="black" />
        <line x1="30" y1="70" x2="30" y2="80" stroke="black" />
        <line x1="40" y1="70" x2="40" y2="80" stroke="black" />
        <line x1="50" y1="70" x2="50" y2="80" stroke="black" />
        <line x1="60" y1="70" x2="60" y2="80" stroke="black" />

        <line x1="90" y1="70" x2="90" y2="80" stroke="black" />
        <line x1="100" y1="70" x2="100" y2="80" stroke="black" />
        <line x1="110" y1="70" x2="110" y2="80" stroke="black" />
        <line x1="120" y1="70" x2="120" y2="80" stroke="black" />
        <line x1="130" y1="70" x2="130" y2="80" stroke="black" />

        <line x1="70" y1="130" x2="70" y2="140" stroke="black" />


        <g transform="translate(61 21) scale(0.8)"><use xlinkHref="#star" /></g>
        <g transform="translate(121 61) scale(0.8)"><use xlinkHref="#star" /></g>
        <g transform="translate(81 121) scale(0.8)"><use xlinkHref="#star" /></g>
        <g transform="translate(21 81) scale(0.8)"><use xlinkHref="#star" /></g>

        <g transform="translate(11 61) scale(0.8)"><use xlinkHref="#star" /></g>
        <g transform="translate(81 11) scale(0.8) "><use xlinkHref="#star" /></g>
        <g transform="translate(131 81) scale(0.8) "><use xlinkHref="#star" /></g>
        <g transform="translate(61 131) scale(0.8) "><use xlinkHref="#star" /></g>
      </svg>
    );
  }, []);
  return memoizedBoard;
};

export default StaticLudoBoard;