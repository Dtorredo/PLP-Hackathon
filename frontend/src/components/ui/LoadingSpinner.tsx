interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
}

export function LoadingSpinner({
  size = "md",
  text,
  className = "",
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid"
        style={{ shapeRendering: "auto", display: "block" }}
        className={sizeClasses[size]}
        xmlnsXlink="http://www.w3.org/1999/xlink"
      >
        <g>
          <path
            style={{ transform: "scale(0.8)", transformOrigin: "50px 50px" }}
            strokeLinecap="round"
            d="M24.3 30C11.4 30 5 43.3 5 50s6.4 20 19.3 20c19.3 0 32.1-40 51.4-40 C88.6 30 95 43.3 95 50s-6.4 20-19.3 20C56.4 70 43.6 30 24.3 30z"
            strokeDasharray="42.76482137044271 42.76482137044271"
            strokeWidth="8"
            stroke="#e90c59"
            fill="none"
          >
            <animate
              values="0;256.58892822265625"
              keyTimes="0;1"
              dur="1s"
              repeatCount="indefinite"
              attributeName="stroke-dashoffset"
            />
          </path>
          <g></g>
        </g>
      </svg>
      {text && <p className="text-sm text-gray-300 mt-2">{text}</p>}
    </div>
  );
}
