// We use console.log() in this generator because we want to print on stdout not on
// stderr unlike yeoman's log() so that user can easily redirect output to a file.
/* eslint-disable no-console */
/**
 * Copyright 2013-2023 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import chalk from 'chalk';
import type { ExecaReturnValue } from 'execa';

import BaseApplicationGenerator from '../base-application/index.mjs';
import JSONToJDLEntityConverter from '../../jdl/converters/json-to-jdl-entity-converter.js';
import JSONToJDLOptionConverter from '../../jdl/converters/json-to-jdl-option-converter.js';
import type { JHipsterGeneratorFeatures, JHipsterGeneratorOptions } from '../base/api.mjs';
import { YO_RC_FILE } from '../generator-constants.mjs';
import { replaceSensitiveConfig } from './support/utils.mjs';

export default class InfoGenerator extends BaseApplicationGenerator {
  constructor(args: string | string[], options: JHipsterGeneratorOptions, features: JHipsterGeneratorFeatures) {
    super(args, options, {
      jhipsterBootstrap: false,
      storeJHipsterVersion: false,
      customInstallTask: true,
      customCommitTask: true,
      ...features,
    });
  }

  get [BaseApplicationGenerator.INITIALIZING]() {
    return this.asInitializingTaskGroup({
      sayHello() {
        this.log.log(chalk.white('Welcome to the JHipster Information Sub-Generator\n'));
      },

      async checkJHipster() {
        try {
          const { stdout } = await this.spawnCommand('npm list generator-jhipster', { stdio: 'pipe' });
          console.log(`\n\`\`\`\n${stdout}\`\`\`\n`);
        } catch (error) {
          console.log(`\n\`\`\`\n${(error as any).stdout}\`\`\`\n`);
        }
      },

      displayConfiguration() {
        // Omit sensitive information.
        const yoRc = this.readDestinationJSON(YO_RC_FILE);
        if (yoRc) {
          const result = JSON.stringify(replaceSensitiveConfig(yoRc), null, 2);
          console.log(`\n##### **JHipster configuration, a \`${YO_RC_FILE}\` file generated in the root folder**\n`);
          console.log(`\n<details>\n<summary>${YO_RC_FILE} file</summary>\n<pre>\n${result}\n</pre>\n</details>\n`);
        } else {
          console.log('\n##### **JHipster configuration not found**\n');
        }

        if (this.jhipsterConfig.packages && this.jhipsterConfig.packages.length > 0) {
          for (const pkg of this.jhipsterConfig.packages) {
            const yoRc = this.readDestinationJSON(this.destinationPath(pkg, YO_RC_FILE));
            if (yoRc) {
              const result = JSON.stringify(replaceSensitiveConfig(yoRc), null, 2);
              console.log(`\n<details>\n<summary>${YO_RC_FILE} file for ${pkg}</summary>\n<pre>\n${result}\n</pre>\n</details>\n`);
            } else {
              console.log(`\n##### **JHipster configuration for ${pkg} not found**\n`);
            }
          }
        }
      },

      async checkJava() {
        console.log('\n##### **Environment and Tools**\n');
        await this.checkCommand('java', ['-version'], ({ stderr }) => console.log(stderr));
        console.log();
      },

      async checkGit() {
        await this.checkCommand('git', ['version']);
        console.log();
      },

      async checkNode() {
        await this.checkCommand('node', ['-v'], ({ stdout }) => console.log(`node: ${stdout}`));
      },

      async checkNpm() {
        await this.checkCommand('npm', ['-v'], ({ stdout }) => console.log(`npm: ${stdout}`));
        console.log();
      },

      async checkDocker() {
        await this.checkCommand('docker', ['-v']);
      },

      checkApplication() {
        if (this.jhipsterConfig.baseName === undefined) {
          this.log.warn("Current location doesn't contain a valid JHipster application");
          this.cancelCancellableTasks();
        }
      },

      displayEntities() {
        console.log('\n##### **JDL for the Entity configuration(s) `entityName.json` files generated in the `.jhipster` directory**\n');
        const jdl = this.generateJDLFromEntities();
        console.log('<details>\n<summary>JDL entity definitions</summary>\n');
        console.log(`<pre>\n${jdl?.toString()}\n</pre>\n</details>\n`);
      },
    });
  }

  async checkCommand(command: string, args: string[], printInfo = ({ stdout }: ExecaReturnValue<string>) => console.log(stdout)) {
    try {
      printInfo(await this.spawnCommand(command, args, { stdio: 'pipe' }));
    } catch (_error) {
      console.log(chalk.red(`'${command}' command could not be found`));
    }
  }

  /**
   * @returns generated JDL from entities
   */
  generateJDLFromEntities() {
    let jdlObject;
    const entities = new Map();
    try {
      this.getExistingEntities().forEach(entity => {
        entities.set(entity.name, entity.definition);
      });
      jdlObject = JSONToJDLEntityConverter.convertEntitiesToJDL({
        entities,
      });
      JSONToJDLOptionConverter.convertServerOptionsToJDL({ 'generator-jhipster': this.config.getAll() }, jdlObject);
    } catch (error) {
      this.log.error('Error while parsing entities to JDL', error);
      throw new Error('\nError while parsing entities to JDL\n', { cause: error });
    }
    return jdlObject;
  }
}
