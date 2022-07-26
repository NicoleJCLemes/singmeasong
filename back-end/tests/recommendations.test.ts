import app from "../src/app.js";
import supertest from "supertest";
import recommendationsFactory from "./factories/recommendationsFactory.js";
import { prisma } from "../src/database.js";

beforeEach(async () => {
    await prisma.$executeRaw`DELETE FROM recommendations WHERE name = 'Falamansa - Xote dos Milagres'`;
})

describe("POST /recommendations", () => {
    it("given name and youtube link, create a recommendation", async () => {

        const recommendation = recommendationsFactory.createRecommendation();
        const response = await supertest(app).post("/recommendations").send(recommendation);
        console.log(recommendation, response)
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

afterAll(async () => {
    await prisma.$disconnect();
});