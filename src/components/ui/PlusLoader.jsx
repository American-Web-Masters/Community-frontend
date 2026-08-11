const DivineLoader = () => {
  return (
    <div className="relative w-24 h-32 flex items-center justify-center">
      {/* Rotating circular orbit */}
      <div className="absolute inset-0 animate-spin" style={{ animationDuration: '2s' }}>
        <div className="absolute inset-2 border border-amber-400/40 rounded-full"></div>
      </div>
      
      {/* Main cross symbol */}
      <div className="relative w-16 h-24">
        {/* Vertical beam - elongated */}
        <div className="absolute left-1/2 top-0 -translate-x-1/2 w-3 h-24 bg-gradient-to-b from-amber-300 via-amber-500 to-amber-600 rounded-full shadow-lg shadow-amber-500/50">
          <div className="absolute inset-0 bg-white/30 rounded-full blur-[2px]"></div>
        </div>
        
        {/* Horizontal beam */}
        <div className="absolute left-1/2 top-7 -translate-x-1/2 w-16 h-3 bg-gradient-to-r from-amber-300 via-amber-500 to-amber-600 rounded-full shadow-lg shadow-amber-500/50">
          <div className="absolute inset-0 bg-white/30 rounded-full blur-[2px]"></div>
        </div>
        
        {/* Center point */}
        <div className="absolute left-1/2 top-[34px] -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-amber-100 rounded-full shadow-lg shadow-amber-300"></div>
      </div>
    </div>
  );
};

export default DivineLoader;