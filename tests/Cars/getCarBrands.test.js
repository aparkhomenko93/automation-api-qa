import {describe, expect, test} from "@jest/globals";
import {wrapper} from "axios-cookiejar-support";
import axios from "axios";
import {QAAUTO_API_URL} from "../../src/constants/api.js";
import CarsController from "../../src/controllers/CarsController.js";
import {CookieJar} from "tough-cookie";
import { z } from "zod";


describe("Get Car Brands tests", () => {
    const jar = new CookieJar();

    const client = wrapper(
        axios.create({
            baseURL: QAAUTO_API_URL,
            validateStatus: () => true,
            jar
        })
    )

    const carsController = new CarsController(client);

    test("Get Car Brands - check response", async () => {
        const carBrandsResponse = await carsController.getBrands();
        expect(carBrandsResponse.status).toBe(200);

        expect(carBrandsResponse.data.data[0]).toMatchObject({
            id: expect.any(Number),
            title: expect.any(String),
            logoFilename: expect.any(String),
        });
    });

    test("Get Car Brands - check response schema", async () => {

        //Expected response schema
        const GetBrandsResponseSchema = z.object({
            status: z.literal("ok"),
            data: z.array(z.object({
                id: z.number(),
                title: z.string(),
                logoFilename: z.string(),
            })),
        });

        const carBrandsResponse = await carsController.getBrands();
        expect(carBrandsResponse.status).toBe(200);

        //Check get cars response schema
        GetBrandsResponseSchema.parse(carBrandsResponse.data);
    })

})