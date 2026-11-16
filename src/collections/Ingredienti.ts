import { taxonomy } from './taxonomy'

export const Ingredienti = taxonomy({
  slug: 'ingredienti',
  singular: 'Ingrediente',
  plural: 'Ingredienti',
  extraFields: [
    {
      name: 'plurale',
      type: 'text',
      admin: {
        description:
          'Per il ricalcolo delle porzioni: «uova» se il nome è «uovo». Vuoto se non cambia.',
      },
    },
  ],
})
