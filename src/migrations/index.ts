import * as migration_20260720_081005 from './20260720_081005';

export const migrations = [
  {
    up: migration_20260720_081005.up,
    down: migration_20260720_081005.down,
    name: '20260720_081005'
  },
];
