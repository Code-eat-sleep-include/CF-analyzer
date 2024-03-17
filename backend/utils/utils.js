const axios = require('axios')
const client = require('./redis_connection')

function cleanData(problems) {
    let array = []

    for (i of problems) {
        if (i.rating) {
            array.push({
                name: i["name"],
                rating: i["rating"],
                tags: i["tags"]
            })
        }
    }

    return array
}

function fetchAllProblems() {
    return new Promise((resolve, reject) => {
        const url = 'https://codeforces.com/api/problemset.problems';
        axios.get(url)
            .then((results) => {
                const problems = cleanData(results.data.result.problems);
                resolve(problems);
            })
            .catch((err) => {
                console.log(err)
                reject(err);
            })
    })
}

module.exports.cacheAllData = async function() {

    console.log('Caching data');

    const problems = await fetchAllProblems();
    
    for (let i of problems){
        client.set(i.name, JSON.stringify(i));
    }
}

module.exports.getProblems = function(name) {
    return new Promise(async (resolve, reject) => {
        client.mGet(name, (err, obj) => {
            resolve(obj)
        })
    })
}
