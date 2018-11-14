
/**
 * Bigger number means higher priority. The pointer will be on top of these with lower numbers.
 */
const PointerPriority = {
  NONE: -1,
  MOVE: 1,
  ITEM_PICKUP: 90,
  BASIC_ATTACK: 100,
  INTERACTION: 110,
  FISHING: 1000
};

export { PointerPriority };
