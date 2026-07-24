import * as migration_20260724_042757_init from './20260724_042757_init';

export const migrations = [
  {
    up: migration_20260724_042757_init.up,
    down: migration_20260724_042757_init.down,
    name: '20260724_042757_init'
  },
];
