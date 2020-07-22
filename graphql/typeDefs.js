const { gql } = require('apollo-server');

module.exports = gql`
	input RegisterInput {
		firstName: String!
		lastName: String!
		password: String!
		email: String!
	}

	input ReservationInput {
		time: String!
		createdAt: String!
	}

	type Reservation {
		firstName: String!
		lastName: String!
		createdAt: String!
		time: String!
		remaining: Int!
		user:String!
	}

	type User {
		id: ID!
		email: String!
		token: String!
		firstName: String!
		lastName: String!
		createdAt: String!
	}

	type Query {
		getReservations: [Reservation]
	}

	type Mutation {
		register(registerInput: RegisterInput): User!
		login(email: String!, password: String!): User!
		createReservation(reservationInput: ReservationInput): Reservation!
	}

	type Subscription {
		newReservation: Reservation!
	  }
`;
