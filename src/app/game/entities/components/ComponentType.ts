export enum ComponentType {
  MOVE = 1,
  VISUAL = 2,
  POSITION = 3,
  DEBUG = 4,
  PLAYER = 5,
  CONDITION = 6,
  ENTITY_TYPE = 7,
  ATTACKS = 8,
  PERFORM = 9,
  INVENTORY = 10,
  FX = 11,
  FISHING = 12,
  PROJECTILE = 13,
  INTERACTION = 14,
  LATENCY = 15,
  BUILDING = 16,
  VEGETATION = 17,

  // This are local only components which will never get send from the server
  // to the client. They exist for local housekeeping.
  LOCAL_MASTER = 300,
  LOCAL_INTERACTION = 301,
  LOCAL_SELECT = 302,
  LOCAL_HIGHLIGHT = 303,
}
