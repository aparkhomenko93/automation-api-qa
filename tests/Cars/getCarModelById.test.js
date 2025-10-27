import {CookieJar} from "tough-cookie";
import {wrapper} from "axios-cookiejar-support";
import axios from "axios";
import {QAAUTO_API_URL} from "../../src/constants/api.js";
import CarsController from "../../src/controllers/CarsController.js";
import {describe, expect, test} from "@jest/globals";
import { z } from "zod";


//Expected schema
const GetModelByIdResponseSchema = z.object({
    status: z.literal("ok"),
    data: z.object({
        id: z.number(),
        carBrandId: z.number(),
        title: z.string(),
    }),
});

describe("Get Car Model by ID tests", () => {
    const jar = new CookieJar();

    const client = wrapper(
        axios.create({
            baseURL: QAAUTO_API_URL,
            validateStatus: () => true,
            jar
        })
    )

    const carsController = new CarsController(client);


    test("Get Car Model by ID - check all models", async () => {
        //Get all models
        const modelsResponse = await carsController.getModels();
        expect(modelsResponse.status).toBe(200);
        const models = modelsResponse.data.data;

        for (const model of models){
            const getModelByIdResponse = await carsController.getCarModelById(model.id);

            expect(getModelByIdResponse.status).toBe(200);

            //Check schema
            GetModelByIdResponseSchema.parse(getModelByIdResponse.data);

            const modelResponse = getModelByIdResponse.data.data;

            //Check data
            expect(modelResponse.id).toBe(model.id);
            expect(modelResponse.carBrandId).toBe(model.carBrandId);
            expect(modelResponse.title).toBe(model.title);
        }

    }, 20000);


    test("Get Car Model by ID - not existing id", async () => {

        const getCarModelByIdResponse = await carsController.getCarModelById(7589437589437534);
        expect(getCarModelByIdResponse.status).toBe(404);

    });

})