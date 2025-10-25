import BaseController from "./BaseController.js";

export default class CarsController extends BaseController{

    getBrands(){
        return this.client.get("/api/cars/brands");
    }

    getCarBrandById(id){
        return this.client.get(`/api/cars/brands/${id}`);
    }

    getModels(){
        return this.client.get("/api/cars/models");
    }

    getCarModelById(id){
        return this.client.get(`/api/cars/models/${id}`);
    }

    postCar(carData){
        return this.client.post("/api/cars", carData);
    }

    getCars(){
        return this.client.get(`/api/cars`);
    }

    getCarById(id){
        return this.client.get(`/api/cars/${id}`);
    }

    putCarById(id, carData){
        return this.client.put(`/api/cars/${id}`, carData);
    }

    deleteCarById(id){
        return this.client.delete(`/api/cars/${id}`);
    }
}