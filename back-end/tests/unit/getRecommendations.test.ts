import { recommendationService } from "../../src/services/recommendationsService.js";
import { jest } from "@jest/globals";
import { recommendationRepository } from "../../src/repositories/recommendationRepository.js";
import { prisma } from "../../src/database.js";
import { faker } from "@faker-js/faker";

jest.mock("../../src/repositories/recommendationRepository");

beforeEach(async () => {
    await prisma.$executeRaw`TRUNCATE TABLE recommendations`;
});

describe("GET /recommendations", () => {
    it("receive recommendations", async () => {
        const receivedRecommendations = [];
        for(let i = 0; i < 10; i++) {
            receivedRecommendations.push({
                id: faker.datatype.number(),
                name: faker.music.songName(),
                youtubeLink: `www.youtube.com/watch?v=${faker.random.alphaNumeric(10)}`,
                score: faker.datatype.number()
            });
        };
        
        jest.spyOn(recommendationRepository, "findAll").mockImplementationOnce(():any => {
            return receivedRecommendations;
        });

        const recommendations = await recommendationService.get()

        expect(recommendations.length).toBeLessThanOrEqual(10)
    });
});

describe("GET /recommendations/top/:amount", () => {
    it("get top 'amount' recommendations", async () => {
        const topRecommendations = [];
        const amount = 4;
        for(let i = 0; i < amount; i++) {
            topRecommendations.push({
                id: faker.datatype.number(),
                name: faker.music.songName(),
                youtubeLink: `www.youtube.com/watch?v=${faker.random.alphaNumeric(10)}`,
                score: faker.datatype.number()
            });
        };

        jest.spyOn(recommendationRepository, "getAmountByScore").mockImplementationOnce(():any => {
            return topRecommendations;
        });

        const recommendations = await recommendationService.getTop(amount);

        expect(recommendations.length).toEqual(4);
    });
});

describe("GET /recommendations/random", () => {
    it("get random recommendations (random > 0.7)", async () => {
        jest.spyOn(Math, "random").mockImplementationOnce(():any => {
            return 0.8
        });

        jest.spyOn(recommendationRepository, "findAll").mockImplementationOnce(():any => {
            return [{
                id: faker.datatype.number(),
                name: faker.music.songName(),
                youtubeLink: `www.youtube.com/watch?v=${faker.random.alphaNumeric(10)}`,
                score: faker.datatype.number({min: 11})
            }, {
                id: faker.datatype.number(),
                name: faker.music.songName(),
                youtubeLink: `www.youtube.com/watch?v=${faker.random.alphaNumeric(10)}`,
                score: faker.datatype.number({min: 11})
            }, {
                id: faker.datatype.number(),
                name: faker.music.songName(),
                youtubeLink: `www.youtube.com/watch?v=${faker.random.alphaNumeric(10)}`,
                score: faker.datatype.number({min: 11})
            }]
        });

        const recommendation = await recommendationService.getRandom();
        expect(recommendation).toHaveProperty("name");
    });

    it("get random recommendations (random < 0.7)", async () => {
        jest.spyOn(Math, "random").mockImplementationOnce(():any => {
            return 0.6
        });

        jest.spyOn(recommendationRepository, "findAll").mockImplementationOnce(():any => {
            return [{
                id: faker.datatype.number(),
                name: faker.music.songName(),
                youtubeLink: `www.youtube.com/watch?v=${faker.random.alphaNumeric(10)}`,
                score: faker.datatype.number({max: 10})
            }, {
                id: faker.datatype.number(),
                name: faker.music.songName(),
                youtubeLink: `www.youtube.com/watch?v=${faker.random.alphaNumeric(10)}`,
                score: faker.datatype.number({max: 10})
            }]
        });

        const recommendation = await recommendationService.getRandom();
        expect(recommendation).toHaveProperty("name");
    });

    it("recommendations not found", async () => {
        jest.spyOn(Math, "random").mockImplementationOnce(():any => {
            return 0.7
        });

        jest.spyOn(recommendationRepository, "findAll").mockImplementationOnce(():any => {
            return []
        });

        jest.spyOn(recommendationRepository, "findAll").mockImplementationOnce(():any => {
            return []
        });

        expect(recommendationService.getRandom()).rejects.toEqual({type: "not_found", message: ""});
    });
});