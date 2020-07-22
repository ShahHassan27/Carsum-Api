const usersResolvers = require('./users');
const reservationsResolvers = require('./reservations');

module.exports = {
	Query: {
		...reservationsResolvers.Query
	},
	Mutation: {
		...usersResolvers.Mutation,
		...reservationsResolvers.Mutation
	},
	Subscription: {
		...reservationsResolvers.Subscription
	  }
};
