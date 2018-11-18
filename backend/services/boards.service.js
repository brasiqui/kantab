"use strict";

const _ 				= require("lodash");

const DbService 		= require("../mixins/db.mixin");
const CacheCleaner 		= require("../mixins/cache.cleaner.mixin");
const ConfigLoader 		= require("../mixins/config.mixin");
const SecureID 			= require("../mixins/secure-id.mixin");
//const { MoleculerRetryableError, MoleculerClientError } = require("moleculer").Errors;

/**
 * Boards service
 */
module.exports = {
	name: "boards",
	version: 1,

	mixins: [
		DbService("boards"),
		CacheCleaner([
			"cache.clean.boards",
			"cache.clean.accounts"
		]),
		SecureID(),
		ConfigLoader([
		])
	],

	/**
	 * Service dependencies
	 */
	dependencies: [
		{ name: "accounts", version: 1 }
	],

	/**
	 * Service settings
	 */
	settings: {
		fields: {
			id: { type: "string", readonly: true, primaryKey: true, secure: true, columnName: "_id" },
			owner: { required: true, populate: {
				action: "v1.accounts.resolve",
				fields: ["id", "username", "firstName", "lastName", "avatar"]
			}, set: (value, entity, ctx) => entity.owner || ctx.meta.user.id },
			title: { type: "string", required: true, trim: true },
			slug: { type: "string", readonly: true, set: (value, entity, ctx) => `${entity.title}-slug` },
			description: "string",
			position: { type: "number", hidden: true, default: 0 },
			archived: { type: "boolean", default: false },
			stars: { type: "number", default: 0 },
			labels: { type: "array" },
			members: { type: "array" },
			options: { type: "object" },
			createdAt: { type: "date", readonly: true, setOnCreate: () => Date.now() },
			updatedAt: { type: "date", readonly: true, setOnUpdate: () => Date.now() },
			archivedAt: { type: "date" },
			deletedAt: { type: "date", setOnDelete: () => Date.now() },
		},
		strict: true, // TODO
		softDelete: true, // TODO

		graphql: {
			type: `
				type Board {
					id: String!,
					title: String!,
					slug: String,
					description: String,
					owner: User,
					createdAt: Float
				}
			`,
			resolvers: {
				Board: {
					owner(parent, args, context) {
						return context.ctx.call("v1.accounts.get", { id: parent.owner });
					}/*
					owner: {
						action: "v1.accounts.get",
						rootParams: {
							"owner": "id"
						}
					}*/
				}
			},
		}
	},

	/**
	 * Actions
	 */
	actions: {
		create: {
			permissions: ["boards.create"],
			graphql: {
				mutation: "createBoard(title: String!, description: String): Board"
			}
		},
		list: {
			permissions: ["boards.read"]
		},
		find: {
			permissions: ["boards.read"],
			graphql: {
				query: "boards(limit: Int, offset: Int, sort: String): [Board]"
			}
		},
		get: {
			needEntity: true,
			permissions: [
				"boards.read",
				"$owner"
			],
			graphql: {
				query: "board(id: String!): Board"
			}
		},
		update: {
			needEntity: true,
			permissions: [
				"administrator",
				"$owner"
			]
		},
		remove: {
			needEntity: true,
			permissions: [
				"administrator",
				"$owner"
			]
		},
	},

	/**
	 * Events
	 */
	events: {

	},

	/**
	 * Methods
	 */
	methods: {
		/**
		 * Internal method to check the owner of entity. (called from CheckPermission middleware)
		 *
		 * @param {Context} ctx
		 * @returns {Promise<Boolean>}
		 */
		async isEntityOwner(ctx) {
			return !!(ctx.entity && ctx.entity.owner == ctx.meta.userID);
		}
	},

	/**
	 * Service created lifecycle event handler
	 */
	created() {
	},

	/**
	 * Service started lifecycle event handler
	 */
	started() {
	},

	/**
	 * Service stopped lifecycle event handler
	 */
	stopped() {

	}
};
