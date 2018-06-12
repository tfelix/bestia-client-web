export enum ComponentType {
  MOVE,
  VISUAL,
  POSITION,
  DEBUG,
  PLAYER,
  CONDITION,

  // This are local only components which will never get send from the server
  // to the client. They exist for local housekeeping.

  LOCAL_MASTER
}
