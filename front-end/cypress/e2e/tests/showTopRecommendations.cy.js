/// <reference types="cypress" />

describe("show top recommendations suit test", () => {
    it("get top recommendations", () => {
        
        cy.visit("http://localhost:3000/");

        cy.intercept("GET", `http://localhost:5000/recommendations`).as("showRecommendations");
        cy.wait("@showRecommendations");

        cy.intercept("GET", `http://localhost:5000/recommendations/top/10`).as("showTop5Recommendations");
        cy.contains('Top').click();
        cy.wait("@showTop5Recommendations");

        cy.url().should("equal", `http://localhost:3000/top`)
    });
});