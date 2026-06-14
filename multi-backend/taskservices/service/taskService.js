import Tasks from "../models/task.js";
import * as vectorService from "./vectorService.js";
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

const SECRETE_KEY = process.env.SECRETE_KEY;

function getCreatorId(payload, data = {}, required = true) {
    const creatorId = Number(payload.crid ?? data.createdby);
    if (!Number.isFinite(creatorId) && !required)
        return undefined;
    if (!Number.isFinite(creatorId))
        throw new Error("Your login session is missing a user id. Please logout and login again.");
    return creatorId;
}

function visibleTaskFilter(userId) {
    return {
        $or: [
            { createdby: userId },
            { assignedto: userId }
        ]
    };
}

export async function createTask(data, token) {
    console.log("DATA:", data);
    console.log("TOKEN:", token);
    try {
        const payload = jwt.verify(token, SECRETE_KEY);
        data.createdby = getCreatorId(payload, data);
        data.vector = await vectorService.generateVector(data.title + " " + data.description);
        await Tasks.create(data); //Insert into MongoDB
        return { code: 200, message: "New task has been created" };
    } catch (error) {
        return { code: 500, message: error.message };
    }
}
export async function getAllTasks(page, size, token) {
    let response;

    try {
        const payload = jwt.verify(token, SECRETE_KEY); // Authorization
        const creatorId = getCreatorId(payload, {}, false);
        const currentPage = Number(page);
        const pageSize = Number(size);
        const skip = (currentPage - 1) * pageSize;

        const filter = visibleTaskFilter(creatorId);

        const tasks = await Tasks.find(filter)
            .skip(skip) // Skip records for pagination
            .limit(pageSize) // No of records to be fetched per page
            .sort({ _id: 1 }); // Ascending order by _id (-1 for Descending order)

        const totalrecords = await Tasks.countDocuments(filter);

        response = {
            code: 200,
            page: currentPage,
            size: pageSize,
            totalpages: Math.ceil(totalrecords / pageSize),
            tasks: tasks
        };
    } catch (e) {
        response = {
            code: 500,
            message: e.message
        };
    }

    return response;
}
export async function deleteTask(id, token) {
    let response;
    try {
        const payload = jwt.verify(token, SECRETE_KEY); //Autorization
        const creatorId = getCreatorId(payload, {}, false);

        const task = await Tasks.findOneAndDelete({ _id: id, createdby: creatorId });
        if (!task)
            return { code: 404, message: "Task not found" };

        response = { code: 200, message: "Task has been deleted" };
    } catch (e) {
        response = { code: 500, message: e.message };
    }
    return response;
}

export async function getTask(id, token) {
    try {
        const payload = jwt.verify(token, SECRETE_KEY);
        const creatorId = getCreatorId(payload);
        const task = await Tasks.findOne({ _id: id, ...visibleTaskFilter(creatorId) });

        if (!task)
            return { code: 404, message: "Task not found" };

        return { code: 200, task };
    } catch (e) {
        return { code: 500, message: e.message };
    }
}

export async function updateTask(id, data, token) {
    let response;
    try {
        const payload = jwt.verify(token, SECRETE_KEY); //Autorization  
        const creatorId = getCreatorId(payload, data);
        const { _id, createdby, createdat, updatedat, ...updateData } = data;
        updateData.vector = await vectorService.generateVector(data.title + " " + data.description);

        const task = await Tasks.findOneAndUpdate({ _id: id, createdby: creatorId },
            updateData, { runValidators: true }
        );

        if (!task)
            return { code: 404, message: "Task not found" };

        response = { code: 200, message: "Task has been updated" };
    } catch (e) {
        response = { code: 500, message: e.message };
    }
    return response;
}

//Vector Search
export async function vectorSearch(query, token) {
    let response;
    try {
        const payload = jwt.verify(token, SECRETE_KEY); //Authoeization
        const creatorId = getCreatorId(payload);

        const queryVector = await vectorService.generateVector(query);

        const tasks = await Tasks.find(visibleTaskFilter(creatorId));

        const searchResult = tasks.map(task => {
                const similarity = vectorService.cosineSimilarity(queryVector, task.vector || []);
                console.log(task.title, similarity);
                return {...task._doc, similarity };
            })
            .filter(task => task.similarity > 0.10)
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, 5);

        response = { code: 200, tasks: searchResult };
    } catch (e) {
        response = { code: 500, message: e.message };
    }
    return response;
}
