var mongoose = require('mongoose');

// Create the MovieSchema.
var UniversitySchema = new mongoose.Schema({
    title: {
        type: String
        , required: true
    }
    , url: {
        type: String
        , required: true
    }
});

// Export the model.
module.exports = mongoose.model('university', UniversitySchema);