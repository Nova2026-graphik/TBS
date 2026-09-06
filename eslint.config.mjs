// @ts-check
import vuejsAccessibility from 'eslint-plugin-vuejs-accessibility'
import withNuxt from './.nuxt/eslint.config.mjs'

/**
 * Configuration ESLint.
 *
 * `withNuxt` apporte la base Vue + TypeScript accordée à l'arborescence du
 * projet, y compris le formatage (`stylistic`, réglé dans `nuxt.config.ts`) :
 * une seule chaîne d'outils, pas de Prettier à tenir en parallèle.
 *
 * S'y ajoute `vuejs-accessibility`, qui est la raison principale d'avoir un
 * linter ici : le contrôle de types ne dit rien d'un `alt` manquant, d'un
 * `label` sans champ ou d'un rôle ARIA inventé — trois erreurs invisibles à
 * la relecture et coûteuses à réparer une fois le site en ligne.
 */
export default withNuxt(
  ...vuejsAccessibility.configs['flat/recommended'],
  {
    files: ['**/*.vue'],
    rules: {
      /**
       * Un `<label>` peut relier son champ par `for`/`id` — la forme retenue
       * dans le formulaire de devis — ou l'envelopper. Les deux sont valides
       * et annoncées de la même façon par les lecteurs d'écran ; exiger l'`id`
       * partout condamnerait sans raison le champ piège, qui n'a pas d'`id`
       * justement parce qu'il ne doit exister pour personne.
       */
      'vuejs-accessibility/label-has-for': ['error', {
        required: { some: ['nesting', 'id'] },
      }],

      /**
       * Deux règles de mise en forme des gabarits sont désactivées : elles
       * exigeraient de casser en trois lignes tout élément d'une ligne
       * (`<h2 class="…">Titre</h2>`) et de ne poser qu'un attribut par ligne.
       * Le projet écrit ses gabarits à la main, en groupant ce qui se lit
       * ensemble ; les appliquer allongerait les fichiers d'un tiers sans rien
       * apprendre à personne. Tout le reste du formatage est bien contrôlé.
       */
      'vue/singleline-html-element-content-newline': 'off',
      'vue/max-attributes-per-line': 'off',
    },
  },
  {
    // Scripts et fichiers générés : hors du périmètre.
    ignores: ['.output/**', '.nuxt/**', 'server/database/migrations/**'],
  },
)
