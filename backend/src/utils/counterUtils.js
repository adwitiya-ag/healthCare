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