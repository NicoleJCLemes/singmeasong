import app from "../../src/app.js";
import supertest from "supertest";
import recommendationsFactory from "./factories/recommendationsFactory.js";
import { prisma } from "../../src/database.js";

beforeEach(async () => {
    await prisma.$executeRaw`TRUNCATE TABLE recommendations`;
})

describe("POST /recommendations", () => {
    it("given name and youtube link, create a recommendation (201)", async () => {

        const recommendation = recommendationsFactory.createRecommendation();
        const response = await supertest(app).post("/recommendations").send(recommendation);
        expect(response.status).toEqual(201);

        const isThere = await prisma.recommendation.findFirst({
            where: {
                name: recommendation.name
            }
        });
        expect(isThere.name).toEqual(recommendation.name);
    });

    it("given a duplicate name, get conflict error (409)", async () => {

        const recommendation = recommendationsFactory.createRecommendation();
        await prisma.recommendation.create({
            data: recommendation
        });

        const response = await supertest(app).post("/recommendations").send(recommendation);
        expect(response.status).toEqual(409);
    });

    it("given invalid data, get wrong schema error (422)", async () => {

        const recommendation = recommendationsFactory.createRecommendation();
        const nameResponse = await supertest(app).post("/recommendations").send({...recommendation, name: ""});
        expect(nameResponse.status).toEqual(422);

        const linkResponse = await supertest(app).post("/recommendations").send({...recommendation, youtubeLink: "https://tm.ibxk.com.br/2022/03/15/15161051389203.jpg?ims=1120x420"});
        expect(linkResponse.status).toEqual(422);
    });
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