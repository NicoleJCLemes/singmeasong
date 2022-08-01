import { CreateRecommendationData, recommendationService } from "../../src/services/recommendationsService.js";
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
        jest.spyOn(recommendationRepository, "findAll").mockImplementationOnce(():any => {
            return [{
                id: faker.datatype.number(),
                name: faker.music.songName(),
                youtubeLink: `www.youtube.com/watch?v=${faker.random.alphaNumeric(10)}`,
                score: faker.datatype.number()
            }, {
                id: faker.datatype.number(),
                name: faker.music.songName(),
                youtubeLink: `www.youtube.com/watch?v=${faker.random.alphaNumeric(10)}`,
                score: faker.datatype.number()
            }, {
                id: faker.datatype.number(),
                name: faker.music.songName(),
                youtubeLink: `www.youtube.com/watch?v=${faker.random.alphaNumeric(10)}`,
                score: faker.datatype.number()
            }, {
                id: faker.datatype.number(),
                name: faker.music.songName(),
                youtubeLink: `www.youtube.com/watch?v=${faker.random.alphaNumeric(10)}`,
                score: faker.datatype.number()
            }]
        });

        const recommendations = await recommendationService.get()

        expect(recommendations.length).toBeLessThanOrEqual(10)
    });
});

describe("GET /recommendations/top/:amount", () => {
    it("", async () => {
        jest.spyOn(recommendationRepository, "getAmountByScore").mockImplementationOnce(():any => {
            return [{
                id: faker.datatype.number(),
                name: faker.music.songName(),
                youtubeLink: `www.youtube.com/watch?v=${faker.random.alphaNumeric(10)}`,
                score: faker.datatype.number()
            }, {
                id: faker.datatype.number(),
                name: faker.music.songName(),
                youtubeLink: `www.youtube.com/watch?v=${faker.random.alphaNumeric(10)}`,
                score: faker.datatype.number()
            }, {
                id: faker.datatype.number(),
                name: faker.music.songName(),
                youtubeLink: `www.youtube.com/watch?v=${faker.random.alphaNumeric(10)}`,
                score: faker.datatype.number()
            }, {
                id: faker.datatype.number(),
                name: faker.music.songName(),
                youtubeLink: `www.youtube.com/watch?v=${faker.random.alphaNumeric(10)}`,
                score: faker.datatype.number()
            }]
        });

        const recommendations = await recommendationService.getTop(4);

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
                score: faker.datatype.number()
            }, {
                id: faker.datatype.number(),
                name: faker.music.songName(),
                youtubeLink: `www.youtube.com/watch?v=${faker.random.alphaNumeric(10)}`,
                score: faker.datatype.number()
            }, {
                id: faker.datatype.number(),
                name: faker.music.songName(),
                youtubeLink: `www.youtube.com/watch?v=${faker.random.alphaNumeric(10)}`,
                score: faker.datatype.number()
            }, {
                id: faker.datatype.number(),
                name: faker.music.songName(),
                youtubeLink: `www.youtube.com/watch?v=${faker.random.alphaNumeric(10)}`,
                score: faker.datatype.number()
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
                score: faker.datatype.number()
            }, {
                id: faker.datatype.number(),
                name: faker.music.songName(),
                youtubeLink: `www.youtube.com/watch?v=${faker.random.alphaNumeric(10)}`,
                score: faker.datatype.number()
            }]
        });

        const recommendation = await recommendationService.getRandom();
        expect(recommendation).toHaveProperty("name");
    });

    it("recommendation not found", async () => {
        jest.spyOn(Math, "random").mockImplementationOnce(():any => {
            return 0.7
        });

        jest.spyOn(recommendationRepository, "findAll").mockImplementationOnce(():any => {
            return []
        });

        expect(recommendationService.getRandom()).rejects.toEqual({type: "not_found", message: ""});
    });
});