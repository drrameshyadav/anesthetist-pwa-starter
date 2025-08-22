import React from "react";
import { CardData } from "../types";

interface CardGridProps {
  cards: CardData[];
  renderCard: (card: CardData, index: number) => React.ReactNode;
}

export const CardGrid: React.FC<CardGridProps> = ({ cards, renderCard }) => {
  return (
    <div className="w-full px-2 sm:px-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {cards.map((card, index) => (
          <div key={index} className="w-full">
            {renderCard(card, index)}
          </div>
        ))}
      </div>
    </div>
  );
};
