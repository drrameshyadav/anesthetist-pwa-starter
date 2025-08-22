import React from "react";
import { CardData } from "../types";

interface CardGridProps {
  cards: CardData[];
}

const CardGrid: React.FC<CardGridProps> = ({ cards }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
      {cards.map((card, index) => (
        <div
          key={index}
          className="bg-white rounded-xl shadow-md p-4 w-full"
          style={{
            marginLeft: "env(safe-area-inset-left)",
            marginRight: "env(safe-area-inset-right)",
          }}
        >
          {card.icon && <div className="mb-2">{card.icon}</div>}
          <h2 className="text-lg font-bold mb-1">{card.title}</h2>
          <p className="text-sm text-gray-600">{card.description}</p>
        </div>
      ))}
    </div>
  );
};

export default CardGrid;
