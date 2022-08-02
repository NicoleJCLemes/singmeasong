import app from "../../src/app.js";
import supertest from "supertest";
import recommendationsFactory from "./factories/recommendationsFactory.js";
import { prisma } from "../../src/database.js";
import { faker } from "@faker-js/faker";

beforeEach(async () => {
    await prisma.$executeRaw`TRUNCATE TABLE recommendations`;
});

describe("GET /recommendations", () => {
    it("get 10 recommendations (200)", async () => {
        const tenRecommendations = [];
        for(let i = 0; i < 10; i++) {
            tenRecommendations.push(recommendationsFactory.createRecommendation());
        };

        await prisma.recommendation.createMany({
            data: tenRecommendations
        });

        const response = await supertest(app).get("/recommendations");

        expect(response.status).toEqual(200);
        expect(response.body.length).toBeLessThanOrEqual(10); 
    });
});

describe("GET /recommendations/:id", () => {
    it("get recommendation by id (200)", async () => {
        const newRecommendationData = recommendationsFactory.createRecommendation();
        await prisma.recommendation.create({
            data: newRecommendationData
        });

        const recommendation = await prisma.recommendation.findFirst({
            where: {
                name: newRecommendationData.name
            }
        });

        const response = await supertest(app).get(`/recommendations/${recommendation.id}`);

        expect(response.status).toEqual(200);
        expect(response.body).toHaveProperty("name");
    });

    it("recommendation id not found (404)", async () => {
        const id = faker.datatype.number({max: 10});
        const response = await supertest(app).get(`/recommendations/${id}`);
        expect(response.status).toEqual(404);
    });
});

describe("GET /recommendations/random", () => {
    it("get random recommendations (200)", async () => {
        const tenRecommendations = [];
        for(let i = 0; i < 10; i++) {
            tenRecommendations.push(recommendationsFactory.createRecommendation());
        };

        await prisma.recommendation.createMany({
            data: tenRecommendations
        });

        const response = await supertest(app).get("/recommendations/random");

        expect(response.status).toEqual(200);
        expect(response.body).toHaveProperty("name");
    });

    it("recommendations not found (404)", async () => {
        const response = await supertest(app).get("/recommendations/random");
        expect(response.status).toEqual(404);
    });
});

describe("GET /recommendations/top/:amount", () => {
    it("get 'amount' recommendations order by bigger score (200)", async () => {
        const tenRecommendations = [];
        for(let i = 0; i < 10; i++) {
            tenRecommendations.push({...recommendationsFactory.createRecommendation(), score: i+1});
        };

        await prisma.recommendation.createMany({
            data: tenRecommendations
        });

        const amount = 5;
        const response = await supertest(app).get(`/recommendations/top/${amount}`);

        expect(response.status).toEqual(200);
        expect(response.body.length).toBeLessThanOrEqual(5); 
        expect(response.body[0].score).toBeGreaterThan(response.body[1].score);
    });
});

afterAll(async () => {
    await prisma.$disconnect();
});