import { faker } from "@faker-js/faker";

function createRecommendation() {
    const recommendation = {
        name: faker.music.songName(),
        youtubeLink: `www.youtube.com/watch?v=${faker.random.alphaNumeric(10)}`
    }

    return recommendation;
};

function getRecommendation() {
    const recommendation = {
        id: faker.datatype.number(),
        name: faker.music.songName(),
        youtubeLink: `www.youtube.com/watch?v=${faker.random.alphaNumeric(10)}`,
        score: faker.datatype.number()
    }

    return recommendation;
};

const recommendationsFactory = {
    createRecommendation,
    getRecommendation
};

export default recommendationsFactory;