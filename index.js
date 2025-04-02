const express = require("express");
const axios = require("axios");
require("dotenv").config();

const app = express();
const PORT = 9876;
const WINDOW_SIZE = 10;
const numberStore = [];

const API_URLS = {
    p: process.env.API_PRIME,
    f: process.env.API_FIBO,
    e: process.env.API_EVEN,
    r: process.env.API_RANDOM
};

app.get("/numbers/:numberid", async (req, res) => {
    const { numberid } = req.params;
    if (!API_URLS[numberid]) {
        return res.status(400).json({ error: "Invalid number ID" });
    }

    try {
        const response = await axios.get(API_URLS[numberid], {
            timeout: 500,
            headers: {
                'Authorization': `Bearer ${process.env.API_TOKEN}`
            }
        });

        const numbers = response.data.numbers;
        const uniqueNumbers = [...new Set(numbers)];
        numberStore.push(...uniqueNumbers);

        while (numberStore.length > WINDOW_SIZE) {
            numberStore.shift();
        }

        const avg = numberStore.reduce((sum, num) => sum + num, 0) / numberStore.length;

        return res.json({
            windowPrevState: numberStore.slice(0, -uniqueNumbers.length),
            windowCurrState: [...numberStore],
            numbers,
            avg: parseFloat(avg.toFixed(2))
        });

    } catch (error) {
        console.error("Axios error:", error.response ? error.response.data : error.message);
        res.status(500).json({ error: "Failed to fetch numbers", details: error.message });
    }
});

app.get("/health", (req, res) => {
    res.status(200).json({ status: "UP", windowSize: WINDOW_SIZE, storedNumbers: numberStore.length });
});

app.listen(PORT, () => {
    console.log(`Microservice running on port ${PORT}`);
});
