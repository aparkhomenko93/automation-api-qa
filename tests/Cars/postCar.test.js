import {test, describe, beforeEach, expect} from "@jest/globals";
import { faker } from '@faker-js/faker';
import {getRandomItem} from "../../src/helpers/helpers.js";
import moment from "moment";
import AuthController from "../../src/controllers/AuthController.js";
import CarsController from "../../src/controllers/CarsController.js";
import {CookieJar} from "tough-cookie";
import {wrapper} from "axios-cookiejar-support";
import axios from "axios";
import {QAAUTO_API_URL} from "../../src/constants/api.js";


describe("Create User Car tests", ()=>{
    const jar = new CookieJar();

    const client = wrapper(
        axios.create({
            baseURL: QAAUTO_API_URL,
            validateStatus: () => true,
            jar
        })
    )

    const authController = new AuthController(client);
    const carsController = new CarsController(client);

    beforeEach(async ()=>{
        const userPassword = `Qwerty${faker.number.int({min: 10, max: 9999999})}`;
        const userData = {
            "name": faker.person.firstName(),
            "lastName": faker.person.lastName(),
            "email": faker.internet.email(),
            "password": userPassword,
            "repeatPassword": userPassword
        }

        const signUpResponse = await authController.signUp(userData);
        expect(signUpResponse.status).toBe(201);

        const signInResponse = await authController.signIn({
            email: userData.email,
            password: userData.password,
            rememberMe: false
        });
        expect(signInResponse.status).toBe(200);
    })


    test("Create car test", async () => {
        //Get list of car brands
        const carBrandsResponse = await carsController.getBrands();
        expect(carBrandsResponse.status).toBe(200);
        const carBrand = getRandomItem(carBrandsResponse.data.data);

        //Get list of car models
        const carModelsResponse = await carsController.getModels();
        expect(carModelsResponse.status).toBe(200);
        const carModel = getRandomItem(carModelsResponse.data.data.filter(model => model.carBrandId === carBrand.id));

        const requestBody = {
            carBrandId: carBrand.id,
            carModelId: carModel.id,
            mileage: faker.number.int({min: 0, max: 999999})
        }

        const timeBeforeCarCreated = new Date();

        //Create new car
        const response = await carsController.postCar(requestBody);
        expect(response.status).toBe(201);
        expect(response.data.status).toBe("ok");

        const createdCar = response.data.data;
        const expectedCarData = {
            "id": expect.any(Number),
            "carBrandId": requestBody.carBrandId,
            "carModelId": requestBody.carModelId,
            "initialMileage": requestBody.mileage,
            "updatedMileageAt": expect.any(String), //"2021-05-17T15:26:36.000Z",
            "carCreatedAt": expect.any(String),
            "mileage": requestBody.mileage,
            "brand": carBrand.title,
            "model": carModel.title,
            "logo": carBrand.logoFilename
        }

        expect(createdCar).toEqual(expectedCarData);

        const getCarById = await carsController.getCarById(createdCar.id);
        expect(getCarById.status).toBe(200);
        expect(getCarById.data.data).toEqual(expectedCarData);
        expect(moment(timeBeforeCarCreated).diff(moment(createdCar.carCreatedAt), "minute")).toBeLessThanOrEqual(1);
        expect(moment(timeBeforeCarCreated).diff(moment(createdCar.updatedMileageAt), "minute")).toBeLessThanOrEqual(1);
    });
})