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


describe("Update User Car tests", ()=>{
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
            "email": `test123+${faker.number.int({min: 10, max: 9999999})}@example100500.com`,
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


    test("Update user's car test", async () => {
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

        //Check created car by ID
        const getCarById = await carsController.getCarById(createdCar.id);
        expect(getCarById.status).toBe(200);
        expect(getCarById.data.data).toEqual(expectedCarData);
        expect(moment(timeBeforeCarCreated).diff(moment(createdCar.carCreatedAt), "minute")).toBeLessThanOrEqual(1);
        expect(moment(timeBeforeCarCreated).diff(moment(createdCar.updatedMileageAt), "minute")).toBeLessThanOrEqual(1);

        //Preparation of test data for PUT request
        const carBrandUpdated = getRandomItem(carBrandsResponse.data.data);
        const carModelUpdated = getRandomItem(carModelsResponse.data.data.filter(model => model.carBrandId === carBrandUpdated.id));

        const updatedCarRequestBody = {
            carBrandId: carBrandUpdated.id,
            carModelId: carModelUpdated.id,
            mileage: faker.number.int({min: createdCar.mileage, max: 999999})
        }

        const updatedCarExpectedData = {
            "id": createdCar.id,
            "carBrandId": carBrandUpdated.id,
            "carModelId": carModelUpdated.id,
            "initialMileage": requestBody.mileage,
            "updatedMileageAt": expect.any(String),
            "carCreatedAt": expect.any(String),
            "mileage": updatedCarRequestBody.mileage,
            "brand": carBrandUpdated.title,
            "model": carModelUpdated.title,
            "logo": carBrandUpdated.logoFilename
        }

        //Update car
        const updatedCarResponse = await carsController.putCarById(createdCar.id, updatedCarRequestBody);
        expect(updatedCarResponse.status).toBe(200);
        expect(updatedCarResponse.data.data).toEqual(updatedCarExpectedData);

    });

    test("Put car - try to update not existing car", async () => {

        const carBrandsResponse = await carsController.getBrands();
        expect(carBrandsResponse.status).toBe(200);
        const carBrand = getRandomItem(carBrandsResponse.data.data);

        const carModelsResponse = await carsController.getModels();
        expect(carModelsResponse.status).toBe(200);
        const carModel = getRandomItem(carModelsResponse.data.data.filter(model => model.carBrandId === carBrand.id));

        const updateCarResponse = await carsController.putCarById(5435435, {
            carBrandId: carBrand.id,
            carModelId: carModel.id,
            mileage: faker.number.int({min: 0, max: 999999})});
        expect(updateCarResponse.status).toBe(404);

    })


    test("Update user's car test - update with lower mileage", async () => {
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

        //Check created car by ID
        const getCarById = await carsController.getCarById(createdCar.id);
        expect(getCarById.status).toBe(200);
        expect(getCarById.data.data).toEqual(expectedCarData);
        expect(moment(timeBeforeCarCreated).diff(moment(createdCar.carCreatedAt), "minute")).toBeLessThanOrEqual(1);
        expect(moment(timeBeforeCarCreated).diff(moment(createdCar.updatedMileageAt), "minute")).toBeLessThanOrEqual(1);

        //Preparation of test data for PUT request
        const carBrandUpdated = getRandomItem(carBrandsResponse.data.data);
        const carModelUpdated = getRandomItem(carModelsResponse.data.data.filter(model => model.carBrandId === carBrandUpdated.id));

        const updatedCarRequestBody = {
            carBrandId: carBrandUpdated.id,
            carModelId: carModelUpdated.id,
            mileage: faker.number.int({min: 1, max: createdCar.mileage})
        };

        //Update car
        const updatedCarResponse = await carsController.putCarById(createdCar.id, updatedCarRequestBody);
        expect(updatedCarResponse.status).toBe(400);
        expect(updatedCarResponse.data.status).toBe("error");
        expect(updatedCarResponse.data.message).toBe("New mileage is less then previous entry");
    });
})