function generateCoordinates() {
    return [Math.floor(Math.random() * 98 + 1), Math.floor(Math.random() * 98 + 1)]
}

function calculateScores() {
    return 'Eve wins'
}

const MAX_SCORE = 30

module.exports = {
    generateCoordinates,
    calculateScores,
    MAX_SCORE
}