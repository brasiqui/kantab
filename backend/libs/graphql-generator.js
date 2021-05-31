"use strict";

module.exports = {
	generateType(name, schema) {
		const res = [`type ${name} {`];

		if (schema.settings.fields) {
			const entries = Object.entries(schema.settings.fields);
			entries.forEach(([name, field], idx) => {
				let type = field.graphqlType || field.type || "string";

				if (["string", "boolean"].includes(type))
					type = type.slice(0, 1).toUpperCase() + type.slice(1);

				if (type == "number") type = "Int";

				// Skip not-well defined fields
				if (type == "object" && !field.properties) return;
				if (type == "array" && !field.items) return;

				if (field.type == "array") type = `[${type}]`;
				if (field.required) type += "!";

				res.push(`  ${name}: ${type}${idx < entries.length - 1 ? "," : ""}`);
			});
		}

		res.push("}");

		return res.join("\n");
	}
};
