import * as React from "react";
import cards from "@/data/cards";
import Card from "@/components/Card";

export default function CardGrid() {
  return (
    <div className="w-full">
      {/* edge-to-edge on phones; add padding only at breakpoints */}
      <div className="px-1 sm:px-2 md:px-4 lg:px-6">
        <div
          className="
            grid gap-2
            grid-cols-2
            sm:grid-cols-3
            md:grid-cols-4
          "
        >
          {cards.map((c, idx) => (
            <Card key={idx} title={c.title} description={c.description} icon={c.icon} />
          ))}
        </div>
      </div>
    </div>
  );
}
