const { promises: fs } = require('fs');
const path = require('path');
const ymlParser = require('yaml');

const l = console.log;
const e = console.error;
const keys = Object.keys;

const enableLogs = true;
const yellowTextColor = '\x1b[32m';
const resetTextColor = '\x1b[0m';
const logger = (
  (enableLogs) => enableLogs ?
    (...message) => l(yellowTextColor, 'LOGGER', resetTextColor, ...message, "\n") :
    () => {}
)(enableLogs);

//

const servicesDirLevel = '.';
const defaultServicesDirname = 'services';
const defaultServicesEnvFilename = 'env.yml';
const defaultOutputFileFormat = '.env';
const defaultMainOutputDir = 'deployment';
const OUTPUT_DIRS = new Map([
  ['dev', 'dev'],
  ['test', 'test'],
  ['production', 'master'],
]);
const EXCLUDE_ENVS = ['empty', 'local'];

const {
  SERVICES_DIR = defaultServicesDirname,
  YML_FILENAME = defaultServicesEnvFilename,
  OUTPUT_FORMAT = defaultOutputFileFormat,
  MAIN_OUTPUT_DIR = defaultMainOutputDir,
} = process.env;


const servicesDirname = SERVICES_DIR;
const servicesEnvFilename = YML_FILENAME;
const mainOutputDir = MAIN_OUTPUT_DIR;
const outputFileFormat = OUTPUT_FORMAT;
const excludedEnvs = EXCLUDE_ENVS;
const env_dir = OUTPUT_DIRS;
const servicesEnvFilePath = path.join(servicesDirLevel, servicesDirname, servicesEnvFilename);

logger('input config: ', {
  servicesEnvFilePath,
  outputFileFormat,
  mainOutputDir,
  excludedEnvs,
  env_dir
});

// 

const sortVarsByServices = (config, excludedEnvs = []) => {
  const excluders = {
    'empty': (envName, envValue, variableName) => (!envValue),
    'local': (envName, envValue, variableName) => (envName === 'local'),
  };
  const actualExcluders = excludedEnvs.reduce((acc, name) =>
    excluders.hasOwnProperty(name) ? [...acc, excluders[name]] : acc, []);

  const result = keys(config).reduce((allServicesAcc, variableName) => {
    const { environments, services } = config[variableName];

    const filteredEnvs = keys(environments).reduce((acc, envName) => {
      const envValue = environments[envName];
      const canBeExcluded = actualExcluders.some((handler) =>
        handler(envName, envValue, variableName));
      const newAcc = canBeExcluded ? {} : { [envName]: [`${variableName}=${envValue}`] };

      return { ...acc, ...newAcc };
    }, {});

    const newAllServices = services.reduce((servicesAcc, serviceName) => {
      if (!servicesAcc.hasOwnProperty(serviceName)) {
        return {
          ...servicesAcc,
          [serviceName]: filteredEnvs
        };
      }

      const { [serviceName]: currentServiceEnvs, ...otherService } = servicesAcc;
      const updatedServiceEnvs = keys(filteredEnvs).reduce((acc, envName) => {
        const currentEnvVars = currentServiceEnvs[envName];
        const newEnvVar = filteredEnvs[envName];
        const newAcc = { [envName]: [...currentEnvVars, ...newEnvVar] };

        return { ...acc, ...newAcc };
      }, {});

      return {
        ...otherService,
        [serviceName]: updatedServiceEnvs
      };
    }, allServicesAcc);

    return newAllServices;
  }, {});

  return result;
};

//

fs.readFile(servicesEnvFilePath, 'utf8')
  .then(ymlParser.parse)
  .then(variables => sortVarsByServices(variables, excludedEnvs))
  .then(services => Promise.all(
    keys(services).map((serviceName) => {
      const serviceEnvsDir = path.join(servicesDirLevel, servicesDirname, serviceName, mainOutputDir);
      const serviceEnvs = services[serviceName];

      return Promise.all(
        keys(serviceEnvs).map((envName) => {
          const envDirName = env_dir.get(envName);
          const envDirPath = path.join(serviceEnvsDir, envDirName);
          const fileName = serviceName + '.' + envName + outputFileFormat;
          const outputFilePath = path.join(envDirPath, fileName);
          const fileContent = serviceEnvs[envName];
          const fileContentAsString = fileContent.join("\n");

          return fs.writeFile(outputFilePath, fileContentAsString)
            .then(() => fileName);
        })
      )
        .then((createdFiles) => ({ [serviceName]: createdFiles }));
    })
  ))
  .then((createdFilesByServices) => logger('SUCCESED: output files', createdFilesByServices))
  .catch(e);

