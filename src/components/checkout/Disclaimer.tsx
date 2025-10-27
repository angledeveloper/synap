import React from "react";

export default function Disclaimer({ disclaimer }: { disclaimer?: string }) {
  return (
    <div className="text-xs text-gray-600">
      {disclaimer || ""}
    </div>
  );
}


