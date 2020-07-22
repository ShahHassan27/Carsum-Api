const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { UserInputError } = require('apollo-server');

const { validateRegisterInput, validateLoginInput } = require('../../util/validators');
const { SECRET_KEY } = require('../../config');
const User = require('../../models/User');

function generateToken(user) {
	return jwt.sign(
		{
			id: user.id,
			email: user.email,
			firstName: user.firstName,
			lastName: user.lastName
		},
		SECRET_KEY,
		{ expiresIn: '1h' }
	);
}

module.exports = {
	Mutation: {
		async login(_, { email, password }) {
			const { valid, errors } = validateLoginInput(email, password);

			if (!valid) {
				throw new UserInputError('Validation error', { errors });
			}
			const user = await User.findOne({ email });

			if (!user) {
				errors.general = 'User not found in database';
				throw new UserInputError('User not found in database', { errors });
			}

			const match = await bcrypt.compare(password, user.password);

			if (!match) {
				errors.general = 'Wrong credentials';
				throw new UserInputError('Wrong credentials', { errors });
			}

			const token = generateToken(user);

			return {
				...user._doc,
				id: user._id,
				token
			};
		},

		async register(_, { registerInput: { firstName, lastName, email, password } }) {
			const { valid, errors } = validateRegisterInput(firstName, lastName, email, password);

			if (!valid) {
				throw new UserInputError('Validation Error', { errors });
			}

			const user = await User.findOne({ email });

			if (user) {
				throw new UserInputError('User already exists', {
					errors: {
						email: 'This email is already registered'
					}
				});
			}

			password = await bcrypt.hash(password, 11);

			const newUser = new User({
				email,
				firstName,
				lastName,
				password,
				createdAt: new Date().toISOString()
			});

			const res = await newUser.save();

			const token = generateToken(res);

			return {
				...res._doc,
				id: res._id,
				token
			};
		}
	}
};
