import { Counter } from "../models/counter.model.js";

export const generateEmployeeId = async () => {
    const counter = await Counter.findOneAndUpdate(
        { _id: "employeeId" },
        { $inc: { sequenceValue: 1 } },
        { new: true, upsert: true }
    );
    return `EMP${String(counter.sequenceValue).padStart(4, "0")}`;
};

export const generateRegNo = async () => {
    const counter = await Counter.findOneAndUpdate(
        { _id: "regNo" },
        { $inc: { sequenceValue: 1 } },
        { new: true, upsert: true }
    );
    return `REG${String(counter.sequenceValue).padStart(4, "0")}`;
};

export const generateCityCode = async () => {
    const counter = await Counter.findOneAndUpdate(
        { _id: "cityCode" },
        { $inc: { sequenceValue: 1 } },
        { new: true, upsert: true }
    );
    return `CTY${String(counter.sequenceValue).padStart(4, "0")}`;
};

export const generateAreaCode = async () => {
    const counter = await Counter.findOneAndUpdate(
        { _id: "areaCode" },
        { $inc: { sequenceValue: 1 } },
        { new: true, upsert: true }
    );
    return `ARE${String(counter.sequenceValue).padStart(4, "0")}`;
};

export const generateDoctorId = async () => {
    const counter = await Counter.findOneAndUpdate(
        { _id: "doctorId" },
        { $inc: { sequenceValue: 1 } },
        { new: true, upsert: true }
    );
    return `DR${String(counter.sequenceValue).padStart(4, "0")}`;
};

export const generateChemistId = async () => {
    const counter = await Counter.findOneAndUpdate(
        { _id: "chemistId" },
        { $inc: { sequenceValue: 1 } },
        { new: true, upsert: true }
    );
    return `CH${String(counter.sequenceValue).padStart(4, "0")}`;
};