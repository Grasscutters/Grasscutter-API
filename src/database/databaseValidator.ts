const chalk = require("chalk");
import Logger from "../utils/logger";

import Users from "./model/users";
import Settings from "./model/settings";
import DataDefaults from "./DataDefaults";

export async function checkIfPopulated(_next) {
	ConsoleLog("info", "Checking data");

	const systemUser = await Users.findById(DataDefaults.systemUser._id);

	if (!systemUser) {
		ConsoleLog("info", "System user not found... Attempting creation...");
		createSystemUser();
	} else {
		ConsoleLog("info", "System user exists");
	}

	DataDefaults.Settings.forEach(async (setting) => {
		await checkSettings(setting);
	});

	_next();
}

async function createSystemUser() {
	const user = new Users(DataDefaults.systemUser);

	user.save()
		.then(async () => {
			ConsoleLog("info", chalk.greenBright("Administrator User Created..."));
		})
		.catch((error) => {
			ConsoleLog("warn", chalk.redBright("Error creating administrator user... ") + "\n" + error + "\n");
			ConsoleLog("error", chalk.redBright("Unable to continue due to missing database data... Shutting down..."));
			process.exit(1);
		});
}

async function checkSettings(data) {
	const setting = await Settings.findOne({ _id: data._id });
	if (!setting) {
		ConsoleLog("info", chalk.greenBright(`Setting ${data._id} not found...`));
		const newSetting = new Settings(data);

		newSetting
			.save()
			.then(() => {
				ConsoleLog("info", chalk.greenBright(`Created setting ${data._id}...`));
			})
			.catch((error) => {
				ConsoleLog("warn", chalk.redBright(`Error creating ${data._id} user... `) + "\n" + error + "\n");
				ConsoleLog("error", chalk.redBright("Unable to continue due to missing database data... Shutting down..."));
				process.exit(1);
			});
	} else {
		ConsoleLog("info", chalk.greenBright(`Setting ${data._id} has been found.`));
	}
}

function ConsoleLog(level, data) {
	Logger.log(level, chalk.blueBright("[Database] ") + data);
}
