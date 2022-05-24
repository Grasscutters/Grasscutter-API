var systemUser = {
	_id: "SYSTEM",
	username: "System",
	email: "api@grasscutters.xyz",
	password: "no.",
	activated: "activated",
	permissionLevel: "system"
};

var Settings = [
	{
		_id: "REGISTRATION_ENABLED",
		value: "TRUE",
		type: "boolean",
	},
	{
		_id: "MAINTENANCE_MODE",
		value: "FALSE",
		type: "boolean",
	},
    {
        _id: "PLUGINS_UPLOAD_ENABLED",
        value: "TRUE",
        type: "boolean"
    },
	{
		_id: "CULTIVATION_GAMEVERSION",
		value: "2.6",
		type: "float"
	},
	{
		_id: "CULTIVATION_BGFILE",
		value: "",
		type: "string"
	}
];

export default { Settings, systemUser }