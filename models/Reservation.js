const { model, Schema } = require('mongoose');

const reservationSchema = new Schema({
	firstName: String,
	lastName: String,
	createdAt: String,
	time: String,
	remaining: Number,
	user: {
		type: Schema.Types.ObjectId,
		ref: 'users'
	}
});

module.exports = model('Reservation', reservationSchema);
