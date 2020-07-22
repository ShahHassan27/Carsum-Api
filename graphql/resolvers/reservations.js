const { UserInputError } = require("apollo-server");
const moment = require("moment");

const Reservation = require("../../models/Reservation");
const checkAuth = require("../../util/check-auth");

module.exports = {
  Query: {
    async getReservations() {
      try {
        const reservations = await Reservation.find().sort({ index: 1 });
        return reservations;
      } catch (err) {
        throw new Error(err);
      }
    },
  },
  Mutation: {
    async createReservation(
      _,
      { reservationInput: { time, createdAt } },
      context
    ) {
      const user = checkAuth(context);

      if (time.trim() === "") {
        throw new Error("Reservation time must not be empty");
      }

      const slots = Object.keys(
        await Reservation.find({
          createdAt: { $eq: createdAt },
          time: { $eq: time },
        })
      ).length;

      const alreadyRegistered = await Reservation.findOne({
        user: user.id,
        time: { $eq: time },
        createdAt: { $eq: createdAt },
      });

      const registeredSlots = slots + 1;

      const dayOfWeek = moment(createdAt, "dddd[,] MMMM DD[,] YYYY").format(
        "dddd"
      );

      if (dayOfWeek === "Saturday") {
        rem = 4;
      } else {
        rem = 2;
      }

      const isAvailable = rem - registeredSlots;

      if (alreadyRegistered !== null) {
        throw new UserInputError("You have already registerd this slot", {
          errors: {
            body: "Slot already booked by user",
          },
        });
      }

      if (isAvailable === -1) {
        throw new UserInputError(
          "We are Booked. Please choose another time slot.",
          {
            errors: {
              body: "No available slots",
            },
          }
        );
      }

      const newReservation = new Reservation({
        firstName: user.firstName,
        lastName: user.lastName,
        createdAt,
        time,
        remaining: rem - registeredSlots,
        user: user.id,
      });

      const reservation = await newReservation.save();

      context.pubsub.publish("NEW_RESERVATION", {
        newReservation: reservation,
      });

      return reservation;
    },
  },
  Subscription: {
    newReservation: {
      subscribe: (_, __, { pubsub }) => pubsub.asyncIterator("NEW_RESERVATION"),
    },
  },
};
