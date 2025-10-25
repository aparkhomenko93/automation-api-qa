import {describe, expect, test} from "@jest/globals";
import {CookieJar} from "tough-cookie";
import {wrapper} from "axios-cookiejar-support";
import axios from "axios";
import {QAAUTO_API_URL} from "../../src/constants/api.js";
import CarsController from "../../src/controllers/CarsController.js";
import {z} from "zod";


describe("Get Car Models tests", () => {
    const jar = new CookieJar();

    const client = wrapper(
        axios.create({
            baseURL: QAAUTO_API_URL,
            validateStatus: () => true,
            jar
        })
    );

    const carsController = new CarsController(client);

    test("Get Car Models - check response", async () => {
        const carModelsResponse = await carsController.getModels();
        expect(carModelsResponse.status).toBe(200);
        expect(carModelsResponse.data.data[0]).toMatchObject({
            id: expect.any(Number),
            carBrandId: expect.any(Number),
            title: expect.any(String),
        });
    });

    test("Get Car Models - check response schema", async () => {

        //Expected response schema
        const GetBrandsResponseSchema = z.object({
            status: z.literal("ok"),
            data: z.array(z.object({
                id: z.number(),
                carBrandId: z.number(),
                title: z.string(),
            })),
        });

        const carModelsResponse = await carsController.getModels();
        expect(carModelsResponse.status).toBe(200);

        //Check get cars response schema
        GetBrandsResponseSchema.parse(carModelsResponse.data);
    })

    test("Get Car Models - check that models are related to brands", async () => {

        const brandsResponse = await carsController.getBrands();
        const modelsResponse = await carsController.getModels();

        expect(brandsResponse.status).toBe(200);
        expect(modelsResponse.status).toBe(200);

        //Check that brand from each model exists
        const brandIds = new Set(brandsResponse.data.data.map(b => b.id));
        for (const model of modelsResponse.data.data) {
            expect(brandIds.has(model.carBrandId)).toBe(true);
        }
    })
})