import {
  ExtractJwt,
  Strategy as JwtStrategy,
  StrategyOptions,
  VerifyCallback,
} from "passport-jwt";
import userService from "../api/users/user.service";
import { PayloadInput } from "../api/auth/tokens/token.validation";
import { config } from "../config";

// define the options for strategy jwt
// extract the jwt form header
const options: StrategyOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: config.jwtSecret,
  // can user issuer and audience ofr major security
  // issuer:
  // audience:
};

// Create a callback for verify user. Pass the payload with id of user.
// if user exists, return the user with his roles and permissions, if not found user, return error
const jwtVerify: VerifyCallback = async (payload: PayloadInput, done) => {
  userService.findUserWithRolesAndPermissions(payload.sub).then((user) => {
    if (user) {
      done(null, user);
    } else {
      done(null, false);
    }
  });
};

// configure strategy with the object decodified of jwt
export const jwtStrategy = new JwtStrategy(options, jwtVerify);
