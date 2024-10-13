import React, { useEffect, useState } from "react";

export const Clock: React.FC = () => {
  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return <p>It is now {now.toLocaleString()}</p>;
};
