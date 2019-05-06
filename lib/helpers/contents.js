const commonTags = require('common-tags');

module.exports = {

  component: () => {

    return commonTags.html`
    <template>
      <div>
        <!-- Component generated with the Command-line Interface -->
      </div>
    </template>

    <script>
        export default {

            data () {
                return {}
            },

            mounted () {

            },

            methods: {}

        }
    </script>

    <style>
    </style>
    `;
  },

  directive: (name) => {

    return commonTags.html`
      import Vue from "vue/dist/vue.js";

      Vue.directive('${name}', {

        inserted: function (el) {
          // Directive generated with the Command-line Interface
        }

      });
    `;
  },

  page: (id) => {

    return commonTags.html`
      <!-- Page generated with the Command-line Interface. Some infos: -->

      <!-- Styles for this page you can found in assets/scss/pages -->
      <!-- Script for this page you can found in assets/js/pages -->
      <!-- Routes for this page you can found in app/routes/site -->

      <!-- PS: The section ID is util for the style/script file. If you change, be sure to change these files too. -->

      <section id="${id}">
        <!-- Write your page here -->
      </section>
    `;
  },

  script: (id) => {

    return commonTags.html`
      
    import Vue from "vue/dist/vue.js";
    import axios from "axios";

    export default () => {

      if ($('#${id}').length > 0) {

        return new Vue({

          el: '#${id}',

          data: {},

          mounted() {
            console.log('Yeah! This page is already mounted.')
          },

          methods: {}

        });

      }

    }
    
    `;

  },

  style: (id) => {

    return commonTags.html`
      #${id} {
        // Write your styles here
      }
    `;

  },

  route: (name) => {

    return commonTags.html`

        router.get('/${name}', (req, res) => {

            render(req, res, {
                page: 'site/${name}',
                title: 'Título da página',
                description: 'Descreva a página aqui!'
            });

        });

        module.exports = router;
    `;

  }

}
