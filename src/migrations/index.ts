import * as migration_20260722_031427_init from './20260722_031427_init';

export const migrations = [
  {
    up: migration_20260722_031427_init.up,
    down: migration_20260722_031427_init.down,
    name: '20260722_031427_init'
  },
];
