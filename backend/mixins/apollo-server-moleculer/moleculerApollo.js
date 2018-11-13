"use strict";

const { MoleculerClientError } = require("moleculer").Errors;
const { runHttpQuery, convertNodeHttpToRequest } = require("apollo-server-core");
const url = require("url");

// Utility function used to set multiple headers on a response object.
function setHeaders(res, headers) {
	Object.keys(headers).forEach(header => res.setHeader(header, headers[header]));
}

module.exports = function graphqlMoleculer(options) {
	if (!options) {
		throw new Error("Apollo Server requires options.");
	}

	if (arguments.length > 1) {
		throw new Error(
			`Apollo Server expects exactly one argument, got ${arguments.length}`,
		);
	}

	return async function graphqlHandler(req, res) {
		let query;
		try {
			if (req.method === "POST")
				query = req.filePayload || req.body;
			else
				query = url.parse(req.url, true).query;
		} catch (error) {
			// Do nothing; `query` stays `undefined`
		}

		try {

			if (query && query.length > 2000) {
				// None of our app's queries are this long
				// Probably indicates someone trying to send an overly expensive query
				throw new MoleculerClientError("Query too large.", 400, "QUERY_TOO_LARGE");
			}

			const { graphqlResponse, responseInit } = await runHttpQuery([req, res], {
				method: req.method,
				options,
				query,
				request: convertNodeHttpToRequest(req),
			});

			setHeaders(res, responseInit.headers);

			return graphqlResponse;

		} catch (error) {
			if ("HttpQueryError" === error.name && error.headers) {
				setHeaders(res, error.headers);
			}

			if (!error.statusCode) {
				error.statusCode = 500;
			}

			// TODO
			res.statusCode = error.statusCode || error.code || 500;
			res.end(error.message);

			return undefined;
		}
	};
};
