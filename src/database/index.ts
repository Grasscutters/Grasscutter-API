import mongoose from 'mongoose';
import chalk from 'chalk';
import Logger from '../utils/logger';

mongoose.connection.on('connecting', function() {
    Logger.log("info", chalk.red("[MongoDB] ") + chalk.blueBright("Trying to establish a connection to the MongoDB database"));
});

mongoose.connection.on('connected', function() {
    Logger.log("info", chalk.red("[MongoDB] ") + chalk.greenBright("Connection to the MongoDB database has been successfully established"));
});

mongoose.connection.on('error', function(err) {
    Logger.log("error", chalk.red("[MongoDB] ") + chalk.redBright("Connection to the MongoDB database failed: " + err));
});

mongoose.connection.on('disconnected', function() {
    Logger.log("warn", chalk.red("[MongoDB] ") + chalk.redBright("Connection to the MongoDB database has been closed"));
});

export const connect = async (connectionURL) => {
    await mongoose.connect(connectionURL, <mongoose.ConnectOptions> { useNewUrlParser: true, useUnifiedTopology: true, keepAlive: true }).catch();
};

export const connection = () => {
    return mongoose.connection;
};