import app from "../../src/app.js";
import supertest from "supertest";
import recommendationsFactory from "./factories/recommendationsFactory.js";
import { prisma } from "../../src/database.js";

beforeEach(async () => {
    await prisma.$executeRaw`TRUNCATE TABLE recommendations`;
});

describe("POST /recommendations/:id/upvote", () => {
    it("add a score (200)", async () => {
        const newRecommendationData = recommendationsFactory.createRecommendation();
        await prisma.recommendation.create({
            data: newRecommendationData
        });

        const recommendation = await prisma.recommendation.findFirst({
            where: {
                name: newRecommendationData.name
            }
        });

        const response = await supertest(app).post(`/recommendations/${recommendation.id}/upvote`);

        const votedRecommendation = await prisma.recommendation.findFirst({
            where: {
                name: newRecommendationData.name
            }
        });

        expect(response.status).toEqual(200);
        expect(votedRecommendation.score).toEqual(recommendation.score+1);
    });

    it("recommendation not found (404)", async () => {
        const recommendation = recommendationsFactory.getRecommendation();
        const response = await supertest(app).post(`/recommendations/${recommendation.id}/upvote`);
        
        expect(response.status).toEqual(404);
    });
});

describe("POST /recommendations/:id/downvote", () => {
    it("decrease a score (200)", async () => {
        const newRecommendationData = recommendationsFactory.createRecommendation();
        await prisma.recommendation.create({
            data: newRecommendationData
        });

        const recommendation = await prisma.recommendation.findFirst({
            where: {
                name: newRecommendationData.name
            }
        });

        const response = await supertest(app).post(`/recommendations/${recommendation.id}/downvote`);

        const votedRecommendation = await prisma.recommendation.findFirst({
            where: {
                name: newRecommendationData.name
            }
        });

        expect(response.status).toEqual(200);
        expect(votedRecommendation.score).toEqual(recommendation.score-1);
    });

    it("delete a recommendation (200)", async () => {
        const newRecommendationData = recommendationsFactory.createRecommendation();
        await prisma.recommendation.create({
            data: newRecommendationData
        });

        const recommendation = await prisma.recommendation.findFirst({
            where: {
                name: newRecommendationData.name
            }
        });

        await prisma.recommendation.update({
            where: { id: recommendation.id },
            data: { score: -5 }
        })

        const response = await supertest(app).post(`/recommendations/${recommendation.id}/downvote`);

        const deletedRecommendation = await prisma.recommendation.findFirst({
            where: {id: recommendation.id}
        });

        expect(response.status).toEqual(200);
        expect(deletedRecommendation).toEqual(null);
    });
});

afterAll(async () => {
    await prisma.$disconnect();
});