
describe("List Gists", () => {

    it("authorized user should get both public and private gists", () => {
        cy.task('gist:seed:createsinglegist', false);
        cy.task('gist:seed:createsinglegist', true);
        cy.fixture('../fixtures/API Data.json').then((data) => {
            const authToken = data.tokenWithAccess;
            cy.request(
                {
                    method: 'GET',
                    url: `/users/aniqameraj/gists`,

                    headers: {

                        Accept: 'application/vnd.github+json',
                        Authorization: `Bearer ${authToken}`
                    }
                }
            ).then((response) => {
                expect(response.status).to.eq(200),
                    expect(response.statusText).to.eq('OK');
                expect(response.body).to.have.length(2);
                const gists = response.body.map(body => body.public);
                expect(gists).to.contains(false);
                expect(gists).to.contains(true);
                cy.task('gists:seed:delete');
            })
        });
    });

    it("unauthorized user should get only public gists", () => {
        cy.task('gist:seed:createsinglegist', false);
        cy.task('gist:seed:createsinglegist', true);
        cy.fixture('../fixtures/API Data.json').then((data) => {
            const authToken = data.tokenWithAccess;
            cy.request(
                {
                    method: 'GET',
                    url: `/users/aniqameraj/gists`,

                    headers: {

                        Accept: 'application/vnd.github+json',
                    }
                }
            ).then((response) => {
                expect(response.status).to.eq(200),
                    expect(response.statusText).to.eq('OK');
                expect(response.body).to.have.length(1);
                expect(response.body[0].public).to.eq(true);
                cy.task('gists:seed:delete');
            })
        });
    });

    it("should return correct number of gists along with correct username", () => {
        const numberOfGists = 2;
        cy.task('gists:seed', numberOfGists);
        const pageSize = 5;
        cy.fixture('../fixtures/API Data.json').then((data) => {
            const authToken = data.tokenWithAccess;
            cy.request(
                {
                    method: 'GET',
                    url: '/gists',
                    qs: {
                        per_page: pageSize,
                        page: 1

                    },
                    headers: {

                        Accept: 'application/vnd.github+json',
                        Authorization: `Bearer ${authToken}`
                    }
                }
            )

                .then((response) => {
                    expect(response.status).to.eq(200),
                        expect(response.statusText).to.eq('OK'),
                        expect(response.body).have.length(numberOfGists);
                    for (const gist of response.body) {
                        expect(gist.owner.login).to.be.eq('aniqameraj');
                    }

                    cy.task('gists:seed:delete');
                })
        })
    });

    it("should return 30 gists in response (default page size) in case per_page parameter is not passed", () => {
        const numberOfGists = 31;
        cy.task('gists:seed', numberOfGists);
        cy.fixture('../fixtures/API Data.json').then((data) => {
            const authToken = data.tokenWithAccess;
            cy.request(
                {
                    method: 'GET',
                    url: '/gists',
                    headers: {
                        Accept: 'application/vnd.github+json',
                        Authorization: `Bearer ${authToken}`
                    }
                }
            )

                .then((response) => {
                    expect(response.status).to.eq(200),
                        expect(response.statusText).to.eq('OK'),
                        expect(response.body).have.length(30);
                    cy.task('gists:seed:delete');
                })
        });

    }
    );

    it("should return all gists in response with updated_at date greater than passed since date", () => {
        const numberOfGists = 2;
        const timestamp = new Date();
        timestamp.setDate(timestamp.getDate() - 1);
        cy.task('gists:seed', numberOfGists);

        const pageSize = 10;
        cy.fixture('../fixtures/API Data.json').then((data) => {
            const authToken = data.tokenWithAccess;
            cy.request(
                {
                    method: 'GET',
                    url: '/gists',
                    qs: {
                        since: timestamp.toISOString(),
                        per_page: pageSize,
                        page: 1

                    },
                    headers: {

                        Accept: 'application/vnd.github+json',
                        Authorization: `Bearer ${authToken}`
                    }
                }
            )

                .then((response) => {
                    expect(response.status).to.eq(200),
                        expect(response.statusText).to.eq('OK');
                    for (const gist of response.body) {
                        expect(new Date(gist.updated_at)).to.be.greaterThan(timestamp);
                    }
                    cy.task('gists:seed:delete');
                })
        });
    });

    it("should return gists divided in correct number of pages.", () => {
        const numberOfGists = 4;
        const pageSize = 2;
        cy.task('gists:seed', numberOfGists);
        cy.fixture('../fixtures/API Data.json').then((data) => {
            const authToken = data.tokenWithAccess;
            cy.request(
                {
                    method: 'GET',
                    url: '/gists',
                    qs: {
                        per_page: pageSize,
                        page: 1

                    },
                    headers: {
                        Accept: 'application/vnd.github+json',
                        Authorization: `Bearer ${authToken}`
                    }
                }
            )

                .then((response) => {
                    expect(response.status).to.eq(200),
                        expect(response.statusText).to.eq('OK'),
                        expect(response.body).have.length(pageSize);
                });
            cy.request(
                {
                    method: 'GET',
                    url: '/gists',
                    qs: {
                        per_page: pageSize,
                        page: 2

                    },
                    headers: {
                        Accept: 'application/vnd.github+json',
                        Authorization: `Bearer ${authToken}`
                    }
                }
            )

                .then((response) => {
                    expect(response.status).to.eq(200),
                        expect(response.statusText).to.eq('OK'),
                        expect(response.body).have.length(pageSize);
                });
            cy.request(
                {
                    method: 'GET',
                    url: '/gists',
                    qs: {
                        per_page: pageSize,
                        page: 3

                    },
                    headers: {
                        Accept: 'application/vnd.github+json',
                        Authorization: `Bearer ${authToken}`
                    }
                }
            )

                .then((response) => {
                    expect(response.status).to.eq(200),
                        expect(response.statusText).to.eq('OK'),
                        expect(response.body).have.length(0);
                    cy.task('gists:seed:delete');
                });
        });
    }
    );

})

describe("Get A Gist", () => {


    it("should successfully get a git using valid git ID", () => {
        cy.task('gist:seed:createsinglegist').then(gistId => {
            cy.fixture('../fixtures/API Data.json').then((data) => {
                const authToken = data.tokenWithAccess;
                cy.request(
                    {
                        method: 'GET',
                        url: `/gists/${gistId}`,

                        headers: {

                            Accept: 'application/vnd.github+json',
                            Authorization: `Bearer ${authToken}`
                        }
                    }
                ).then((response) => {
                    expect(response.status).to.eq(200),
                        expect(response.statusText).to.eq('OK'),
                        expect(response.body.id).to.eq(gistId);
                    cy.task('gists:seed:delete');
                })
            });
        });
    }
    )


    it("Get A Gist with Invalid ID", () => {
        const gist_id = "702f55fed1ca12e4b1b35f644aic86fa2jj";
        cy.fixture('../fixtures/API Data.json').then((data) => {
            const authToken = data.tokenWithAccess;
            cy.request(
                {
                    method: 'GET',
                    url: `/gists/${gist_id}`,
                    failOnStatusCode: false,

                    headers: {
                        Accept: 'application/vnd.github+json',
                        Authorization: `Bearer ${authToken}`
                    }
                }
            )

                .then((response) => {
                    expect(response.status).to.eq(404),
                        expect(response.statusText).to.eq('Not Found');
                })

        });
    }
    )


    describe("Create Gists", () => {

        it("should create a gist successfully using a valid data", () => {

            const description = "test gist pub";
            cy.fixture('../fixtures/API Data.json').then((data) => {
                const authToken = data.tokenWithAccess;
                cy.request(
                    {
                        method: 'POST',
                        url: '/gists',
                        headers: {
                            Accept: 'application/vnd.github+json',
                            Authorization: `Bearer ${authToken}`
                        },
                        body: {
                            description: description,
                            public: false,
                            files: { "README.md": { "content": "new gist" } }
                        }

                    }

                )
                    .then((response) => {
                        expect(response.status).to.eq(201);
                        expect(response.statusText).to.eq('Created');
                        expect(response.body.files).to.have.property("README.md");
                        expect(response.body.files['README.md']).to.contains({ "content": "new gist" });
                        expect(response.body.public).to.eq(false);
                        expect(response.body.description).to.eq(description);
                        expect(response.body.owner.login).to.eq('aniqameraj');
                    }
                    )
            });
            cy.task('gists:seed:delete');

        })

        it("should return Forbidden error for auth token without access", () => {
            cy.fixture('../fixtures/API Data.json').then((data) => {
                const authToken = data.tokenWithoutAccess;
                cy.request(
                    {
                        method: 'POST',
                        url: '/gists',
                        failOnStatusCode: false,
                        headers: {

                            Accept: 'application/vnd.github+json',
                            Authorization: `Bearer ${authToken}`
                        },
                        body: {
                            description: "test gist gist pub",
                            public: false,
                            files: { "README.md": { "content": "new gist" } }
                        }

                    }

                )
                    .then((response) => {
                        expect(response.status).to.eq(403);
                        expect(response.statusText).to.eq('Forbidden');

                    }

                    )
            });
        })

        it("should not create gist in case of empty content", () => {
            cy.fixture('../fixtures/API Data.json').then((data) => {
                const authToken = data.tokenWithAccess;
                cy.request(
                    {
                        method: 'POST',
                        url: '/gists',
                        failOnStatusCode: false,
                        headers: {

                            Accept: 'application/vnd.github+json',
                            Authorization: `Bearer ${authToken}`
                        },
                        body: {
                            description: "test gist gist pub",
                            public: false,
                            files: { "README.md": { "content": "" } }
                        }

                    }

                )
                    .then((response) => {
                        expect(response.status).to.eq(422);
                        expect(response.statusText).to.eq('Unprocessable Entity');
                    }
                    )
            });
        })
    })
})
