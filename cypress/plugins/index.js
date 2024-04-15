const { defineConfig } = require('cypress')
const axios = require(axios);
const faker = require('faker');
const axiosInstance = axios.create({
    baseURL: 'https://api.github.com',
});

module.exports = defineConfig({
    e2e: {
        setupNodeEvents(on, config) {
            on('task', {
                async 'gists:seed'(numberOfGists) {
                    for (const i = 0; i < numberOfGists; i++) {
                        await axiosInstance.post('/gists', {
                            description: faker.string(),
                            public: false,
                            files: { "README.md": { "content": "new gist" } }
                        }, {
                            headers: {
                                Accept: 'application/vnd.github+json',
                                Authorization: 'Bearer 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'
                            }
                        });
                    }
                },

                async 'gists:seed:delete'() {
                    cy.log('Deleting all my gists >>>');
                    const response = await axios.get('users/aniqameraj/gists', {
                        Accept: 'application/vnd.github+json',
                        Authorization: 'Bearer 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'
                    });
                    cy.log('Deleting all my gists >>>', JSON.stringify(response.body));
                    for (const gist of response.body) {
                        //delete gists one by one
                        await axios.delete(`users/aniqameraj/gists/${gist.id}`, {
                            Accept: 'application/vnd.github+json',
                            Authorization: 'Bearer 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'
                        });
                    }

                }
            })
        }
    }
});