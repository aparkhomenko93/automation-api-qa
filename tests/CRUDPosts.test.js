import {test, describe, expect} from "@jest/globals";
import axios from "axios";
import {API_URL} from "../src/constants/api";

describe("Test Posts CRUD operations", () => {
    const apiClient = axios.create({baseURL: API_URL});

    //Get post by id test
    test("Get post by Id", async () => {
        const postId = 1;

        const response = await apiClient.get(`/posts/${postId}`);
        expect(response.status).toBe(200);
        expect(response.data).toEqual({
            id: expect.any(Number),
            title: expect.any(String),
            body: expect.any(String),
            userId: expect.any(Number)
            }
        );
    })

    //Get list of posts test
    test("Get list of posts", async () => {
        const response = await apiClient.get(`/posts`);

        //Check that status code is 200
        expect(response.status).toBe(200);

        //Check array in the response
        expect(Array.isArray(response.data)).toBe(true);

        //Check that each element has id and title
        for (const item of response.data) {
            expect(item).toHaveProperty('id');
            expect(item).toHaveProperty('title');
        }
    })

    //Create new post test
    test("Create new post test", async () => {

        const requestBody = {
            title: 'Lorem Ipsum',
            body: 'Lorem ipsum dolor',
            userId: 1,
        }
        const response = await apiClient.post(`/posts`, requestBody);

        expect(response.status).toBe(201);

        expect(response.data).toEqual({
            id: expect.any(Number),
            ...requestBody
            });
    })

    //Update existing post test
    test("Update existing post test", async () => {
        const postId = 1;

        const requestBody = {
            title: 'Updated title',
            body: 'Updated body',
            userId: 1,
        }
        const response = await apiClient.put(`/posts/${postId}`, requestBody);

        expect(response.status).toBe(200);

        expect(response.data).toEqual({
            id: expect.any(Number),
            ...requestBody
        });
    })

    //Partially update the existing post test
    test("Partially update the existing post test", async () => {
        const postId = 1;
        const newTitle = 'foo123';

        const response = await apiClient.put(`/posts/${postId}`, {title: newTitle});

        expect(response.status).toBe(200);

        //Check that title is updated
        expect(response.data).toHaveProperty("title", newTitle);

    })

    //Delete post test
    test("Delete post test", async () => {
        const postId = 1;

        const response = await apiClient.delete(`/posts/${postId}`);

        //Check that status code is 200
        expect(response.status).toBe(200); //But usually we should expect 204

        //Check that response is empty
        expect(response.data).toEqual({})
    })
})