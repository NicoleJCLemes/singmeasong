/// <reference types="cypress" />

import { faker } from "@faker-js/faker";

describe("create recommendation suit test", () => {
    it("given name and youtube link, create a recommendation", () => {
        const recommendation = {
            name: faker.random.words(5),
            youtubeLink: `www.youtube.com/watch?v=${faker.random.alphaNumeric(10)}`
        };

        cy.visit("http://localhost:3000/");

        cy.get('input[placeholder="Name"]').type(recommendation.name);
        cy.get('input[placeholder="https://youtu.be/..."]').type(recommendation.youtubeLink);

        cy.intercept("POST", "http://localhost:5000/").as("createRecommendation");
        cy.get('#create').click();
        cy.wait("@createRecommendation");
        
        cy.contains(recommendation.name).should("be.visible");
    })
})