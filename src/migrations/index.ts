import * as migration_20261115_102913_initial from './20261115_102913_initial';
import * as migration_20261116_104212_modello_ricette from './20261116_104212_modello_ricette';

export const migrations = [
  {
    up: migration_20261115_102913_initial.up,
    down: migration_20261115_102913_initial.down,
    name: '20261115_102913_initial',
  },
  {
    up: migration_20261116_104212_modello_ricette.up,
    down: migration_20261116_104212_modello_ricette.down,
    name: '20261116_104212_modello_ricette'
  },
];
