import { motion } from "framer-motion";
import { useState, type ReactNode } from "react";
import { DraggableContainer } from "./DraggableContainer";
import type { StackableItem } from "../../lib/types";

interface StackConfig {
  rotation: number;
  scale: number;
  perspective: number;
}

interface CardStackProps<T extends StackableItem> {
  items: T[];
  children: (item: T) => ReactNode;
  containerClassName?: string;
  cardClassName?: string;
  stackConfig?: Partial<StackConfig>;
  onCardSentToBack?: (id: T["id"]) => void;
}

const defaultConfig: StackConfig = {
  rotation: 4,
  scale: 0.06,
  perspective: 600,
};

export function CardStack<T extends StackableItem>({
  items: initialItems,
  children,
  // 🎯 CARD SIZE CONFIGURATION - Change these values to adjust card size:
  // Current: h-96 w-80 (384px x 320px)
  // Options: h-64 w-56 (256px x 224px), h-80 w-72 (320px x 288px), h-96 w-80 (384px x 320px), h-[500px] w-[400px] (custom)
  containerClassName = "relative h-96 w-80",
  cardClassName = "absolute h-96 w-80 cursor-grab",
  stackConfig: userConfig = {},
  onCardSentToBack,
}: CardStackProps<T>) {
  const [items, setItems] = useState(initialItems);
  const config = { ...defaultConfig, ...userConfig };

  const sendToBack = (id: T["id"]) => {
    setItems((prev) => {
      const newItems = [...prev];
      const index = newItems.findIndex((item) => item.id === id);
      const [item] = newItems.splice(index, 1);
      newItems.unshift(item);
      return newItems;
    });
    onCardSentToBack?.(id);
  };

  return (
    <div
      className={containerClassName}
      style={{ perspective: config.perspective }}
    >
      {items.map((item, index) => (
        <DraggableContainer
          key={item.id}
          onSendToBack={() => sendToBack(item.id)}
          className={cardClassName}
        >
          <motion.div
            className="h-full w-full"
            animate={{
              rotateZ: (items.length - index - 1) * config.rotation,
              scale: 1 + index * config.scale - items.length * config.scale,
              transformOrigin: "90% 90%",
            }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
          >
            {children(item)}
          </motion.div>
        </DraggableContainer>
      ))}
    </div>
  );
}
