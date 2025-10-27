import {test, describe, beforeEach, expect} from "@jest/globals";
import { faker } from '@faker-js/faker';
import {getRandomItem} from "../../src/helpers/helpers.js";
import AuthController from "../../src/controllers/AuthController.js";
import CarsController from "../../src/controllers/CarsController.js";
import {CookieJar} from "tough-cookie";
import {wrapper} from "axios-cookiejar-support";
import axios from "axios";
import {QAAUTO_API_URL} from "../../src/constants/api.js";


describe("Get User Car by Id tests", ()=>{
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


    test("Get User Car by ID", async () => {
        //Create and remember cars for user
        const carBrandsResponse = await carsController.getBrands();
        expect(carBrandsResponse.status).toBe(200);
        const carBrand = getRandomItem(carBrandsResponse.data.data);

        const carModelsResponse = await carsController.getModels();
        expect(carModelsResponse.status).toBe(200);
        const carModel = getRandomItem(
            carModelsResponse.data.data.filter(m => m.carBrandId === carBrand.id)
        );


        const usersCars = Array.from({ length: 3 }).map(() => ({
            carBrandId: carBrand.id,
            carModelId: carModel.id,
            mileage: faker.number.int({ min: 0, max: 999999 })
        }));

        const createdCars = [];

        for (const car of usersCars) {
            const response = await carsController.postCar(car);
            expect(response.status).toBe(201);
            createdCars.push(response.data.data); // сохраняем car с id
        }

        //Get each user car by id
        for (const createdCar of createdCars) {
            const getUserCarByIdResponse = await carsController.getCarById(createdCar.id);
            expect(getUserCarByIdResponse.status).toBe(200);

            const fetchedCar = getUserCarByIdResponse.data.data;

            expect(fetchedCar.id).toBe(createdCar.id);
            expect(fetchedCar.carBrandId).toBe(createdCar.carBrandId);
            expect(fetchedCar.carModelId).toBe(createdCar.carModelId);
            expect(fetchedCar.mileage).toBe(createdCar.mileage);
        }
    });

    test("Get User Car by ID - check response for unexisting car", async () => {

        const getUserCarByIdResponse = await carsController.getCarById(543254354235);
        expect(getUserCarByIdResponse.status).toBe(400);

    });
})