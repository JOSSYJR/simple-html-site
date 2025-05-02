import express from 'express'
import axios from 'axios';
import cors from 'cors';

const app = express()
const cache: { data: Comment[]; expiry: number } = {data: [], expiry: 0};

app.use(cors({
    origin: '*',
}));

// TODO: update this so it makes a request to https://jsonplaceholder.typicode.com/comments?postId=3
// and it returns a list of comments that match what the user entered
// Bonus: cache results in memory for 5 mins
app.get('/', async (req, res) => {
    const queryString = req.query.queryString as string;


    if (!queryString) {
        res.status(400).send("queryString is required");
    }

    const result = await fetchCommentsWithCache();

    if (result !== null) {
        const regex = new RegExp(queryString, 'i'); // Create a case-insensitive regex
        const filteredSuggestions = result.filter((comment) => regex.test(comment.name));

        // Sort suggestions based on the position of the match
        const sortedSuggestions = filteredSuggestions.sort((a, b) => {
            const aIndex = a.name.toLowerCase().indexOf(queryString.toLowerCase());
            const bIndex = b.name.toLowerCase().indexOf(queryString.toLowerCase());
            return aIndex - bIndex; // Prioritize matches that occur earlier
        });



        console.log(sortedSuggestions.map((coment)=> coment.name));
        res.send(sortedSuggestions.map((comment) => comment.name));
    }
    else {
        res.status(500).send("Search failed due to an error");
    }
});
app.listen(3001, () => {
    console.log('Server is running on port 3001')
})


async function fetchCommentsWithCache(): Promise<Comment[] | null> {
    const cacheDuration = 5 * 60 * 1000; // 5 minutes in milliseconds
    const url = 'https://jsonplaceholder.typicode.com/comments?postId=3';

    // I usually use something like redis for caching but for this example we will use a simple custom in memory cache
    // Check if cached data is still valid
    if (cache.data && Date.now() < cache.expiry) {
        return cache.data;
    }

    try {
        const response = await axios.get(url);
        cache.data = response.data as Comment[]; // Cache the response data
        cache.expiry = Date.now() + cacheDuration; // Set cache expiry
        return cache.data;
    } catch (error) {
        console.error('Error fetching comments:', error);
        throw error;
    }
}


type Comment = {
    postId: number,
    id: number,
    name: string,
    email: string,
    body: string
}

