const { defineConfig } = require("cypress");
const axios = require('axios');
const { faker } = require('@faker-js/faker');
const baseUrl = 'https://api.github.com';
const axiosObject = axios.create({
  baseURL: baseUrl,
});

module.exports = defineConfig({
  e2e: {
    baseUrl,
    setupNodeEvents(on, config) {
      on('task', {
        async 'gists:seed'(numberOfGists) {
          for (let i = 0; i < numberOfGists; i++) {
            await axiosObject.post('/gists', {
              description: faker.company.name(),
              public: false,
              files: { "README.md": { "content": faker.commerce.product() } }
            }, {
              headers: {
                Accept: 'application/vnd.github+json',
                Authorization: 'Bearer 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',
                'X-GitHub-Api-Version': '2022-11-28'
              }
            });
          }
          return null;
        },

        async 'gists:seed:delete'() {
          const response = await axiosObject.get('users/aniqameraj/gists?per_page=100&page=1', {
            headers: {
              Accept: 'application/vnd.github+json',
              Authorization: 'Bearer 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',
              'X-GitHub-Api-Version': '2022-11-28'
            }
          });
          console.log('Deleting all my gists >>>', JSON.stringify(response.data));
          for (const gist of response.data) {
            //delete gists one by one
            await axiosObject.delete(`gists/${gist.id}`, {
              headers: {
                Accept: 'application/vnd.github+json',
                Authorization: 'Bearer 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',
                'X-GitHub-Api-Version': '2022-11-28'
              }
            });
          }
          return null;
        },

        async 'gist:seed:createsinglegist'(public) {
          const response = await axiosObject.post('/gists', {
            description: faker.company.name(),
            public,
            files: { "README.md": { "content": faker.commerce.product() } }
          }, {
            headers: {
              Accept: 'application/vnd.github+json',
              Authorization: 'Bearer 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',
              'X-GitHub-Api-Version': '2022-11-28'
            }
          });
          return response.data.id;
          
        }
      })
    },
  },
});
