import { recommendationService } from "../../src/services/recommendationsService.js";
import { jest } from "@jest/globals";
import { recommendationRepository } from "../../src/repositories/recommendationRepository.js";
import { prisma } from "../../src/database.js";
import { faker } from "@faker-js/faker";

jest.mock("../../src/repositories/recommendationRepository.js");

beforeEach(async () => {
    await prisma.$executeRaw`TRUNCATE TABLE recommendations`;
});

describe("POST /recommendations/:id/upvote", () => {

    it("id not found", async () => {

        jest.spyOn(recommendationRepository, "find").mockImplementationOnce(():any => {
            return {}
        });

        const data = {
            id: faker.datatype.number(),
            name: faker.music.songName(),
            youtubeLink: `www.youtube.com/watch?v=${faker.random.alphaNumeric(10)}`,
            score: faker.datatype.number()
        };

        await recommendationService.getById(data.id);

        expect(recommendationService.getById(data.id)).rejects.toEqual({type: "not_found", message: ""});
    });

    it("upvote", async () => {

        const data = {
            id: faker.datatype.number(),
            name: faker.music.songName(),
            youtubeLink: `www.youtube.com/watch?v=${faker.random.alphaNumeric(10)}`,
            score: faker.datatype.number()
        };

        jest.spyOn(recommendationRepository, "find").mockImplementationOnce(():any => {
            return data
        });

        jest.spyOn(recommendationService, "getById").mockImplementationOnce(():any => {
            return data
        });

        jest.spyOn(recommendationRepository, "updateScore").mockImplementationOnce(():any => {
            return {}
        });

        await recommendationService.upvote(data.id);

        expect(recommendationRepository.updateScore).toBeCalled();

    });
});
    describe("POST /recommendations/:id/downvote", () => {    

        it("downvote", async () => {
            
            const data = {
                id: faker.datatype.number(),
                name: faker.music.songName(),
                youtubeLink: `www.youtube.com/watch?v=${faker.random.alphaNumeric(10)}`,
                score: (-1)*faker.datatype.number({min: 6})
            };

            jest.spyOn(recommendationRepository, "find").mockImplementationOnce(():any => {
                return data
            });

            jest.spyOn(recommendationService, "getById").mockImplementationOnce(():any => {
                return data
            });

            jest.spyOn(recommendationRepository, "updateScore").mockImplementationOnce(():any => {
                return data
            });

            jest.spyOn(recommendationRepository, "remove").mockImplementationOnce(():any => {
                return {}
            });

            await recommendationService.downvote(data.id);

            expect(recommendationRepository.remove).toBeCalled();

        });
    })