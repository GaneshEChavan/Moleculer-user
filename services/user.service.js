"use strict"
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const objectId = require("mongodb").ObjectID;
const moleculerAdapter = require("moleculer-db-adapter-mongoose");
const DbService = require("moleculer-db");
const { MoleculerClientError } = require("moleculer").Errors;
const { validationError } = require("moleculer").Errors;
const userSchema = require("../models/user")
require("dotenv").config()

module.exports = {
    name: "users",
    mixins: [DbService],

    adapter: new moleculerAdapter(process.env.MONGO_PORT),

    model: userSchema,
    settings: {
        JWT_SECRET: process.env.JWT_SECRET,
        fields: ["firstName", "lastName", "email", "contact", "github"],
        entityValidator: {
            firstName: { type: "string" },
            lastName: { type: "string" },
            contact: { type: "string", min: 10, max: 10 },
            email: { type: "email" },
            github: { type: "string" },
            password: { type: "string" }
        }
    },
    dependencies: [],

    actions: {
        register: {
            params: {
                user: {
                    type: "object", props: {
                        firstName: { type: "string" },
                        lastName: { type: "string" },
                        contact: { type: "string" },
                        email: { type: "email" },
                        github: { type: "string" },
                        password: { type: "string" }
                    }
                }
            },
            handler(ctx) {
                let entity = ctx.params.user;
                return this.validateEntity(entity)
                    .then(() => {
                        if (entity.email) {
                            return userSchema.find({ email: entity.email }).then(found => {
                                if (found.length > 0) {
                                    return Promise.reject(new MoleculerClientError("Email is Exists", 422, "", [{ field: "email", message: "is exist" }]));
                                }
                            })
                        }
                    })
                    .then(() => {
                        let userData = new userSchema({
                            firstName: entity.firstName,
                            lastName: entity.lastName,
                            contact: entity.contact,
                            email: entity.email,
                            github: entity.github || null,
                            password: bcrypt.hashSync(entity.password, 8)
                        })
                        return userData.save().then(data => {
                            console.log("data saved to DB", data);
                            return Promise.resolve(data)
                        })
                    })
            }
        },

        login: {
            params: {
                user: {
                    type: "object", props: {
                        email: { type: "email" },
                        password: { type: "string" }
                    }
                }
            },
            handler(ctx) {
                let { email, password } = ctx.params.user;
                return new this.Promise((res, rej) => {
                    userSchema.findOne({ email }).then(found => {
                        bcrypt.compare(password, found.password).then(async responce => {
                            if (responce === true) {
                                let token = await this.generateJWT(found)

                                res({ status: true, message: "user logged in", data: { found, token } })
                            } else {
                                rej(new MoleculerClientError("Email or password is invalid!", 422, "", [{ field: "email", message: "is not found" }]))
                            }
                        })
                    })
                })
            }
        },



        resolveToken: {
            // cache: {
            // 	keys: ["token"],
            // 	ttl: 60 * 60 // 1 hour
            // },			
            params: {
                token: "string"
            },
            handler(ctx) {
                return new this.Promise((res, rej) => {
                    console.log("in user.service--------------->115")
                    jwt.verify(ctx.params.token, this.settings.JWT_SECRET, (err, decoded) => {
                        if (err) {
                            rej(err);
                        } else {
                            res(decoded);
                        }
                    });

                })
            }
        },
    },

    methods: {
		/**
		 * Generate a JWT token from user entity
		 * 
		 * @param {Object} user 
		 */
        async generateJWT(user) {
            let payload = {
                id: user._id,
                email: user.email,
            }
            let token = jwt.sign(payload, this.settings.JWT_SECRET);
            return token
        }
    }
}