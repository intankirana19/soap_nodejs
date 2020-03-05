
const _ = require('lodash');

const config = require('./config.json');
const defaultConfig = config.development;

const environment = process.env.NODE_ENV || 'local';

const environmentConfig = config[environment];
const finalConfig = _.merge(defaultConfig, environmentConfig);

global.gConfig = finalConfig;


console.log(`Config: ${JSON.stringify(global.gConfig, undefined, global.gConfig.json_indentation)}`);