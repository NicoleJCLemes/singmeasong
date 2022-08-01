import { recommendationService, CreateRecommendationData } from "../../src/services/recommendationsService.js";
import { jest } from "@jest/globals";
import { recommendationRepository } from "../../src/repositories/recommendationRepository.js";
import { prisma } from "../../src/database.js";
import { faker } from "@faker-js/faker";

jest.mock("../../src/repositories/recommendationRepository.js");

beforeEach(async () => {
    await prisma.$executeRaw`TRUNCATE TABLE recommendations`;
});

describe("POST /recommendations", () => {
    it("create recommendation", async () => {
        jest.spyOn(recommendationRepository, "findByName").mockImplementationOnce(():any => {
            return ""
        });
        
        jest.spyOn(recommendationRepository, "create").mockImplementationOnce(():any => {
            return {}
        });

        const data: CreateRecommendationData = {
            name: faker.music.songName(),
            youtubeLink: `www.youtube.com/watch?v=${faker.random.alphaNumeric(10)}`
        }

        await recommendationService.insert(data);

        expect(recommendationRepository.findByName).toBeCalled();
        expect(recommendationRepository.create).toBeCalled();
    });

    it("should not create duplicated recommendation", async () => {
        const data: CreateRecommendationData = {
            name: faker.music.songName(),
            youtubeLink: `www.youtube.com/watch?v=${faker.random.alphaNumeric(10)}`
        };

        jest.spyOn(recommendationRepository, "findByName").mockImplementationOnce(():any => {
            return {
                id: faker.datatype.number(),
                name: data.name,
                youtubeLink: data.youtubeLink,
                score: faker.datatype.number()
            }
        });

        expect(recommendationRepository.findByName).toBeCalled();
        expect(recommendationService.insert(data)).rejects.toEqual({type: "conflict", message: "Recommendations names must be unique"});
    });
});