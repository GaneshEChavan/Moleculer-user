"use strict";
const _ = require("lodash")
const ApiGateway = require("moleculer-web");
const { UnAuthorizedError } = ApiGateway.Errors;

require("dotenv").config();

module.exports = {
	name: "api",
	mixins: [ApiGateway],

	// More info about settings: https://moleculer.services/docs/0.13/moleculer-web.html
	settings: {
		port: process.env.PORT || 4003,

		routes: [{
			path: "/api",
			// authorization: true,
			whitelist: [
				// Access to any actions in all services under "/api" URL
				"**"
			],
			aliases: {
				"POST /user/register": "users.register",
				"POST /user/login": "users.login"
			},
			cors: true,
			bodyParsers: {
				json: {
					strict: false
				},
				urlencoded: {
					extended: false
				}
			}
			
		}],

		// Serve assets from "public" folder
		assets: {
			folder: "public"
		},
	},

	methods: {
		// authorize(ctx, route, req) {
		// 	let token;
		// 	if (req.headers.authorization) {
		// 		let type = req.headers.authorization.split(" ")[0];
		// 		if (type === "Token" || type === "Bearer")
		// 			token = req.headers.authorization.split(" ")[1];
		// 	}

		// 	return this.Promise.resolve(token)
		// 		.then(token => {
		// 			if (token) {
		// 				// Verify JWT token
		// 				return ctx.call("users.resolveToken", { token })
		// 					.then(user => {
		// 						if (user) {
		// 							this.logger.info("Authenticated via JWT: ", user.username);
		// 							// Reduce user fields (it will be transferred to other nodes)
		// 							ctx.meta.user = _.pick(user, ["_id", "username", "email", "image"]);
		// 							ctx.meta.token = token;
		// 						}
		// 						return user;
		// 					})
		// 					.catch(err => {
		// 						// Ignored because we continue processing if user is not exist
		// 						return null;
		// 					});
		// 			}
		// 		})
		// 		.then(user => {
		// 			if (req.$endpoint.action.auth == "required" && !user)
		// 				return this.Promise.reject(new UnAuthorizedError());
		// 		});
		// }
	}
};
