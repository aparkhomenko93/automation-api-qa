import {CookieJar} from "tough-cookie";
import {wrapper} from "axios-cookiejar-support";
import axios from "axios";
import {QAAUTO_API_URL} from "../../src/constants/api.js";
import CarsController from "../../src/controllers/CarsController.js";
import {describe, expect, test} from "@jest/globals";
import { z } from "zod";


//Expected schema
const GetBrandByIdResponseSchema = z.object({
    status: z.literal("ok"),
    data: z.object({
        id: z.number(),
        title: z.string(),
        logoFilename: z.string(),
    }),
});

describe("Get Car Brand by ID tests", () => {
    const jar = new CookieJar();

    const client = wrapper(
        axios.create({
            baseURL: QAAUTO_API_URL,
            validateStatus: () => true,
            jar
        })
    )

    const carsController = new CarsController(client);


    test("Get Car Brand by ID - check all brands", async () => {
        //Get all brands
        const brandsResponse = await carsController.getBrands();
        expect(brandsResponse.status).toBe(200);
        const brands = brandsResponse.data.data;

        for (const brand of brands){
            const getBrandByIdResponse = await carsController.getCarBrandById(brand.id);

            expect(getBrandByIdResponse.status).toBe(200);

            //Check schema
            GetBrandByIdResponseSchema.parse(getBrandByIdResponse.data);

            const brandResponse = getBrandByIdResponse.data.data;

            //Check data
            expect(brandResponse.id).toBe(brand.id);
            expect(brandResponse.title).toBe(brand.title);
            expect(brandResponse.logoFilename).toBe(brand.logoFilename);
        }

    });


    test("Get Car Brand by ID - not existing id", async () => {

        const getCarBrandByIdResponse = await carsController.getCarBrandById(7589437589437534);
        expect(getCarBrandByIdResponse.status).toBe(404);

    });

})