import React, { useEffect, useState } from "react";

const CountdownTimer = ({ targetDate, eventName }) => {
  const calculateTimeLeft = () => {
    const difference = new Date(targetDate) - new Date();

    if (difference <= 0) return null; // event start/over

    return {
      दिवस: Math.max(0, Math.floor(difference / (1000 * 60 * 60 * 24))),
      तास: Math.max(0, Math.floor((difference / (1000 * 60 * 60)) % 24)),
      मिनिटे: Math.max(0, Math.floor((difference / 1000 / 60) % 60)),
      सेकंदे: Math.max(0, Math.floor((difference / 1000) % 60)),
    };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="bg-white border border-orange-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
      {/* Event Name */}
      <h3 className="text-xl sm:text-2xl font-semibold text-[#9a3412] mb-4 text-center">
        {eventName}
      </h3>

      {/* Countdown */}
      {timeLeft ? (
        <div className="flex justify-center gap-6 text-lg sm:text-xl font-medium text-gray-700">
          {Object.entries(timeLeft).map(([unit, value]) => (
            <div key={unit} className="flex flex-col items-center">
              <span className="text-3xl font-bold text-[#1f2937]">{value}</span>
              <span className="text-sm text-gray-500">{unit}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-green-700 text-lg font-semibold text-center animate-pulse">
          🎉 Event Ongoing
        </p>
      )}
    </div>
  );
};

export default CountdownTimer;
