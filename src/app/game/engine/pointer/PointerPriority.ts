
/**
 * Bigger number means higher priority. The pointer will be on top of these with lower numbers.
 */
const PointerPriority = {
  NONE: -1, // None means this pointer wont be available at all.
  MOVE: 1,
  ITEM_PICKUP: 90,
  BASIC_ATTACK: 100,
  INTERACTION: 110,
  CHOP_WOOD: 120,
  FISHING: 1000
};

export { PointerPriority };
