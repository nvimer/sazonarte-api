import {
  ExtractJwt,
  Strategy as JwtStrategy,
  StrategyOptions,
  VerifyCallback,
} from "passport-jwt";
import userService from "../api/v1/users/user.service";
import { PayloadInput } from "../api/v1/auth/tokens/token.validation";

// define the options for strategy jwt
// extract the jwt form header
const options: StrategyOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme("jwt"),
  secretOrKey: String(process.env.JWT_SECRET),
  // can user issuer and audience ofr major security
  // issuer:
  // audience:
};

// Create a callback for verify user. Pass the payload with id of user.
// if user exists, return the payload, if not found user, return error
const jwtVerify: VerifyCallback = async (payload: PayloadInput, done) => {
  userService.findById(payload.sub).then((user) => {
    if (user) {
      done(null, payload);
    } else {
      done(null, false);
    }
  });
};

// configure strategy with the object decodified of jwt
export const jwtStrategy = new JwtStrategy(options, jwtVerify);
